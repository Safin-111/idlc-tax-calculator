/*
 * ui-full.js — Website, Full calculator screen ("Five questions. Then your tax.").
 * Reads the answers, asks IDLC_TAX_ENGINE, writes the result. No tax maths here.
 * Words come from js/strings.js.
 */
(function (root) {
  'use strict';

  var U = root.IDLC_UI, E = U.E, F = U.F, R = U.R, I = U.I, t = U.t, tk = U.tk, num = U.num, pct = U.pct, esc = U.esc;
  var doc = root.document;
  function $(id) { return doc.getElementById(id); }

  // Sample answers so the screen starts filled in (same as the D1 test case)
  var state = {
    category: 'general', moreOpen: false, parent: false, children: 1,
    salary: 1200000, other: 0, otherOpen: false,
    invMode: 'list', invTotal: 0, inv: { dps: 60000, providentFund: 72000 }, listOpen: false,
    wealthYes: false, netWealth: 0, cars: 0, sqft: 0,
    filing: 'octDec'
  };

  var MAIN_CATS = ['general', 'womanOr65'];
  var EXTRA_CATS = Object.keys(R.thresholds).filter(function (id) { return MAIN_CATS.indexOf(id) < 0; });

  function chip(label, pressed, attrs) {
    return '<button type="button" class="chip" aria-pressed="' + (pressed ? 'true' : 'false') + '"' + (attrs || '') + '>' + esc(label) + '</button>';
  }
  function isPassed(id) { return R.years.full.passedFilingPeriods.indexOf(id) >= 0; }

  // ---------- labels that depend on language ----------
  function renderStatic() {
    var y = R.years.full;
    $('year-line').textContent = t('f.sub', { ay: U.ayLabel(y), range: U.rangeLabel(y) });
    $('wealth-q').textContent = t('f.q4', {
      w: U.compact(R.surcharge.wealthBands[0].over),
      cars: U.loc(String(R.surcharge.carsMoreThan + 1)),
      sqft: num(R.surcharge.houseSqftMoreThan)
    });
    $('parent-note').textContent = t('f.parentNote', { amount: tk(R.disabledChildAllowance) });
    $('foot-main').textContent = t('f.foot', { ay: U.ayLabel(y) });
  }

  // ---------- chips ----------
  function renderChips() {
    var extraActive = EXTRA_CATS.indexOf(state.category) >= 0 || state.parent;
    $('cat-chips').innerHTML =
      MAIN_CATS.map(function (id) { return chip(I.g('categoriesShort', id), state.category === id, ' data-cat="' + id + '"'); }).join('') +
      chip(t('f.more'), extraActive || state.moreOpen, ' data-more="1" aria-expanded="' + state.moreOpen + '"');
    $('cat-extra-chips').innerHTML = EXTRA_CATS.map(function (id) {
      return chip(I.g('categoriesShort', id), state.category === id, ' data-cat="' + id + '"');
    }).join('');
    $('cat-more').hidden = !state.moreOpen;

    $('wealth-chips').innerHTML = chip(t('f.no'), !state.wealthYes, ' data-wealth="no"') + chip(t('f.yes'), state.wealthYes, ' data-wealth="yes"');
    $('wealth-box').hidden = !state.wealthYes;

    $('filing-chips').innerHTML = R.filingPeriods.map(function (p) {
      var label = I.g('filing', p.id);
      if (p.kind === 'charge') label += ' · +' + pct(p.rate);
      if (p.kind === 'discount') label += isPassed(p.id) ? ' · ' + t('f.passed') : ' · −' + pct(p.rate);
      return isPassed(p.id)
        ? '<button type="button" class="chip" aria-pressed="false" aria-disabled="true" title="' + esc(t('f.passedTip')) + '">' + esc(label) + '</button>'
        : chip(label, state.filing === p.id, ' data-filing="' + p.id + '"');
    }).join('');
  }

  // ---------- investments list ----------
  function buildInvList() {
    $('inv-list').innerHTML = R.investmentTypes.map(function (it) {
      return '<div class="invrow"><label for="inv-' + it.id + '">' + esc(I.g('investTypes', it.id)) + '</label>' +
        '<input class="input" id="inv-' + it.id + '" data-inv="' + it.id + '" inputmode="numeric" autocomplete="off" placeholder="Tk 0">' +
        '<span class="invrow__cap" id="cap-' + it.id + '"></span></div>';
    }).join('');
    R.investmentTypes.forEach(function (it) {
      var el = $('inv-' + it.id);
      U.setMoney(el, state.inv[it.id] || 0);
      U.bindMoney(el, function (v) {
        state.invMode = 'list';
        state.inv[it.id] = v;
        update();
      });
    });
  }
  function syncInvTotal() {
    if (state.invMode === 'list') {
      var sum = 0;
      for (var k in state.inv) sum += state.inv[k] || 0;
      U.setMoney($('inv-total'), sum);
    }
  }

  // ---------- read answers → engine ----------
  function input() {
    return {
      salary: state.salary,
      otherIncome: state.otherOpen ? state.other : 0,
      category: state.category,
      disabledChildren: state.parent ? state.children : 0,
      investments: state.invMode === 'list' ? state.inv : state.invTotal,
      wealth: state.wealthYes ? { netWealth: state.netWealth, cars: state.cars, houseSqft: state.sqft } : {},
      filingPeriod: state.filing
    };
  }

  function line(l) {
    return '<div class="line' + (l.cls ? ' line--' + l.cls : '') + '"><span>' + esc(l.label) + (l.info ? ' ' + U.infoButton(l.info) : '') + '</span><span>' + l.value + '</span></div>';
  }

  function render(r) {
    $('tax-to-pay').textContent = tk(r.taxToPay);
    var rc = U.buildReceipt(r);

    $('how').innerHTML = '<div class="kicker">' + t('f.how') + '</div>' + rc.how.map(line).join('') +
      (rc.withinLimit ? '<div class="small">' + esc(rc.withinLimit) + '</div>' : '');

    $('slabs').innerHTML = '<div class="kicker">' + t('f.slabsH') + '</div>' + rc.slabs.map(line).join('') +
      line({ label: rc.slabTotal.label, value: rc.slabTotal.value, cls: 'sum' }) +
      '<div class="note">' + rc.note + '</div>';

    renderPrintAnswers(r);
  }

  function renderPrintAnswers(r) {
    var y = R.years.full;
    var cat = I.g('categories', state.category) + (state.parent ? t('f.pParent', { n: num(state.children) }) : '');
    var inv = r.investments.entered ? t('f.pInvestVal', { counted: tk(r.investments.counted), entered: tk(r.investments.entered) }) : t('f.pNone');
    var wealth = state.wealthYes ? t('f.pWealthVal', { w: tk(state.netWealth), cars: num(state.cars), sqft: num(state.sqft) }) : t('f.pNo');
    var items = [
      [t('f.pReturn'), t('f.pReturnVal', { ay: U.ayLabel(y), range: U.rangeLabel(y) })],
      [t('f.pCategory'), cat],
      [t('f.pSalary'), tk(r.salary)]
    ];
    if (r.otherIncome) items.push([t('f.pOther'), tk(r.otherIncome)]);
    items.push([t('f.pInvest'), inv], [t('f.pWealth'), wealth], [t('f.pFiling'), I.g('filing', r.filingPeriod)]);
    $('print-answers').innerHTML = items.map(function (it) { return '<dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd>'; }).join('');
  }

  function renderInvSummary(r) {
    var parts = [];
    if (state.invMode === 'list') {
      R.investmentTypes.forEach(function (it) {
        if (state.inv[it.id]) parts.push(I.g('investShort', it.id) + ' ' + num(state.inv[it.id]));
      });
    }
    $('inv-summary').textContent = parts.length ? parts.join(' · ') + ' ·' : (state.invMode === 'total' && state.invTotal ? t('f.invOne') : '');

    R.investmentTypes.forEach(function (it) {
      var el = $('cap-' + it.id);
      var found = null;
      r.investments.lines.forEach(function (l) { if (l.id === it.id) found = l; });
      var base = it.cap == null ? t('f.invNoCap') : t('f.invUpTo', { cap: U.compact(it.cap) });
      var note = it.note ? ' · ' + I.g('notes', it.note) : '';
      var capped = !!(found && found.capped);
      el.textContent = capped ? t('f.invOnly', { counted: tk(found.counted), cap: U.compact(it.cap) }) : base + note;
      el.classList.toggle('is-capped', capped);
    });
  }

  function update() {
    var r = E.fullCalculator(input());
    syncInvTotal();
    render(r);
    renderInvSummary(r);
  }

  // ---------- events ----------
  doc.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    if (b.hasAttribute('data-cat')) {
      state.category = b.getAttribute('data-cat');
      renderChips(); update();
    } else if (b.hasAttribute('data-more')) {
      state.moreOpen = !state.moreOpen;
      renderChips();
    } else if (b.hasAttribute('data-wealth')) {
      state.wealthYes = b.getAttribute('data-wealth') === 'yes';
      renderChips(); update();
    } else if (b.hasAttribute('data-filing')) {
      state.filing = b.getAttribute('data-filing');
      renderChips(); update();
    }
  });

  $('other-toggle').addEventListener('click', function () {
    state.otherOpen = !state.otherOpen;
    $('other-box').hidden = !state.otherOpen;
    this.setAttribute('aria-expanded', String(state.otherOpen));
    if (state.otherOpen) $('other').focus();
    update();
  });
  $('inv-toggle').addEventListener('click', function () {
    state.listOpen = !state.listOpen;
    $('inv-box').hidden = !state.listOpen;
    this.setAttribute('aria-expanded', String(state.listOpen));
  });

  $('parent').addEventListener('change', function () {
    state.parent = this.checked;
    $('parent-fields').hidden = !this.checked;
    renderChips(); update();
  });
  $('children').addEventListener('input', function () {
    state.children = Math.max(1, Math.floor(Number(this.value) || 1));
    update();
  });

  U.bindMoney($('salary'), function (v) { state.salary = v; update(); });
  U.bindMoney($('other'), function (v) { state.other = v; update(); });
  U.bindMoney($('inv-total'), function (v) {
    // typing a single total replaces the itemised list
    state.invMode = 'total';
    state.invTotal = v;
    state.inv = {};
    R.investmentTypes.forEach(function (it) { U.setMoney($('inv-' + it.id), 0); });
    update();
  });
  U.bindMoney($('net-wealth'), function (v) { state.netWealth = v; update(); });
  $('cars').addEventListener('input', function () { state.cars = Math.max(0, Math.floor(Number(this.value) || 0)); update(); });
  $('sqft').addEventListener('input', function () { state.sqft = Math.max(0, Number(this.value) || 0); update(); });

  $('download').addEventListener('click', function () { root.print(); });

  // ---------- start ----------
  U.init();
  buildInvList();
  U.setMoney($('salary'), state.salary);
  renderStatic();
  renderChips();
  update();

  I.onChange(function () {
    renderStatic();
    renderChips();
    update();
  });
})(window);
