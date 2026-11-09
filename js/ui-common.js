/*
 * ui-common.js — pieces shared by the website and the app: language-aware number helpers,
 * ⓘ explainer text, the receipt lines, the website popover + callback dialog, money inputs.
 * No tax maths here: every number comes from IDLC_TAX_ENGINE (js/tax-engine.js) and its
 * rules (js/tax-rules.js). Exposes window.IDLC_UI.
 */
(function (root) {
  'use strict';

  var E = root.IDLC_TAX_ENGINE, F = root.IDLC_FORMAT, I = root.IDLC_I18N, R = E.rules;
  var doc = root.document;
  var t = I.t, g = I.g;

  // Sample salary used only to illustrate the explainers (not a tax rule)
  var SAMPLE_SALARY = 1200000;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L() { return { lang: I.lang() }; }
  function loc(str) { return I.lang() === 'bn' ? F.toBanglaDigits(str) : String(str); }
  function tk(n) { return F.formatTaka(n, L()); }
  function num(n) { return F.formatNumber(n, L()); }
  function pct(r) { return F.formatPercent(r, L()); }
  function compact(n) { return F.formatCompact(n, L()); }

  function capOf(id) {
    for (var i = 0; i < R.investmentTypes.length; i++) {
      if (R.investmentTypes[i].id === id) return R.investmentTypes[i].cap;
    }
    return null;
  }

  // ---------- dates and periods (numbers live in the rules; words live in strings.js) ----------
  function dateLabel(d) { return loc(d.day + ' ') + I.month(d.month) + loc(' ' + d.year); }
  function monthYear(d) { return I.month(d.month) + loc(' ' + d.year); }
  function rangeLabel(y) { return monthYear(y.incomeFrom) + ' – ' + monthYear(y.incomeTo); }
  function ayLabel(y) { return loc(y.assessmentYear); }

  // ---------- {placeholder} values for the explainer text ----------
  var VARS = null, VARS_LANG = null;
  function buildVars() {
    var th = R.thresholds, sur = R.surcharge, sl = R.slabs;
    var sample = E.quickSaver({ salary: SAMPLE_SALARY, category: 'general' });
    var b = sample.slabs;
    var smallTaxable = th.general + 10000;
    var w1 = sur.wealthBands[0].over;
    var top = sur.wealthBands[sur.wealthBands.length - 1];
    return {
      minTax: tk(R.minimumTax.regular), minTaxNew: tk(R.minimumTax.newTaxpayer),
      exemptCap: compact(R.salaryExemption.cap),
      exemptFraction: loc('1/' + Math.round(1 / R.salaryExemption.fraction)),
      thrGeneral: compact(th.general), thrWoman: compact(th.womanOr65),
      slabFirst: pct(sl[0].rate), slabLast: pct(sl[sl.length - 1].rate),
      rebIncome: pct(R.rebate.incomeRate), rebInvest: pct(R.rebate.investmentRate), rebCap: compact(R.rebate.cap),
      dpsCap: compact(capOf('dps')), sanCap: compact(capOf('sanchayapatra')),
      exDpsPut: tk(capOf('dps') * 2),
      exSalary: tk(sample.salary), exExempt: tk(sample.exemption), exTaxable: tk(sample.taxable),
      exOverLimit: tk(sample.taxable - sample.threshold),
      exSlabRate1: pct(b[1].rate), exSlabAmt1: tk(b[1].amount), exSlabTax1: tk(b[1].tax),
      exSlabRate2: pct(b[2].rate), exSlabAmt2: tk(b[2].amount), exSlabTax2: tk(b[2].tax),
      exSlab: tk(sample.slabTax), exMaxReb: tk(sample.maxSaving), exInvest: tk(sample.investNeeded),
      exSmallTaxable: tk(smallTaxable), exSmallSlab: tk(E.slabTax(smallTaxable, th.general)),
      sr1: pct(sur.wealthBands[0].rate), srTop: pct(top.rate),
      w1: compact(w1), wTop: compact(top.over),
      carsMin: loc(String(sur.carsMoreThan + 1)), sqft: num(sur.houseSqftMoreThan),
      exSur: tk(E.surcharge(sample.slabTax, { netWealth: w1 + 1 })),
      exAssets: compact(w1 * 1.5), exLoans: compact(w1 * 0.25), exNet: compact(w1 * 1.25)
    };
  }
  function fill(str) {
    if (!VARS || VARS_LANG !== I.lang()) { VARS = buildVars(); VARS_LANG = I.lang(); }
    return str.replace(/\{(\w+)\}/g, function (m, k) { return VARS[k] == null ? m : VARS[k]; });
  }

  // Filled-in explainer text for a term (used by the website popover and the app sheet)
  function explain(key) {
    var raw = g('explainers', key);
    return {
      title: raw.title,
      means: fill(raw.means), applies: fill(raw.applies), example: fill(raw.example),
      labels: { means: g('explainLabels', 'means'), applies: g('explainLabels', 'applies'), example: g('explainLabels', 'example') }
    };
  }

  function infoButton(key) {
    var title = g('explainers', key).title;
    var term = I.lang() === 'bn' ? title : title.toLowerCase();
    return '<button type="button" class="info" data-explain="' + key + '" aria-label="' +
      esc(t('info.aria', { term: term })) + '" aria-expanded="false">i</button>';
  }
  function hydrateInfo(scope) {
    var nodes = (scope || doc).querySelectorAll('[data-info]');
    for (var i = 0; i < nodes.length; i++) nodes[i].innerHTML = infoButton(nodes[i].getAttribute('data-info'));
  }

  // ---------- the receipt: "how we got there" and "slab by slab" (website and app share it) ----------
  function buildReceipt(r) {
    var counted = r.investments.counted;
    var above = r.taxable > r.threshold;
    var rebateLabel;
    if (r.rebate > 0) {
      rebateLabel = Math.round(R.rebate.investmentRate * counted) <= r.potentialRebate
        ? t('f.lRebateOf', { rate: pct(R.rebate.investmentRate), amount: num(counted) })
        : t('f.lRebateMax');
    } else if (r.potentialRebate === 0) {
      rebateLabel = t('f.lRebateNone');
    } else {
      rebateLabel = t('f.lRebateNoInv');
    }
    var filingLabel = r.filingAdjustment < 0 ? t('f.lFileEarly')
      : r.filingAdjustment > 0 ? t('f.lFileLate', { period: g('filing', r.filingPeriod) })
      : t('f.lFile');

    var how = [];
    how.push({ label: t('f.lSalary'), value: num(r.salary) });
    how.push({
      label: t('f.lExempt', { frac: loc('1/' + Math.round(1 / R.salaryExemption.fraction)), cap: compact(R.salaryExemption.cap) }),
      value: '− ' + num(r.exemption), info: 'taxFreePart'
    });
    if (r.otherIncome > 0) how.push({ label: t('f.lOther'), value: '+ ' + num(r.otherIncome) });
    how.push({ label: t('f.lTaxable'), value: num(r.taxable), cls: 'sum', info: 'taxableIncome' });
    how.push({ label: t('f.lSlab'), value: num(r.slabTax), info: 'slab' });
    how.push({ label: rebateLabel, value: r.rebate ? '− ' + num(r.rebate) : num(0), cls: r.rebate ? '' : 'zero', info: 'rebate' });
    if (above && r.slabTax < r.minimumTax) how.push({ label: t('f.lMin'), value: num(r.taxAfterRebate), info: 'minimumTax' });
    how.push({
      label: r.surchargeRate ? t('f.lSurRate', { rate: pct(r.surchargeRate) }) : t('f.lSur'),
      value: r.surcharge ? '+ ' + num(r.surcharge) : num(0), cls: r.surcharge ? '' : 'zero', info: 'wealthSurcharge'
    });
    how.push({
      label: filingLabel,
      value: r.filingAdjustment ? (r.filingAdjustment < 0 ? '− ' : '+ ') + num(Math.abs(r.filingAdjustment)) : num(0),
      cls: r.filingAdjustment ? '' : 'zero'
    });
    how.push({ label: t('f.lTotal'), value: num(r.taxToPay), cls: 'total' });

    var slabs = [];
    r.slabs.forEach(function (b, i) {
      if (i > 0 && b.amount <= 0) return;
      slabs.push({ label: t(i === 0 ? 'f.sFirst' : 'f.sNext', { amount: num(b.amount), rate: pct(b.rate) }), value: num(b.tax) });
    });

    var noteKey, noteVars = {};
    if (r.missedSaving > 0) { noteKey = 'f.missed'; noteVars = { saved: tk(r.missedSaving), extra: tk(r.extraInvestmentNeeded) }; }
    else if (r.potentialRebate === 0) noteKey = 'f.noHelp';
    else noteKey = 'f.fullRebate';

    return {
      how: how,
      withinLimit: (!above && r.taxable > 0) ? t('f.withinLimit', { limit: tk(r.threshold) }) : '',
      slabs: slabs,
      slabTotal: { label: t('f.sTotal'), value: num(r.slabTax) },
      note: t(noteKey, noteVars)
    };
  }

  // ---------- website ⓘ popover ----------
  var pop = null, popBtn = null;
  function closePop(returnFocus) {
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (popBtn) {
      popBtn.setAttribute('aria-expanded', 'false');
      if (returnFocus && doc.body.contains(popBtn)) popBtn.focus();
    }
    popBtn = null;
  }
  function openPop(btn) {
    var x = explain(btn.getAttribute('data-explain'));
    if (!pop) {
      pop = doc.createElement('div');
      pop.className = 'pop';
      pop.setAttribute('role', 'dialog');
      pop.hidden = true;
      doc.body.appendChild(pop);
    }
    pop.setAttribute('aria-label', x.title);
    pop.innerHTML = '<button type="button" class="pop__close" aria-label="' + esc(t('c.close')) + '">×</button>' +
      '<h3>' + esc(x.title) + '</h3>' +
      '<p><b>' + esc(x.labels.means) + '</b><br>' + esc(x.means) + '</p>' +
      '<p><b>' + esc(x.labels.applies) + '</b><br>' + esc(x.applies) + '</p>' +
      '<p><b>' + esc(x.labels.example) + '</b><br>' + esc(x.example) + '</p>';
    pop.hidden = false;
    popBtn = btn;
    btn.setAttribute('aria-expanded', 'true');

    var vw = doc.documentElement.clientWidth, w = Math.min(340, vw - 24);
    pop.style.width = w + 'px';
    var r = btn.getBoundingClientRect();
    var left = Math.max(12, Math.min(r.left + root.pageXOffset - 16, root.pageXOffset + vw - w - 12));
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + root.pageYOffset + 10) + 'px';
    var pr = pop.getBoundingClientRect();
    if (pr.bottom > root.innerHeight && r.top - pr.height - 10 > 0) {
      pop.style.top = (r.top + root.pageYOffset - pr.height - 10) + 'px';
    }
  }
  function initExplainers() {
    doc.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-explain]') : null;
      if (btn) {
        var same = popBtn === btn && pop && !pop.hidden;
        closePop(false);
        if (!same) openPop(btn);
        return;
      }
      if (e.target.closest && e.target.closest('.pop__close')) { closePop(true); return; }
      if (pop && !pop.hidden && !pop.contains(e.target)) closePop(false);
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(true); });
  }

  // ---------- callback form (website dialog; nothing is sent) ----------
  var dlg = null;
  var MOBILE_RE = /^(\+?880|0)?1[3-9]\d{8}$/;
  // Accepts Bangla or English digits, spaces and dashes
  function cleanMobile(v) {
    return String(v).replace(/[০-৯]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.indexOf(d); }).replace(/[\s-]/g, '');
  }
  function buildDialog() {
    dlg = doc.createElement('dialog');
    dlg.className = 'dialog';
    dlg.setAttribute('aria-labelledby', 'cb-title');
    dlg.innerHTML =
      '<form class="dialog__body" id="cb-form" novalidate>' +
        '<h2 id="cb-title">' + esc(t('cb.title')) + '</h2>' +
        '<p>' + esc(t('cb.lead')) + '</p>' +
        '<label class="field">' + esc(t('cb.name')) + '<input id="cb-name" autocomplete="name"></label>' +
        '<label class="field">' + esc(t('cb.mobile')) + '<input id="cb-mobile" inputmode="tel" autocomplete="tel" placeholder="01XXXXXXXXX"></label>' +
        '<fieldset><legend>' + esc(t('cb.time')) + '</legend><div class="radios">' +
          '<label><input type="radio" name="cb-time" value="Morning" checked>' + esc(t('cb.morning')) + '</label>' +
          '<label><input type="radio" name="cb-time" value="Afternoon">' + esc(t('cb.afternoon')) + '</label>' +
          '<label><input type="radio" name="cb-time" value="Evening">' + esc(t('cb.evening')) + '</label>' +
        '</div></fieldset>' +
        '<label class="check"><input type="checkbox" id="cb-share" checked>' + esc(t('cb.share')) + '</label>' +
        '<p class="error" id="cb-error" role="alert"></p>' +
        '<div class="dialog__btns"><button type="submit" class="btn btn--red">' + esc(t('cb.submit')) + '</button>' +
        '<button type="button" class="btn btn--grey" data-cb-close>' + esc(t('cb.cancel')) + '</button></div>' +
        '<p class="small">' + esc(t('cb.proto')) + '</p>' +
      '</form>' +
      '<div class="dialog__body" id="cb-thanks" hidden>' +
        '<h2>' + esc(t('cb.thanksTitle')) + '</h2><p id="cb-thanks-text"></p>' +
        '<p class="small">' + esc(t('cb.thanksProto')) + '</p>' +
        '<div class="dialog__btns"><button type="button" class="btn btn--grey" data-cb-close>' + esc(t('c.close')) + '</button></div>' +
      '</div>';
    doc.body.appendChild(dlg);

    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || (e.target.hasAttribute && e.target.hasAttribute('data-cb-close'))) closeDialog();
    });
    dlg.querySelector('#cb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = dlg.querySelector('#cb-name').value.trim();
      var mobile = cleanMobile(dlg.querySelector('#cb-mobile').value);
      var err = dlg.querySelector('#cb-error');
      if (!name) { err.textContent = t('cb.errName'); dlg.querySelector('#cb-name').focus(); return; }
      if (!MOBILE_RE.test(mobile)) { err.textContent = t('cb.errMobile'); dlg.querySelector('#cb-mobile').focus(); return; }
      err.textContent = '';
      var time = dlg.querySelector('input[name="cb-time"]:checked').value;
      dlg.querySelector('#cb-thanks-text').textContent = t('cb.thanks', { name: name, when: t('cb.when' + time) });
      dlg.querySelector('#cb-form').hidden = true;
      dlg.querySelector('#cb-thanks').hidden = false;
    });
  }
  function openDialog() {
    if (!dlg) buildDialog();
    dlg.querySelector('#cb-form').hidden = false;
    dlg.querySelector('#cb-thanks').hidden = true;
    dlg.querySelector('#cb-error').textContent = '';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeDialog() {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  function dropDialog() {
    if (dlg) { closeDialog(); if (dlg.parentNode) dlg.parentNode.removeChild(dlg); dlg = null; }
  }
  function initCallback() {
    doc.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-open-callback]')) openDialog();
    });
  }

  // ---------- mode switch (same on both website screens) ----------
  function modeSwitch(active) {
    function opt(id, href, small, text) {
      var inner = '<span class="ms__name">' + esc(t(small)) + '</span><span class="ms__q">' + esc(t(text)) + '</span>';
      return id === active
        ? '<div class="ms__opt is-active" aria-current="page">' + inner + '</div>'
        : '<a class="ms__opt" href="' + href + '">' + inner + '</a>';
    }
    return '<nav class="ms" aria-label="' + esc(t('q.h1')) + '">' +
      opt('quick', 'quick.html', 'ms.quick', 'ms.quickQ') +
      opt('full', 'full.html', 'ms.full', 'ms.fullQ') + '</nav>';
  }
  function renderModeSwitch() {
    var host = doc.getElementById('mode-switch');
    if (host) host.innerHTML = modeSwitch(host.getAttribute('data-active'));
  }

  // ---------- money inputs ----------
  // plain = digits only (app); otherwise "Tk 12,00,000" (website)
  var moneyInputs = [];
  function setMoney(input, v, plain) {
    input.value = v ? (plain ? num(v) : tk(v)) : '';
  }
  function bindMoney(input, onChange, plain) {
    moneyInputs.push({ el: input, plain: !!plain });
    input.addEventListener('input', function () { onChange(F.parseAmount(input.value)); });
    input.addEventListener('blur', function () { setMoney(input, F.parseAmount(input.value), plain); });
  }
  function refreshMoney() {
    moneyInputs.forEach(function (m) { setMoney(m.el, F.parseAmount(m.el.value), m.plain); });
  }

  var CHECK_SVG = '<span class="tick"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#FFFFFF" stroke-width="2" aria-hidden="true"><polyline points="2,6 5,9 10,3"></polyline></svg></span>';

  // Call once per website page
  function init() {
    initExplainers();
    initCallback();
    renderModeSwitch();
    hydrateInfo();
    I.onChange(function () {
      closePop(false);
      dropDialog();
      VARS = null;
      renderModeSwitch();
      hydrateInfo();
      refreshMoney();
    });
    I.init();
  }

  root.IDLC_UI = {
    E: E, F: F, R: R, I: I, t: t, g: g,
    esc: esc, loc: loc, tk: tk, num: num, pct: pct, compact: compact, capOf: capOf,
    dateLabel: dateLabel, rangeLabel: rangeLabel, ayLabel: ayLabel, monthYear: monthYear,
    explain: explain, infoButton: infoButton, hydrateInfo: hydrateInfo,
    buildReceipt: buildReceipt,
    setMoney: setMoney, bindMoney: bindMoney, refreshMoney: refreshMoney,
    cleanMobile: cleanMobile, MOBILE_RE: MOBILE_RE,
    CHECK_SVG: CHECK_SVG,
    init: init
  };
})(window);
