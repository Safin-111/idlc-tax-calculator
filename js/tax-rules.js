/*
 * tax-rules.js — EVERY tax number the calculator uses lives here, and only here.
 * Source: docs/TAX-RULES.md (Finance Act 2026, Income Tax Act 2023).
 * AY 2026-27 and AY 2027-28 share the same numbers, so one rules set covers both;
 * the year is only a label (see `years`).
 *
 * Works in the browser (sets window.IDLC_TAX_RULES) and in Node (module.exports).
 * No maths here — the maths lives in js/tax-engine.js.
 */
(function (root) {
  'use strict';

  var CRORE = 10000000;

  var RULES = {
    // §1 Which year each mode uses (labels only; same rules for both)
    // Dates are numbers (month 1–12) so screens can write them in English or Bangla
    years: {
      quick: {
        incomeFrom: { month: 7, year: 2026 },
        incomeTo: { month: 6, year: 2027 },
        assessmentYear: '2027-28',
        investBy: { day: 30, month: 6, year: 2027 }
      },
      full: {
        incomeFrom: { month: 7, year: 2025 },
        incomeTo: { month: 6, year: 2026 },
        assessmentYear: '2026-27',
        passedFilingPeriods: ['julSep'] // already passed for the 2026-27 return: show greyed out
      }
    },

    // §2 Tax-free threshold by category (Tk)
    thresholds: {
      general: 400000,
      womanOr65: 450000,
      disability: 525000,
      thirdGender: 525000,
      freedomFighter: 550000 // gazetted war-wounded freedom fighter / gazetted July fighter
    },
    // Parent or legal guardian of a person with disability: added per child (Full calculator only)
    disabledChildAllowance: 50000,

    // §3 Slabs applied to income ABOVE the threshold, in order
    slabs: [
      { size: 300000, rate: 0.10 },
      { size: 400000, rate: 0.15 },
      { size: 500000, rate: 0.20 },
      { size: 2000000, rate: 0.25 },
      { size: Infinity, rate: 0.30 }
    ],

    // §4 Salary exemption: lower of (fraction × salary) or cap. 🟡 cap per Finance Ordinance 2025
    salaryExemption: {
      fraction: 1 / 3,
      cap: 500000
    },

    // §5 Minimum tax (only when taxable income is above the threshold)
    minimumTax: {
      regular: 5000,
      newTaxpayer: 1000 // first return
    },

    // §6 Investment rebate: lowest of incomeRate × taxable, investmentRate × eligible, cap
    rebate: {
      incomeRate: 0.03,
      investmentRate: 0.10,
      cap: 750000
    },

    // §6 Eligible investment types. cap = most that counts (null = no cap)
    investmentTypes: [
      { id: 'sanchayapatra', cap: 500000 },     // Sanchayapatra / government securities
      { id: 'dps', cap: 120000 },               // DPS (bank or finance company — IDLC qualifies)
      { id: 'mutualFunds', cap: null },         // Mutual funds / unit funds / ETFs (cap removed by FA 2026)
      { id: 'listedShares', cap: null },        // Listed shares (new investment this year)
      { id: 'lifeInsurance', cap: null, note: 'lifeInsuranceCap' }, // really ≤10% of sum assured; prototype: no cap, show note
      { id: 'providentFund', cap: null },       // Employee + employer, recognised fund
      { id: 'pension', cap: null },             // Universal Pension Scheme
      { id: 'other', cap: null }                // Donations to approved bodies, etc.
    ],

    // §8 Wealth surcharge, charged on slab tax (before the rebate)
    surcharge: {
      // Net wealth bands: rate applies when net wealth is ABOVE `over`
      wealthBands: [
        { over: 4 * CRORE, rate: 0.10 },
        { over: 10 * CRORE, rate: 0.20 },
        { over: 20 * CRORE, rate: 0.30 },
        { over: 50 * CRORE, rate: 0.35 }
      ],
      // Asset triggers that bring at least the first rate even with lower net wealth
      carsMoreThan: 1,          // more than one car in own name
      houseSqftMoreThan: 8000,  // total house property over 8,000 sq ft
      assetTriggerRate: 0.10
    },

    // §9 Filing-time adjustment. Base = tax after rebate + surcharge (only if > 0). 🟡 base "to confirm"
    filingPeriods: [
      { id: 'julSep', kind: 'discount', rate: 0.05, max: 25000 },  // 1 Jul – 30 Sep
      { id: 'octDec', kind: 'none', rate: 0 },                     // 1 Oct – 31 Dec
      { id: 'janMar', kind: 'charge', rate: 0.02, min: 3000 },     // 1 Jan – 31 Mar
      { id: 'aprJun', kind: 'charge', rate: 0.05, min: 5000 }      // 1 Apr – 30 Jun
    ],

    // Units used elsewhere (e.g. wealth inputs in crore)
    units: { crore: CRORE, lakh: 100000 }
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = RULES;
  } else {
    root.IDLC_TAX_RULES = RULES;
  }
})(typeof window !== 'undefined' ? window : this);
