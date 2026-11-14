/*
 * links.js — where each IDLC product card sends the customer to sign up.
 * This is the ONLY file to edit when a team gives you a new sign-up link.
 * No tax numbers here (those stay in tax-rules.js).
 *
 * Every link gets tracking tags (utm_...) added automatically, so each team can
 * see in Google Analytics how many sign-ups came from the tax calculator.
 *
 * STATUS: links found on the public websites on 14 Nov 2026 — TO CONFIRM with
 * IDLC Finance (Deposits), IDLC Asset Management and IDLC Securities.
 */
(function (root) {
  'use strict';

  var LINKS = {
    // IDLC Finance PLC — Online DPS (product page with the online application)
    dps:    { url: 'https://idlc.com/online-dps',         company: 'IDLC Finance PLC' },
    // IDLC Asset Management — IDLC SIP ("can be opened online")
    funds:  { url: 'https://idlcamc.com/idlc-sip',        company: 'IDLC Asset Management Limited' },
    // IDLC Securities — BO account opening
    shares: { url: 'https://securities.idlc.com/',        company: 'IDLC Securities Limited' }
  };

  // Tracking tags added to every link. Change "campaign" each tax year.
  var UTM = {
    utm_source: 'idlc-tax-calculator',
    utm_medium: 'referral',
    utm_campaign: 'tax-season-2026-27'
  };

  // Builds the full link for one product, e.g. url('dps', 120000)
  // amount (optional) = the suggested amount, sent only as a tracking tag
  function url(product, amount) {
    var item = LINKS[product];
    if (!item) return null;
    var tags = [];
    for (var k in UTM) tags.push(k + '=' + encodeURIComponent(UTM[k]));
    tags.push('utm_content=' + encodeURIComponent(product));
    if (amount > 0) tags.push('utm_term=' + encodeURIComponent(String(Math.round(amount))));
    return item.url + (item.url.indexOf('?') >= 0 ? '&' : '?') + tags.join('&');
  }

  // Records the click if the host website has Google Tag Manager (idlc.com does).
  // On the prototype there is no tracker, so this simply does nothing.
  function track(product, amount) {
    try {
      if (root.dataLayer && root.dataLayer.push) {
        root.dataLayer.push({ event: 'tax_calc_product_click', product: product, suggested_amount: amount || 0 });
      }
    } catch (e) { /* never block the click */ }
  }

  // Any element with data-product-link="dps|funds|shares" becomes a working link.
  root.document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-product-link]') : null;
    if (a) track(a.getAttribute('data-product-link'), Number(a.getAttribute('data-amount')) || 0);
  });

  root.IDLC_LINKS = { url: url, track: track, company: function (p) { return LINKS[p] && LINKS[p].company; } };
})(window);
