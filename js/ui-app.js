/*
 * ui-app.js — the phone app. One page, several views (hash routes):
 *   start → quick → invest → callback      start → f1…f5 → result      (+ explainer bottom sheet)
 * Asks IDLC_TAX_ENGINE for every number; no tax maths here. Words come from js/strings.js.
 */
(function (root) {
  'use strict';

  var U = root.IDLC_UI, E = U.E, F = U.F, R = U.R, I = U.I;
  var t = U.t, tk = U.tk, num = U.num, pct = U.pct, esc = U.esc;
  var doc = root.document;
  var screen = doc.getElementById('screen');
  var sheet = doc.getElementById('sheet');

  var ARROW_L = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var ARROW_R = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var VIEWS = ['start', 'quick', 'invest', 'callback', 'f1', 'f2', 'f3', 'f4', 'f5', 'result'];
  var CATS = Object.keys(R.thresholds);

  // Sample answers so every screen starts filled in (same as test cases Q1 and D1)
  var S = {
    view: 'start',
    cbFrom: 'invest', cbDone: false, cbWhen: 'Morning',
    cb: { name: '', mobile: '', time: 'Morning', share: true },
    quick: { salary: 1200000, category: 'general', first: false },
    full: {
      category: 'general', parent: false, children: 1,
      salary: 1200000, other: 0,
      invMode: 'list', invTotal: 0, inv: { dps: 60000, providentFund: 72000 }, listOpen: false,
      wealthYes: false, netWealth: 0, cars: 0, sqft: 0,
      filing: 'octDec'
    }
  };

  function mv(v) { return v ? num(v) : ''; }
  function stepWord(n) { return U.loc(String(n)); }

  // ---------- engine calls ----------
  function quickRes() {
    return E.quickSaver({ salary: S.quick.salary, category: S.quick.category, firstReturn: S.quick.first });
  }
  function fullInput() {
    var f = S.full;
    return {
      salary: f.salary, otherIncome: f.other, category: f.category,
      disabledChildren: f.parent ? f.children : 0,
      investments: f.invMode === 'list' ? f.inv : f.invTotal,
      wealth: f.wealthYes ? { netWealth: f.netWealth, cars: f.cars, houseSqft: f.sqft } : {},
      filingPeriod: f.filing
    };
  }
  function fullRes() { return E.fullCalculator(fullInput()); }
  function invSum() { var s = 0; for (var k in S.full.inv) s += S.full.inv[k] || 0; return s; }

  // ---------- small building blocks ----------
  function head(title, sub, back) {
    return '<header class="ah"><button type="button" class="ah__back" data-go="' + back + '" aria-label="' + esc(t('c.back')) + '">' + ARROW_L + '</button>' +
      '<div class="ah__tx"><span class="ah__title">' + esc(title) + '</span>' + (sub ? '<span class="ah__sub">' + esc(sub) + '</span>' : '') + '</div></header>';
  }
  function fullHead(n) {
    var bars = '';
    for (var i = 1; i <= 5; i++) bars += '<span class="' + (i < n ? 'done' : i === n ? 'now' : '') + '"></span>';
    return '<header class="ah ah--col"><div class="ah__line"><button type="button" class="ah__back" data-go="' + (n === 1 ? 'start' : 'f' + (n - 1)) + '" aria-label="' + esc(t('c.back')) + '">' + ARROW_L + '</button>' +
      '<div class="ah__tx"><span class="ah__title">' + t('a.fullTitle') + '</span><span class="ah__sub">' + t('a.stepOf', { n: stepWord(n), total: stepWord(5) }) + '</span></div></div>' +
      '<div class="progress" aria-hidden="true">' + bars + '</div></header>';
  }
  function aline(l) {
    return '<div class="aline' + (l.cls ? ' aline--' + l.cls : '') + '"><span>' + esc(l.label) + (l.info ? ' ' + U.infoButton(l.info) : '') + '</span><span>' + l.value + '</span></div>';
  }
  function money(id, bind, value, small) {
    return '<div class="numfield' + (small ? ' numfield--small' : '') + '"><span>Tk</span><input id="' + id + '" data-money="' + bind + '" inputmode="numeric" autocomplete="off" value="' + mv(value) + '"></div>';
  }
  function nextBtn(n) {
    var last = n === 5;
    return '<div class="stack spacer"><button type="button" class="appbtn" data-go="' + (last ? 'result' : 'f' + (n + 1)) + '">' + t(last ? 'a.seeTax' : 'a.next') + '</button></div>';
  }

  // ---------- views ----------
  function vStart() {
    function opt(kind, go, pill, title, desc) {
      return '<button type="button" class="bigopt bigopt--' + kind + '" data-go="' + go + '"><span class="bigopt__top"><span class="pill">' + pill + '</span>' + ARROW_R + '</span>' +
        '<span class="bigopt__t">' + title + '</span><span class="bigopt__d">' + desc + '</span></button>';
    }
    return '<div class="view"><header class="ah ah--start"><img class="ah__logo" src="../assets/logo/idlc-logo-horizontal.jpg" alt="IDLC">' +
      '<button type="button" class="applang" data-lang-toggle>' + t('c.switchTo') + '</button></header>' +
      '<div class="body body--start"><div class="stack" style="gap:6px"><div class="tagline"><i></i>' + t('a.tag') + '</div><h1 class="start-h">' + t('a.startH') + '</h1></div>' +
      opt('dark', 'quick', t('a.pill1'), t('a.q1t'), t('a.q1d')) +
      opt('light', 'f1', t('a.pill2'), t('a.q2t'), t('a.q2d')) +
      '<div class="protoline spacer">' + t('a.startFoot') + '</div></div>' +
      '<p class="draftnote">' + t('c.draft') + '</p></div>';
  }

  function vQuick() {
    var q = S.quick;
    var opts = CATS.map(function (id) {
      return '<option value="' + id + '"' + (q.category === id ? ' selected' : '') + '>' + esc(I.g('categories', id)) + '</option>';
    }).join('');
    return '<div class="view">' + head(t('a.q1t'), t('a.quickSub', { range: U.rangeLabel(R.years.quick) }), 'start') +
      '<div class="body"><div class="card">' +
        '<div class="row2"><label class="lbl" for="q-salary">' + t('a.salaryLabel') + '</label>' + U.infoButton('taxFreePart') + '</div>' +
        money('q-salary', 'q.salary', q.salary) +
        '<div class="row2"><label class="lbl" for="q-cat">' + t('a.youAre') + '</label>' + U.infoButton('taxFreeLimit') +
          '<select id="q-cat" class="select2" data-sel="q.cat">' + opts + '</select></div>' +
        '<label class="chk"><input type="checkbox" data-chk="q.first"' + (q.first ? ' checked' : '') + '>' + t('q.first') + '</label>' +
      '</div><div id="q-result"></div><div class="stack spacer" id="q-actions"></div></div></div>';
  }

  function updateQuick() {
    var q = S.quick, r = quickRes(), html, actions = '';
    var full = '<button type="button" class="' + (r.status === 'canSave' ? 'applink' : 'appbtn appbtn--outline') + '" data-go-full>' + t('a.seeFull') + '</button>';
    if (q.salary <= 0) {
      html = '<div class="card card--big"><div class="kick">' + t('a.yourTax') + '</div><div class="muted">' + t('q.empty') + '</div></div>';
    } else if (r.status === 'noTax') {
      html = '<div class="card card--big"><div class="kick">' + t('a.yourTax') + '</div><div class="bigtxt">' + t('a.noTaxBig') + '</div>' +
        '<div class="muted">' + t('q.noTaxSub', { taxable: tk(r.taxable), limit: tk(r.threshold) }) + U.infoButton('taxFreeLimit') + '</div></div>';
    } else if (r.status === 'atMinimum') {
      html = '<div class="card card--big"><div class="kick">' + t('a.yourTax') + '</div><div class="bigtxt">' + t('a.minBig') + '</div>' +
        '<div class="muted">' + t('q.atMin', { amount: tk(r.taxIfNoInvest) }) + U.infoButton('minimumTax') + '</div></div>';
    } else {
      html = '<div class="card card--big"><div class="kick">' + t('a.save') + U.infoButton('rebate') + '</div>' +
        '<div class="bignum">' + tk(r.maxSaving) + '</div>' +
        '<div class="grid2"><div class="box"><small>' + t('a.ifNot') + '</small><strong style="color:#5C5C5C">' + tk(r.taxIfNoInvest) + '</strong></div>' +
        '<div class="box box--ink"><small>' + t('a.ifInvest') + '</small><strong>' + tk(r.taxIfInvest) + '</strong></div></div>' +
        '<div class="muted">' + t('a.byInvesting', { amount: tk(r.investNeeded), date: U.dateLabel(r.year.investBy) }) + U.infoButton('eligibleInvestment') + '</div>' +
        '<div class="foot2"><span>' + t('a.taxableLine', { amount: num(r.taxable) }) + U.infoButton('taxableIncome') + '</span><span>' +
          (r.maxSaving === Math.round(R.rebate.incomeRate * r.taxable) ? t('a.rebateLine', { rate: pct(R.rebate.incomeRate) }) : '') + '</span></div></div>';
      actions = '<button type="button" class="appbtn" data-go="invest">' + t('a.seeInvest') + '</button>';
    }
    doc.getElementById('q-result').innerHTML = html;
    doc.getElementById('q-actions').innerHTML = actions + full;
  }

  function vInvest() {
    var r = quickRes(), sp = E.suggestSplit(r.investNeeded), cap = U.compact(U.capOf('dps'));
    return '<div class="view">' + head(t('a.investTitle'), '', 'quick') +
      '<div class="body" style="gap:12px">' +
        '<div class="darkcard"><div><small>' + t('a.youSave') + '</small><span class="dk-big">' + tk(r.maxSaving) + '</span></div>' +
          '<div style="text-align:right"><small>' + t('a.byInv') + '</small><span class="dk-mid">' + tk(r.investNeeded) + '</span></div></div>' +
        '<div class="stepcard"><div class="stepcard__top"><span class="stepcard__k">' + t('a.step1') + '</span><span class="stepcard__amt">' + tk(sp.dps) + '</span></div>' +
          '<div class="stepcard__t">' + t('p.dps') + '</div><div class="muted">' + t('a.dpsDesc', { monthly: tk(Math.ceil(sp.dps / 12)), cap: cap }) + '</div></div>' +
        '<div class="stepcard"><div class="stepcard__top"><span class="stepcard__k">' + t('a.step2') + '</span><span class="stepcard__amt">' + tk(sp.funds) + '</span></div>' +
          '<div class="stepcard__t">' + t('p.funds') + '</div><div class="muted">' + t('a.fundsDesc') + '</div></div>' +
        '<div class="stepcard stepcard--opt"><div class="stepcard__top"><span class="stepcard__k">' + t('a.optional') + '</span><span class="stepcard__amt">' + tk(sp.shares) + '</span></div>' +
          '<div class="stepcard__t">' + t('p.shares') + '</div><div class="muted">' + t('a.sharesDesc') + '</div></div>' +
        '<div class="tiny" style="padding:0 4px">' + t('a.alsoCount') + '</div>' +
        '<div class="protoline">' + t('q.footNote') + '</div>' +
        '<div class="stack spacer no-print"><button type="button" class="appbtn" data-cbfrom="invest">' + t('a.callback') + '</button>' +
        '<button type="button" class="appbtn appbtn--outline" data-print>' + t('c.pdf') + '</button></div>' +
      '</div></div>';
  }

  function vCallback() {
    var sub, c = S.cb;
    if (S.cbFrom === 'result') {
      sub = t('cb.appSubTax', { tax: tk(fullRes().taxToPay) });
    } else {
      var q = quickRes();
      sub = q.status === 'canSave' ? t('cb.appSub', { invest: tk(q.investNeeded), save: tk(q.maxSaving) }) : t('cb.appSubNone');
    }
    var back = S.cbFrom === 'result' ? 'result' : 'invest';
    if (S.cbDone) {
      return '<div class="view">' + head(t('cb.appTitle'), '', back) +
        '<div class="body"><div class="card card--big"><h1>' + t('cb.thanksTitle') + '</h1>' +
        '<p class="sub" id="cb-thanks">' + esc(t('cb.thanks', { name: c.name, when: t('cb.when' + S.cbWhen) })) + '</p>' +
        '<div class="tiny">' + t('cb.thanksProto') + '</div></div>' +
        '<div class="stack spacer"><button type="button" class="appbtn appbtn--dark" data-go="start">' + t('cb.appHome') + '</button></div></div></div>';
    }
    var times = ['Morning', 'Afternoon', 'Evening'].map(function (k) {
      return '<button type="button" data-time="' + k + '" aria-pressed="' + (c.time === k) + '">' + t('cb.' + k.toLowerCase()) + '</button>';
    }).join('');
    return '<div class="view">' + head(t('cb.appTitle'), '', back) +
      '<form class="body" id="cb-form" novalidate>' +
        '<div><h1>' + t('cb.appH') + '</h1><p class="sub">' + sub + '</p></div>' +
        '<div class="card card--big">' +
          '<label class="field2">' + t('cb.name') + '<input class="input2" data-cb="name" autocomplete="name" placeholder="' + esc(t('cb.namePh')) + '" value="' + esc(c.name) + '"></label>' +
          '<label class="field2">' + t('cb.mobile') + '<input class="input2" data-cb="mobile" inputmode="tel" autocomplete="tel" placeholder="01XXXXXXXXX" value="' + esc(c.mobile) + '"></label>' +
          '<div class="stack" style="gap:8px"><span class="lbl">' + t('cb.time') + '</span><div class="times">' + times + '</div></div>' +
          '<label class="chk"><input type="checkbox" data-chk="cb.share"' + (c.share ? ' checked' : '') + '>' + t('cb.share') + '</label>' +
          '<div class="err" id="cb-err" role="alert"></div>' +
        '</div>' +
        '<div class="protoline">' + t('cb.appProto') + '</div>' +
        '<div class="spacer"><button type="submit" class="appbtn">' + t('cb.appBtn') + '</button></div>' +
      '</form></div>';
  }

  // ----- Full calculator, steps 1–5 -----
  function vF1() {
    var f = S.full;
    var cats = CATS.map(function (id) {
      return '<button type="button" role="radio" class="choice" aria-checked="' + (f.category === id) + '" data-fcat="' + id + '">' + esc(I.g('categories', id)) + '</button>';
    }).join('');
    var parent = f.parent
      ? '<label class="field2" for="f-children">' + t('f.children') + '</label><input id="f-children" class="input2" type="number" min="1" max="9" inputmode="numeric" data-num="f.children" value="' + f.children + '">' +
        '<div class="tiny">' + t('f.parentNote', { amount: tk(R.disabledChildAllowance) }) + '</div>'
      : '';
    return '<div class="view">' + fullHead(1) + '<div class="body"><h1>' + t('a.t1') + '</h1>' +
      '<div class="card"><div class="row2"><span class="q">' + t('f.q1') + '</span>' + U.infoButton('taxFreeLimit') + '</div>' +
        '<div class="stack" role="radiogroup">' + cats + '</div>' +
        '<label class="chk"><input type="checkbox" data-chk="f.parent"' + (f.parent ? ' checked' : '') + '>' + t('f.parent') + '</label>' + parent +
      '</div>' + nextBtn(1) + '</div></div>';
  }

  function vF2() {
    var f = S.full;
    return '<div class="view">' + fullHead(2) + '<div class="body"><h1>' + t('a.t2') + '</h1>' +
      '<div class="card"><div class="row2"><label class="q" for="f-salary">' + t('f.q2') + '</label>' + U.infoButton('taxFreePart') + '</div>' +
        money('f-salary', 'f.salary', f.salary) +
        '<label class="lbl" for="f-other">' + t('f.otherLabel') + '</label>' +
        money('f-other', 'f.other', f.other) +
      '</div><div class="card" id="f-preview"></div>' + nextBtn(2) + '</div></div>';
  }
  function updatePreview() {
    var f = S.full;
    doc.getElementById('f-preview').innerHTML =
      aline({ label: t('a.taxFreeNow'), value: '− ' + num(E.salaryExemption(f.salary)), info: 'taxFreePart' }) +
      aline({ label: t('a.taxableNow'), value: num(E.taxableIncome(f.salary, f.other)), cls: 'sum', info: 'taxableIncome' });
  }

  function vF3() {
    var f = S.full;
    var totalVal = f.invMode === 'list' ? invSum() : f.invTotal;
    var list = '';
    if (f.listOpen) {
      list = R.investmentTypes.map(function (it) {
        return '<div class="invrow2"><label class="lbl" for="inv-' + it.id + '">' + esc(I.g('investTypes', it.id)) + '</label>' +
          money('inv-' + it.id, 'inv:' + it.id, f.inv[it.id] || 0, true) + '<span class="tiny" id="cap-' + it.id + '"></span></div>';
      }).join('') + '<div class="tiny">' + t('f.invNote') + '</div>';
    }
    return '<div class="view">' + fullHead(3) + '<div class="body"><h1>' + t('a.t3') + '</h1>' +
      '<div class="card"><div class="row2"><label class="q" for="f-invtotal">' + t('f.q3') + '</label>' + U.infoButton('eligibleInvestment') + '</div>' +
        money('f-invtotal', 'f.invTotal', totalVal) +
        '<div class="tiny">' + t('a.invHint') + '</div>' +
        '<button type="button" class="linklike" data-toggle-list aria-expanded="' + f.listOpen + '">' + t(f.listOpen ? 'a.hideType' : 'a.byType') + '</button>' + list +
      '</div>' + nextBtn(3) + '</div></div>';
  }
  function updateInvCaps() {
    if (!S.full.listOpen) return;
    var r = E.countInvestments(S.full.inv);
    R.investmentTypes.forEach(function (it) {
      var el = doc.getElementById('cap-' + it.id);
      if (!el) return;
      var found = null;
      r.lines.forEach(function (l) { if (l.id === it.id) found = l; });
      var capped = !!(found && found.capped);
      el.textContent = capped ? t('f.invOnly', { counted: tk(found.counted), cap: U.compact(it.cap) })
        : (it.cap == null ? t('f.invNoCap') : t('f.invUpTo', { cap: U.compact(it.cap) })) + (it.note ? ' · ' + I.g('notes', it.note) : '');
      el.classList.toggle('is-capped', capped);
    });
  }

  function vF4() {
    var f = S.full;
    var fields = f.wealthYes
      ? '<div class="row2"><label class="lbl" for="f-net">' + t('f.netWealth') + '</label>' + U.infoButton('netWealth') + '</div>' + money('f-net', 'f.net', f.netWealth) +
        '<label class="field2">' + t('f.cars') + '<input class="input2" type="number" min="0" inputmode="numeric" data-num="f.cars" value="' + f.cars + '"></label>' +
        '<label class="field2">' + t('f.sqft') + '<input class="input2" type="number" min="0" inputmode="numeric" data-num="f.sqft" value="' + (f.sqft || '') + '" placeholder="0"></label>'
      : '';
    return '<div class="view">' + fullHead(4) + '<div class="body"><h1>' + t('a.t4') + '</h1>' +
      '<div class="card card--big"><div class="q">' + t('a.wealthQ', { w: U.compact(R.surcharge.wealthBands[0].over), sqft: num(R.surcharge.houseSqftMoreThan) }) + '</div>' +
        '<div class="yn"><button type="button" data-wealth="no" aria-pressed="' + !f.wealthYes + '">' + t('f.no') + '</button>' +
        '<button type="button" data-wealth="yes" aria-pressed="' + f.wealthYes + '">' + t('f.yes') + '</button></div>' +
        '<button type="button" class="linklike" data-explain="wealthSurcharge" aria-expanded="false">ⓘ ' + t('a.whatSur') + '</button>' + fields +
      '</div>' + nextBtn(4) + '</div></div>';
  }

  function vF5() {
    var f = S.full;
    var choices = R.filingPeriods.map(function (p) {
      var label = I.g('filing', p.id);
      if (p.kind === 'charge') label += ' · +' + pct(p.rate);
      var passed = R.years.full.passedFilingPeriods.indexOf(p.id) >= 0;
      if (p.kind === 'discount') label += passed ? ' · ' + t('f.passed') : ' · −' + pct(p.rate);
      return passed
        ? '<button type="button" role="radio" class="choice" aria-checked="false" aria-disabled="true" title="' + esc(t('f.passedTip')) + '">' + esc(label) + '</button>'
        : '<button type="button" role="radio" class="choice" aria-checked="' + (f.filing === p.id) + '" data-ffile="' + p.id + '">' + esc(label) + '</button>';
    }).join('');
    return '<div class="view">' + fullHead(5) + '<div class="body"><h1>' + t('a.t5') + '</h1>' +
      '<div class="card"><div class="q">' + t('a.fileQ') + '</div><div class="stack" role="radiogroup">' + choices + '</div></div>' +
      nextBtn(5) + '</div></div>';
  }

  function vResult() {
    var r = fullRes(), rc = U.buildReceipt(r);
    return '<div class="view">' + head(t('a.resultTitle'), t('a.resultSub', { ay: U.ayLabel(R.years.full) }), 'f5') +
      '<div class="body">' +
        '<div class="card card--big"><div class="kick">' + t('f.taxToPay') + '</div><div class="bignum" style="color:var(--ink)">' + tk(r.taxToPay) + '</div></div>' +
        '<div class="card"><div class="kick">' + t('f.how') + '</div>' + rc.how.map(aline).join('') +
          (rc.withinLimit ? '<div class="tiny">' + esc(rc.withinLimit) + '</div>' : '') + '</div>' +
        '<div class="card"><div class="kick">' + t('a.slabCard') + '</div>' + rc.slabs.map(aline).join('') +
          aline({ label: rc.slabTotal.label, value: rc.slabTotal.value, cls: 'sum' }) + '</div>' +
        '<div class="note2">' + rc.note.replace(/\s*<a [^>]*>.*?<\/a>/g, '') + '</div>' +
        '<div class="tiny">' + t('f.footNote') + '</div>' +
        '<div class="stack spacer no-print"><button type="button" class="appbtn" data-cbfrom="result">' + t('a.callback') + '</button>' +
        '<button type="button" class="appbtn appbtn--outline" data-print>' + t('c.pdf') + '</button>' +
        '<button type="button" class="applink" data-go="quick">' + t('a.planNext') + '</button></div>' +
      '</div></div>';
  }

  var RENDER = { start: vStart, quick: vQuick, invest: vInvest, callback: vCallback, f1: vF1, f2: vF2, f3: vF3, f4: vF4, f5: vF5, result: vResult };
  var AFTER = { quick: updateQuick, f2: updatePreview, f3: updateInvCaps };

  // ---------- routing ----------
  function viewFromHash() {
    var h = root.location.hash.replace('#', '');
    return VIEWS.indexOf(h) >= 0 ? h : 'start';
  }
  function go(v) {
    if (root.location.hash === '#' + v) show(v); else root.location.hash = '#' + v;
  }
  function show(v, keepScroll) {
    closeSheet(false);
    if (v === 'invest' && quickRes().status !== 'canSave') { go('quick'); return; }
    var top = screen.scrollTop;
    S.view = v;
    screen.innerHTML = RENDER[v]();
    screen.scrollTop = keepScroll ? top : 0;
    if (AFTER[v]) AFTER[v]();
  }
  function rerender() { show(S.view, true); }

  // ---------- explainer bottom sheet ----------
  var sheetOpener = null;
  function openSheet(key, opener) {
    var x = U.explain(key);
    sheetOpener = opener || null;
    sheet.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(x.title) + '"><span class="sheet__handle"></span>' +
      '<div class="sheet__h">' + esc(x.title) + '</div>' +
      '<p>' + esc(x.means) + '</p>' +
      '<div class="sheet__box"><span class="sheet__k">' + esc(x.labels.applies) + '</span>' + esc(x.applies) + '</div>' +
      '<div class="sheet__box"><span class="sheet__k">' + esc(x.labels.example) + '</span>' + esc(x.example) + '</div>' +
      (key === 'wealthSurcharge' ? '<p class="tiny">' + t('a.sheetSkip') + '</p>' : '') +
      '<button type="button" class="appbtn appbtn--dark" data-sheet-close>' + t('a.gotIt') + '</button></div>';
    sheet.hidden = false;
    sheet.querySelector('[data-sheet-close]').focus();
  }
  function closeSheet(restoreFocus) {
    if (sheet.hidden) return;
    sheet.hidden = true;
    sheet.innerHTML = '';
    if (restoreFocus && sheetOpener && doc.body.contains(sheetOpener)) sheetOpener.focus();
    sheetOpener = null;
  }

  // ---------- events ----------
  doc.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('button, a, [data-explain]') : null;
    if (!el) return;

    if (el.hasAttribute('data-explain')) { openSheet(el.getAttribute('data-explain'), el); return; }
    if (el === sheet || el.hasAttribute('data-sheet-close')) { closeSheet(true); return; }
    if (!screen.contains(el)) return;

    if (el.hasAttribute('data-go-full')) {
      S.full.salary = S.quick.salary; S.full.category = S.quick.category;
      go('f1');
    } else if (el.hasAttribute('data-go')) {
      go(el.getAttribute('data-go'));
    } else if (el.hasAttribute('data-cbfrom')) {
      S.cbFrom = el.getAttribute('data-cbfrom'); S.cbDone = false;
      go('callback');
    } else if (el.hasAttribute('data-print')) {
      root.print();
    } else if (el.hasAttribute('data-fcat')) {
      S.full.category = el.getAttribute('data-fcat'); rerender();
    } else if (el.hasAttribute('data-ffile')) {
      S.full.filing = el.getAttribute('data-ffile'); rerender();
    } else if (el.hasAttribute('data-wealth')) {
      S.full.wealthYes = el.getAttribute('data-wealth') === 'yes'; rerender();
    } else if (el.hasAttribute('data-toggle-list')) {
      S.full.listOpen = !S.full.listOpen; rerender();
    } else if (el.hasAttribute('data-time')) {
      S.cb.time = el.getAttribute('data-time'); rerender();
    }
  });
  // tapping the dark area outside the sheet closes it
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(true); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(true); });

  var MONEY = {
    'q.salary': function (v) { S.quick.salary = v; updateQuick(); },
    'f.salary': function (v) { S.full.salary = v; updatePreview(); },
    'f.other': function (v) { S.full.other = v; updatePreview(); },
    'f.net': function (v) { S.full.netWealth = v; },
    'f.invTotal': function (v) {
      S.full.invMode = 'total'; S.full.invTotal = v; S.full.inv = {};
      var boxes = screen.querySelectorAll('[data-money^="inv:"]');
      for (var i = 0; i < boxes.length; i++) boxes[i].value = '';
      updateInvCaps();
    }
  };
  var NUMS = {
    'f.children': function (v) { S.full.children = Math.max(1, Math.floor(v) || 1); },
    'f.cars': function (v) { S.full.cars = Math.max(0, Math.floor(v) || 0); },
    'f.sqft': function (v) { S.full.sqft = Math.max(0, v || 0); }
  };

  screen.addEventListener('input', function (e) {
    var el = e.target;
    var m = el.getAttribute && el.getAttribute('data-money');
    if (m) {
      var v = F.parseAmount(el.value);
      if (m.indexOf('inv:') === 0) {
        S.full.invMode = 'list';
        S.full.inv[m.slice(4)] = v;
        var total = doc.getElementById('f-invtotal');
        if (total) total.value = mv(invSum());
        updateInvCaps();
      } else if (MONEY[m]) {
        MONEY[m](v);
      }
      return;
    }
    var n = el.getAttribute && el.getAttribute('data-num');
    if (n && NUMS[n]) { NUMS[n](Number(el.value)); return; }
    var c = el.getAttribute && el.getAttribute('data-cb');
    if (c) S.cb[c] = el.value;
  });
  screen.addEventListener('focusout', function (e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute('data-money')) el.value = mv(F.parseAmount(el.value));
  });
  screen.addEventListener('change', function (e) {
    var el = e.target, k;
    if (el.getAttribute('data-sel') === 'q.cat') { S.quick.category = el.value; updateQuick(); }
    else if ((k = el.getAttribute('data-chk'))) {
      if (k === 'q.first') { S.quick.first = el.checked; updateQuick(); }
      else if (k === 'f.parent') { S.full.parent = el.checked; rerender(); }
      else if (k === 'cb.share') S.cb.share = el.checked;
    }
  });
  screen.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = S.cb, err = doc.getElementById('cb-err');
    if (!c.name.trim()) { err.textContent = t('cb.errName'); return; }
    if (!U.MOBILE_RE.test(U.cleanMobile(c.mobile))) { err.textContent = t('cb.errMobile'); return; }
    S.cbDone = true; S.cbWhen = c.time;
    rerender();
  });

  root.addEventListener('hashchange', function () { show(viewFromHash()); });
  I.onChange(function () { rerender(); });

  // ---------- start ----------
  I.init();
  show(viewFromHash());
})(window);
