/*
 * format.js — money formatting in Bangladeshi style (12,00,000) with a "Tk" prefix.
 * No tax numbers here. Browser: window.IDLC_FORMAT · Node: module.exports
 */
(function (root) {
  'use strict';

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var MINUS = '−'; // proper minus sign "−"

  // 1200000 → "12,00,000" (last three digits, then groups of two). Rounds to whole taka.
  function groupDigits(n) {
    var s = String(Math.abs(Math.round(Number(n) || 0)));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return rest + ',' + last3;
  }

  function toBanglaDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  // options: { lang: 'en' | 'bn' }
  function localise(str, options) {
    return options && options.lang === 'bn' ? toBanglaDigits(str) : str;
  }

  // 1200000 → "12,00,000"; −1590 → "−1,590"
  function formatNumber(n, options) {
    var v = Math.round(Number(n) || 0);
    return localise((v < 0 ? MINUS : '') + groupDigits(v), options);
  }

  // 45000 → "Tk 45,000"; −1590 → "−Tk 1,590"
  function formatTaka(n, options) {
    var v = Math.round(Number(n) || 0);
    return localise((v < 0 ? MINUS : '') + 'Tk ' + groupDigits(v), options);
  }

  // For adjustments: 3000 → "+Tk 3,000"; −1590 → "−Tk 1,590"; 0 → "Tk 0"
  function formatSignedTaka(n, options) {
    var v = Math.round(Number(n) || 0);
    var sign = v > 0 ? '+' : (v < 0 ? MINUS : '');
    return localise(sign + 'Tk ' + groupDigits(v), options);
  }

  // Short form for round amounts in sentences: 500000 → "Tk 5 lakh", 40000000 → "Tk 4 crore"
  function formatCompact(n, options) {
    var v = Math.round(Number(n) || 0);
    var bn = options && options.lang === 'bn';
    function trim(x) { return String(Math.round(x * 100) / 100); }
    if (v >= 10000000) return localise('Tk ' + trim(v / 10000000) + (bn ? ' কোটি' : ' crore'), options);
    if (v >= 100000) return localise('Tk ' + trim(v / 100000) + (bn ? ' লাখ' : ' lakh'), options);
    return formatTaka(v, options);
  }

  // 0.15 → "15%"
  function formatPercent(rate, options) {
    var p = Math.round((Number(rate) || 0) * 10000) / 100;
    return localise(p + '%', options);
  }

  // What the user typed → a number. Accepts "12,00,000", "Tk 45,000", Bangla digits. Blank/invalid → 0.
  function parseAmount(text) {
    if (typeof text === 'number') return isFinite(text) && text > 0 ? text : 0;
    var s = String(text == null ? '' : text).replace(/[০-৯]/g, function (d) {
      return String(BN_DIGITS.indexOf(d));
    });
    s = s.replace(/[^0-9.]/g, '');
    var n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : 0;
  }

  var FORMAT = {
    groupDigits: groupDigits,
    toBanglaDigits: toBanglaDigits,
    formatNumber: formatNumber,
    formatTaka: formatTaka,
    formatSignedTaka: formatSignedTaka,
    formatPercent: formatPercent,
    formatCompact: formatCompact,
    parseAmount: parseAmount
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = FORMAT;
  } else {
    root.IDLC_FORMAT = FORMAT;
  }
})(typeof window !== 'undefined' ? window : this);
