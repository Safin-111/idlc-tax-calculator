/*
 * tax-engine.js — all the tax maths, as pure functions (no DOM, no side effects).
 * Every number comes from js/tax-rules.js. Screens call these functions only.
 * Order of calculation follows docs/TAX-RULES.md §10. All money is whole taka.
 *
 * Browser: load js/tax-rules.js first, then this file → window.IDLC_TAX_ENGINE
 * Node:    require('./tax-engine.js')
 */
(function (root) {
  'use strict';

  var RULES = (typeof module === 'object' && module.exports)
    ? require('./tax-rules.js')
    : root.IDLC_TAX_RULES;

  if (!RULES) {
    throw new Error('tax-engine.js: load js/tax-rules.js first');
  }

  // ---------- small helpers ----------

  // Any input → a non-negative number (blank, text or negative → 0)
  function amount(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(/,/g, ''));
    return isFinite(n) && n > 0 ? n : 0;
  }

  function toTaka(n) {
    return Math.round(n);
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  // ---------- §4 income ----------

  // Exempt part of salary: lower of one-third or the cap, rounded to the nearest taka
  function salaryExemption(salary) {
    var s = amount(salary);
    var r = RULES.salaryExemption;
    return toTaka(Math.min(s * r.fraction, r.cap));
  }

  // Taxable income = salary − salary exemption + other income
  function taxableIncome(salary, otherIncome) {
    return amount(salary) - salaryExemption(salary) + toTaka(amount(otherIncome));
  }

  // ---------- §2 threshold ----------

  function threshold(category, disabledChildren) {
    var base = RULES.thresholds[category];
    if (base == null) base = RULES.thresholds.general;
    var kids = Math.floor(amount(disabledChildren));
    return base + kids * RULES.disabledChildAllowance;
  }

  // ---------- §3 slabs ----------

  // Band-by-band table, including the tax-free band. Each band's tax is rounded to taka.
  function slabBreakdown(taxable, taxFree) {
    var income = amount(taxable);
    var bands = [];
    var free = Math.min(income, taxFree);
    bands.push({ from: 0, to: taxFree, size: taxFree, rate: 0, amount: free, tax: 0 });

    var start = taxFree;
    var left = Math.max(0, income - taxFree);
    for (var i = 0; i < RULES.slabs.length; i++) {
      var slab = RULES.slabs[i];
      var inBand = Math.min(left, slab.size);
      bands.push({
        from: start,
        to: slab.size === Infinity ? Infinity : start + slab.size,
        size: slab.size,
        rate: slab.rate,
        amount: inBand,
        tax: toTaka(inBand * slab.rate)
      });
      left -= inBand;
      start += slab.size;
    }
    return bands;
  }

  function slabTax(taxable, taxFree) {
    var bands = slabBreakdown(taxable, taxFree);
    var total = 0;
    for (var i = 0; i < bands.length; i++) total += bands[i].tax;
    return total;
  }

  // ---------- §5 minimum tax ----------

  function isAboveThreshold(taxable, taxFree) {
    return amount(taxable) > taxFree;
  }

  function minimumTax(taxable, taxFree, isNewTaxpayer) {
    if (!isAboveThreshold(taxable, taxFree)) return 0;
    return isNewTaxpayer ? RULES.minimumTax.newTaxpayer : RULES.minimumTax.regular;
  }

  // ---------- §6 investments and rebate ----------

  // Investments as { dps: 60000, providentFund: 72000, ... } → what counts after each type's cap.
  // A plain number is treated as one uncapped total ("one total field" in the Full calculator).
  function countInvestments(investments) {
    var lines = [];
    var entered = 0;
    var counted = 0;

    if (typeof investments === 'number' || typeof investments === 'string') {
      var t = toTaka(amount(investments));
      return { lines: [{ id: 'total', entered: t, cap: null, counted: t, capped: false }], entered: t, counted: t };
    }

    var inv = investments || {};
    var types = RULES.investmentTypes;
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var e = toTaka(amount(inv[type.id]));
      if (!e) continue;
      var c = type.cap == null ? e : Math.min(e, type.cap);
      lines.push({ id: type.id, entered: e, cap: type.cap, counted: c, capped: c < e, note: type.note || null });
      entered += e;
      counted += c;
    }
    return { lines: lines, entered: entered, counted: counted };
  }

  // Most rebate this person could ever get: lowest of 3% of taxable, the cap,
  // and (slab tax − minimum tax). Zero at or below the threshold.
  function maxRebate(taxable, taxFree, slab, minTax) {
    if (!isAboveThreshold(taxable, taxFree)) return 0;
    var r = RULES.rebate;
    return Math.max(0, Math.min(toTaka(r.incomeRate * amount(taxable)), r.cap, slab - minTax));
  }

  // Rebate actually earned with a given eligible (already capped) investment
  function rebate(taxable, taxFree, slab, minTax, eligibleInvestment) {
    var limit = maxRebate(taxable, taxFree, slab, minTax);
    var fromInvestment = toTaka(RULES.rebate.investmentRate * amount(eligibleInvestment));
    return Math.min(limit, fromInvestment);
  }

  // Investment needed to earn a given rebate
  function investmentForRebate(rebateAmount) {
    return toTaka(amount(rebateAmount) / RULES.rebate.investmentRate);
  }

  // ---------- §8 wealth surcharge ----------

  // wealth = { netWealth: Tk, cars: count, houseSqft: number }
  function surchargeRate(wealth) {
    var w = wealth || {};
    var s = RULES.surcharge;
    var net = amount(w.netWealth);
    var rate = 0;
    for (var i = 0; i < s.wealthBands.length; i++) {
      if (net > s.wealthBands[i].over) rate = s.wealthBands[i].rate;
    }
    var assetTrigger = amount(w.cars) > s.carsMoreThan || amount(w.houseSqft) > s.houseSqftMoreThan;
    if (assetTrigger) rate = Math.max(rate, s.assetTriggerRate);
    return rate;
  }

  function surcharge(slab, wealth) {
    return toTaka(amount(slab) * surchargeRate(wealth));
  }

  // ---------- §9 filing-time adjustment ----------

  // Returns a signed amount: negative = discount, positive = extra charge
  function filingAdjustment(base, periodId) {
    var b = amount(base);
    var p = findById(RULES.filingPeriods, periodId);
    if (!p || b <= 0 || p.kind === 'none') return 0;
    if (p.kind === 'discount') return -Math.min(toTaka(b * p.rate), p.max);
    if (p.kind === 'charge') return Math.max(toTaka(b * p.rate), p.min);
    return 0;
  }

  // ---------- §7 Quick saver ----------

  // input = { salary, category, firstReturn }
  function quickSaver(input) {
    var i = input || {};
    var exemption = salaryExemption(i.salary);
    var taxable = taxableIncome(i.salary, 0);
    var taxFree = threshold(i.category, 0);
    var slab = slabTax(taxable, taxFree);
    var minTax = minimumTax(taxable, taxFree, !!i.firstReturn);
    var above = isAboveThreshold(taxable, taxFree);

    var maxSaving = maxRebate(taxable, taxFree, slab, minTax);
    var taxIfNoInvest = above ? Math.max(slab, minTax) : 0;

    var status = !above ? 'noTax' : (maxSaving === 0 ? 'atMinimum' : 'canSave');

    return {
      salary: toTaka(amount(i.salary)),
      exemption: exemption,
      taxable: taxable,
      threshold: taxFree,
      slabs: slabBreakdown(taxable, taxFree),
      slabTax: slab,
      minimumTax: minTax,
      taxIfNoInvest: taxIfNoInvest,
      maxSaving: maxSaving,
      investNeeded: investmentForRebate(maxSaving),
      taxIfInvest: taxIfNoInvest - maxSaving,
      status: status, // 'noTax' | 'atMinimum' | 'canSave'
      year: RULES.years.quick
    };
  }

  // ---------- §10 Full calculator ----------

  // input = { salary, otherIncome, category, disabledChildren, firstReturn,
  //           investments: {typeId: Tk} or a single total, wealth: {netWealth, cars, houseSqft},
  //           filingPeriod: 'julSep' | 'octDec' | 'janMar' | 'aprJun' }
  function fullCalculator(input) {
    var i = input || {};

    // 1. Salary exemption → taxable income
    var exemption = salaryExemption(i.salary);
    var otherIncome = toTaka(amount(i.otherIncome));
    var taxable = taxableIncome(i.salary, otherIncome);
    var taxFree = threshold(i.category, i.disabledChildren);
    var above = isAboveThreshold(taxable, taxFree);

    // 2. Slab tax
    var slabs = slabBreakdown(taxable, taxFree);
    var slab = slabTax(taxable, taxFree);
    var minTax = minimumTax(taxable, taxFree, !!i.firstReturn);

    // 3. Rebate (caps + minimum-tax limit)
    var inv = countInvestments(i.investments);
    var potentialRebate = maxRebate(taxable, taxFree, slab, minTax);
    var reb = rebate(taxable, taxFree, slab, minTax, inv.counted);

    // 4. Max(slab tax − rebate, minimum tax)
    var taxAfterRebate = above ? Math.max(slab - reb, minTax) : 0;

    // 5. + wealth surcharge (on slab tax)
    var sRate = surchargeRate(i.wealth);
    var sur = surcharge(slab, i.wealth);

    // 6. ± filing-time adjustment
    var base = taxAfterRebate + sur;
    var filing = filingAdjustment(base, i.filingPeriod);

    // 7. = Tax to pay
    var taxToPay = base + filing;

    var missedSaving = Math.max(0, potentialRebate - reb);

    return {
      salary: toTaka(amount(i.salary)),
      exemption: exemption,
      otherIncome: otherIncome,
      taxable: taxable,
      threshold: taxFree,
      slabs: slabs,
      slabTax: slab,
      minimumTax: minTax,
      investments: inv,
      rebate: reb,
      taxAfterRebate: taxAfterRebate,
      surchargeRate: sRate,
      surcharge: sur,
      filingPeriod: i.filingPeriod || 'octDec',
      filingAdjustment: filing,
      taxToPay: taxToPay,
      // "You could have saved Tk X more" line
      potentialRebate: potentialRebate,
      missedSaving: missedSaving,
      extraInvestmentNeeded: investmentForRebate(missedSaving),
      year: RULES.years.full
    };
  }

  // ---------- Suggested split for the IDLC product cards ----------

  // DPS first up to the DPS cap, the rest to IDLC AML funds; shares optional at Tk 0
  function suggestSplit(investNeeded) {
    var total = toTaka(amount(investNeeded));
    var dpsCap = findById(RULES.investmentTypes, 'dps').cap;
    var dps = Math.min(total, dpsCap);
    return { dps: dps, funds: total - dps, shares: 0 };
  }

  var ENGINE = {
    rules: RULES,
    salaryExemption: salaryExemption,
    taxableIncome: taxableIncome,
    threshold: threshold,
    slabBreakdown: slabBreakdown,
    slabTax: slabTax,
    minimumTax: minimumTax,
    countInvestments: countInvestments,
    maxRebate: maxRebate,
    rebate: rebate,
    investmentForRebate: investmentForRebate,
    surchargeRate: surchargeRate,
    surcharge: surcharge,
    filingAdjustment: filingAdjustment,
    quickSaver: quickSaver,
    fullCalculator: fullCalculator,
    suggestSplit: suggestSplit
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = ENGINE;
  } else {
    root.IDLC_TAX_ENGINE = ENGINE;
  }
})(typeof window !== 'undefined' ? window : this);
