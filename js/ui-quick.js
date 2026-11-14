/*
 * ui-quick.js — Website, Quick saver screen. Reads the inputs, asks the engine,
 * and writes the answer. No tax maths here. Words come from js/strings.js.
 */
(function (root) {
  'use strict';

  var U = root.IDLC_UI, E = U.E, F = U.F, R = U.R, I = U.I, t = U.t, tk = U.tk;
  var doc = root.document;

  var salaryEl = doc.getElementById('salary');
  var catEl = doc.getElementById('category');
  var firstEl = doc.getElementById('first-return');
  var resultEl = doc.getElementById('result');
  var productsEl = doc.getElementById('products');

  function buildCategories() {
    var current = catEl.value || 'general';
    catEl.innerHTML = '';
    // Categories come from the rules, so a new one there appears here automatically
    Object.keys(R.thresholds).forEach(function (id) {
      var o = doc.createElement('option');
      o.value = id;
      o.textContent = I.g('categories', id);
      catEl.appendChild(o);
    });
    catEl.value = current;
  }

  var ICONS = {
    dps: '<svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="#1A1A1A" stroke-width="1.4" aria-hidden="true"><rect x="6" y="10" width="28" height="26" rx="2"></rect><line x1="6" y1="17" x2="34" y2="17"></line><line x1="12" y1="6" x2="12" y2="13"></line><line x1="28" y1="6" x2="28" y2="13"></line><circle cx="36" cy="34" r="8" stroke="#D71920"></circle><line x1="36" y1="30" x2="36" y2="38" stroke="#D71920"></line></svg>',
    funds: '<svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="#1A1A1A" stroke-width="1.4" aria-hidden="true"><line x1="6" y1="42" x2="42" y2="42"></line><polyline points="6,36 16,26 24,30 40,14"></polyline><polyline points="32,14 40,14 40,22" stroke="#D71920"></polyline></svg>',
    shares: '<svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="#1A1A1A" stroke-width="1.4" aria-hidden="true"><line x1="12" y1="8" x2="12" y2="38"></line><rect x="8" y="15" width="8" height="14"></rect><line x1="24" y1="6" x2="24" y2="34"></line><rect x="20" y="11" width="8" height="16" stroke="#D71920"></rect><line x1="36" y1="14" x2="36" y2="42"></line><rect x="32" y="20" width="8" height="14"></rect></svg>'
  };

  function tick(html) { return '<li>' + U.CHECK_SVG + '<span>' + html + '</span></li>'; }

  function renderResult(q, hasSalary) {
    var html;
    if (!hasSalary) {
      html = '<div class="result__kicker">' + t('q.kickerTax') + '</div>' +
        '<div class="headline">' + t('q.empty') + '</div>';
    } else if (q.status === 'noTax') {
      html = '<div class="result__kicker">' + t('q.kickerTax') + '</div>' +
        '<div class="headline">' + t('q.noTax') + '</div>' +
        '<p class="sub">' + t('q.noTaxSub', { taxable: tk(q.taxable), limit: tk(q.threshold) }) + ' ' + U.infoButton('taxFreeLimit') + '</p>' +
        '<ul class="ticks">' + tick(t('q.tickFull')) + '</ul>';
    } else if (q.status === 'atMinimum') {
      html = '<div class="result__kicker">' + t('q.kickerTax') + '</div>' +
        '<div class="headline">' + t('q.atMin', { amount: tk(q.taxIfNoInvest) }) + U.infoButton('minimumTax') + '</div>' +
        '<div class="pair"><div><div class="pair__top">' + t('q.youPay') + '</div><div class="pair__num">' + tk(q.taxIfNoInvest) + '</div><div class="pair__note">' + t('q.whether') + '</div></div></div>' +
        '<ul class="ticks">' + tick(t('q.tickTaxable', { amount: tk(q.taxable) })) + tick(t('q.tickFull')) + '</ul>';
    } else {
      html = '<div class="result__kicker">' + t('q.kickerSave') + U.infoButton('rebate') + '</div>' +
        '<div class="bignum">' + tk(q.maxSaving) + '</div>' +
        '<div class="pair">' +
          '<div><div class="pair__top">' + t('q.youPay') + '</div><div class="pair__num">' + tk(q.taxIfNoInvest) + '</div><div class="pair__note pair__note--bold">' + t('q.ifNot') + '</div></div>' +
          '<div><div class="pair__top">' + t('q.youPay') + '</div><div class="pair__num">' + tk(q.taxIfInvest) + '</div><div class="pair__note">' + t('q.ifInvest', { amount: tk(q.investNeeded) }) + U.infoButton('eligibleInvestment') + '</div></div>' +
        '</div>' +
        '<div class="based">' + t('q.basedOn', { amount: tk(q.taxable) }) + U.infoButton('taxableIncome') + '</div>' +
        '<ul class="ticks">' +
          tick(t('q.tick1', { amount: tk(q.investNeeded), date: U.dateLabel(q.year.investBy) })) +
          tick(t('q.tick2')) +
          tick(t('q.tick3')) +
        '</ul>';
    }
    resultEl.innerHTML = html;
  }

  function callout(n, text) {
    return '<div class="callout"><span class="callout__n">' + U.loc(n) + '</span>' + text + '</div>';
  }

  function renderProducts(q) {
    var useSplit = q.status === 'canSave';
    var split = E.suggestSplit(q.investNeeded);
    var cap = U.compact(U.capOf('dps'));

    var dpsText = useSplit && split.dps > 0
      ? t('p.dpsSplit', { amount: tk(split.dps), monthly: tk(Math.ceil(split.dps / 12)), cap: cap })
      : t('p.dpsGeneric', { cap: cap });
    var fundsText = useSplit && split.funds > 0
      ? t('p.fundsSplit', { amount: tk(split.funds) })
      : t('p.fundsGeneric');
    var sharesText = useSplit ? t('p.sharesSplit', { amount: tk(split.shares) }) : t('p.sharesGeneric');

    // The suggested amount travels with the link as a tracking tag only
    var amt = useSplit ? split : { dps: 0, funds: 0, shares: 0 };
    productsEl.innerHTML =
      '<div class="product">' + ICONS.dps + '<h3>' + t('p.dps') + '</h3>' + callout(1, dpsText) + U.productLink('dps', amt.dps) + '</div>' +
      '<div class="product">' + ICONS.funds + '<h3>' + t('p.funds') + '</h3>' + callout(2, fundsText) + U.productLink('funds', amt.funds) + '</div>' +
      '<div class="product">' + ICONS.shares + '<h3>' + t('p.shares') + '</h3>' + callout(3, sharesText) + U.productLink('shares', amt.shares) + '</div>';
  }

  function renderFoot() {
    doc.getElementById('foot-main').textContent = t('q.foot', { range: U.rangeLabel(R.years.quick), ay: U.ayLabel(R.years.quick) });
  }

  // The answer only changes when "Calculate tax" is pressed. Until then the old
  // answer is dimmed so nobody reads it as the answer to the new inputs.
  var shown = null; // the inputs behind the answer on screen

  function render() {
    var q = E.quickSaver(shown);
    renderResult(q, shown.salary > 0);
    renderProducts(q);
    renderFoot();
    setStale(false);
  }
  function calculate() {
    shown = { salary: F.parseAmount(salaryEl.value), category: catEl.value, firstReturn: firstEl.checked };
    render();
  }
  function setStale(on) {
    resultEl.classList.toggle('is-stale', on);
    productsEl.classList.toggle('is-stale', on);
  }
  function inputsChanged() {
    var now = { salary: F.parseAmount(salaryEl.value), category: catEl.value, firstReturn: firstEl.checked };
    setStale(!shown || now.salary !== shown.salary || now.category !== shown.category || now.firstReturn !== shown.firstReturn);
  }

  U.init();

  buildCategories();
  U.bindMoney(salaryEl, inputsChanged);
  catEl.addEventListener('change', inputsChanged);
  firstEl.addEventListener('change', inputsChanged);
  doc.getElementById('quick-form').addEventListener('submit', function (e) {
    e.preventDefault();
    U.setMoney(salaryEl, F.parseAmount(salaryEl.value));
    calculate();
    if (root.innerWidth <= 980) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Changing language re-writes the same answer; it does not recalculate
  I.onChange(function () { buildCategories(); if (shown) { render(); inputsChanged(); } });

  // Start with a sample salary so the screen is never empty in a demo.
  // A link can preset the inputs for a slide demo, e.g.
  //   quick.html?salary=1200000&cat=womanOr65&first=1&lang=en
  // salary: whole taka · cat: a category id from tax-rules.js (general, womanOr65,
  // disability, thirdGender, freedomFighter) · first=1: first return
  // lang=en|bn: forces the language (the site otherwise remembers the last one used)
  var params = {};
  try { params = Object.fromEntries(new URLSearchParams(root.location.search)); } catch (e) { /* old browser: ignore */ }

  if (params.lang === 'en' || params.lang === 'bn') I.setLang(params.lang);
  if (params.cat && Object.prototype.hasOwnProperty.call(R.thresholds, params.cat)) catEl.value = params.cat;
  if (params.first === '1') firstEl.checked = true;

  var linkSalary = params.salary ? F.parseAmount(params.salary) : 0;
  U.setMoney(salaryEl, linkSalary > 0 ? linkSalary : 1200000);

  // Coming from "Invest now" on the Full calculator: carry over the salary and
  // category so the answer matches what the person just saw. Kept in this tab only.
  // A link with its own ?salary= wins.
  try {
    var handoff = JSON.parse(root.sessionStorage.getItem('idlc-handoff') || 'null');
    root.sessionStorage.removeItem('idlc-handoff');
    if (handoff && handoff.salary > 0 && !(linkSalary > 0)) {
      U.setMoney(salaryEl, handoff.salary);
      if (!params.cat && R.thresholds[handoff.category]) catEl.value = handoff.category;
    }
  } catch (e) { /* storage blocked: just use the sample salary */ }
  calculate();

  // Jump to the products when asked for (the page above them is built by script,
  // so the browser's own jump can land in the wrong place)
  if (root.location.hash === '#where-to-invest') {
    doc.getElementById('where-to-invest').scrollIntoView();
  }
})(window);
