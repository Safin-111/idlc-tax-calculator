/*
 * test-cases.js — the answers from docs/TEST-CASES.md, plus a shared runner.
 * Expected numbers are copied from the doc (whole taka). Do not "fix" them to match the engine.
 * Browser: window.IDLC_TEST_CASES / window.IDLC_RUN_TESTS · Node: module.exports
 */
(function (root) {
  'use strict';

  // D1 inputs, reused by D4 and D5
  var D1 = {
    salary: 1200000, category: 'general',
    investments: { dps: 60000, providentFund: 72000 },
    filingPeriod: 'octDec'
  };
  function asD1(changes) {
    var o = {};
    for (var k in D1) o[k] = D1[k];
    for (var c in changes) o[c] = changes[c];
    return o;
  }

  var CASES = [
    // ---------- Quick saver (salary only, no investments entered) ----------
    { id: 'Q1', mode: 'quick', title: 'Salary 12,00,000, General',
      input: { salary: 1200000, category: 'general' },
      expect: { taxable: 800000, taxIfNoInvest: 45000, investNeeded: 240000, maxSaving: 24000, taxIfInvest: 21000, status: 'canSave' } },
    { id: 'Q2', mode: 'quick', title: 'Salary 6,00,000, General → "You pay no tax"',
      input: { salary: 600000, category: 'general' },
      expect: { taxable: 400000, taxIfNoInvest: 0, investNeeded: 0, maxSaving: 0, taxIfInvest: 0, status: 'noTax' } },
    { id: 'Q3', mode: 'quick', title: 'Salary 6,75,000, General → "Already at minimum tax"',
      input: { salary: 675000, category: 'general' },
      expect: { taxable: 450000, taxIfNoInvest: 5000, investNeeded: 0, maxSaving: 0, taxIfInvest: 5000, status: 'atMinimum' } },
    { id: 'Q4', mode: 'quick', title: 'Salary 6,75,000, General, first return',
      input: { salary: 675000, category: 'general', firstReturn: true },
      expect: { taxable: 450000, taxIfNoInvest: 5000, investNeeded: 40000, maxSaving: 4000, taxIfInvest: 1000, status: 'canSave' } },
    { id: 'Q5', mode: 'quick', title: 'Salary 30,00,000, General',
      input: { salary: 3000000, category: 'general' },
      expect: { taxable: 2500000, taxIfNoInvest: 415000, investNeeded: 750000, maxSaving: 75000, taxIfInvest: 340000 } },
    { id: 'Q6', mode: 'quick', title: 'Salary 12,00,000, Woman',
      input: { salary: 1200000, category: 'womanOr65' },
      expect: { taxable: 800000, taxIfNoInvest: 37500, investNeeded: 240000, maxSaving: 24000, taxIfInvest: 13500 } },
    { id: 'Q7', mode: 'quick', title: 'Salary 9,00,000, Third gender',
      input: { salary: 900000, category: 'thirdGender' },
      expect: { taxable: 600000, taxIfNoInvest: 7500, investNeeded: 25000, maxSaving: 2500, taxIfInvest: 5000 } },
    { id: 'Q8', mode: 'quick', title: 'Salary 2,60,00,000, General (7,50,000 cap)',
      input: { salary: 26000000, category: 'general' },
      expect: { taxable: 25500000, taxIfNoInvest: 7260000, investNeeded: 7500000, maxSaving: 750000, taxIfInvest: 6510000 } },

    // ---------- Full calculator ----------
    { id: 'D1', mode: 'full', title: 'Salary 12,00,000, General; DPS 60,000 + PF 72,000; file Oct–Dec',
      input: D1,
      expect: { slabTax: 45000, rebate: 13200, surcharge: 0, filingAdjustment: 0, taxToPay: 31800,
                missedSaving: 10800, extraInvestmentNeeded: 108000 } },
    { id: 'D2', mode: 'full', title: 'Salary 12,00,000; DPS 2,00,000 (counts 1,20,000) + Sanchayapatra 7,00,000 (counts 5,00,000)',
      input: { salary: 1200000, category: 'general', investments: { dps: 200000, sanchayapatra: 700000 }, filingPeriod: 'octDec' },
      expect: { 'investments.counted': 620000, slabTax: 45000, rebate: 24000, surcharge: 0, filingAdjustment: 0, taxToPay: 21000 } },
    { id: 'D3', mode: 'full', title: 'Salary 30,00,000; net wealth 6 crore; no investments',
      input: { salary: 3000000, category: 'general', wealth: { netWealth: 60000000 }, filingPeriod: 'octDec' },
      expect: { slabTax: 415000, rebate: 0, surcharge: 41500, filingAdjustment: 0, taxToPay: 456500 } },
    { id: 'D4', mode: 'full', title: 'As D1, filed Jul–Sep',
      input: asD1({ filingPeriod: 'julSep' }),
      expect: { slabTax: 45000, rebate: 13200, surcharge: 0, filingAdjustment: -1590, taxToPay: 30210 } },
    { id: 'D5', mode: 'full', title: 'As D1, filed Jan–Mar (Tk 3,000 minimum)',
      input: asD1({ filingPeriod: 'janMar' }),
      expect: { slabTax: 45000, rebate: 13200, surcharge: 0, filingAdjustment: 3000, taxToPay: 34800 } },
    { id: 'D6', mode: 'full', title: 'Salary 12,00,000; 2 cars; net wealth 2 crore',
      input: { salary: 1200000, category: 'general', wealth: { netWealth: 20000000, cars: 2 }, filingPeriod: 'octDec' },
      expect: { slabTax: 45000, rebate: 0, surcharge: 4500, filingAdjustment: 0, taxToPay: 49500 } },
    { id: 'D7', mode: 'full', title: 'Salary 10,00,000 + rent 3,00,000; parent of 1 child with disability',
      input: { salary: 1000000, otherIncome: 300000, category: 'general', disabledChildren: 1, filingPeriod: 'octDec' },
      expect: { exemption: 333333, taxable: 966667, threshold: 450000, slabTax: 62500, rebate: 0, surcharge: 0, filingAdjustment: 0, taxToPay: 62500 } },

    // ---------- Number format (Bangladeshi grouping, "Tk") ----------
    { id: 'F1', mode: 'format', title: '12,00,000 grouping', call: ['formatTaka', 1200000], expect: 'Tk 12,00,000' },
    { id: 'F2', mode: 'format', title: '2,60,00,000 grouping', call: ['formatNumber', 26000000], expect: '2,60,00,000' },
    { id: 'F3', mode: 'format', title: 'Small number', call: ['formatTaka', 500], expect: 'Tk 500' },
    { id: 'F4', mode: 'format', title: 'Negative adjustment', call: ['formatSignedTaka', -1590], expect: '−Tk 1,590' },
    { id: 'F5', mode: 'format', title: 'Positive adjustment', call: ['formatSignedTaka', 3000], expect: '+Tk 3,000' },
    { id: 'F6', mode: 'format', title: 'Read typed amount', call: ['parseAmount', '12,00,000'], expect: 1200000 },
    { id: 'F7', mode: 'format', title: 'Bangla digits', call: ['formatTaka', 45000, { lang: 'bn' }], expect: 'Tk ৪৫,০০০' },
    { id: 'F8', mode: 'format', title: 'Compact lakh', call: ['formatCompact', 120000], expect: 'Tk 1.2 lakh' },
    { id: 'F9', mode: 'format', title: 'Compact crore', call: ['formatCompact', 40000000], expect: 'Tk 4 crore' },
    { id: 'F10', mode: 'format', title: 'Compact lakh in Bangla', call: ['formatCompact', 500000, { lang: 'bn' }], expect: 'Tk ৫ লাখ' }
  ];

  function pick(obj, path) {
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i++) obj = obj == null ? undefined : obj[parts[i]];
    return obj;
  }

  // Runs every case. Returns [{ id, title, mode, pass, checks: [{field, expected, actual, pass}] , error }]
  function runTests(engine, format) {
    var results = [];
    for (var i = 0; i < CASES.length; i++) {
      var c = CASES[i];
      var r = { id: c.id, title: c.title, mode: c.mode, checks: [], pass: true, error: null };
      try {
        if (c.mode === 'format') {
          var actual = format[c.call[0]].apply(null, c.call.slice(1));
          r.checks.push({ field: c.call[0], expected: c.expect, actual: actual, pass: actual === c.expect });
        } else {
          var out = c.mode === 'quick' ? engine.quickSaver(c.input) : engine.fullCalculator(c.input);
          for (var field in c.expect) {
            var got = pick(out, field);
            r.checks.push({ field: field, expected: c.expect[field], actual: got, pass: got === c.expect[field] });
          }
        }
      } catch (e) {
        r.error = String(e && e.message || e);
        r.pass = false;
      }
      for (var j = 0; j < r.checks.length; j++) if (!r.checks[j].pass) r.pass = false;
      results.push(r);
    }
    return results;
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { cases: CASES, runTests: runTests };
  } else {
    root.IDLC_TEST_CASES = CASES;
    root.IDLC_RUN_TESTS = runTests;
  }
})(typeof window !== 'undefined' ? window : this);
