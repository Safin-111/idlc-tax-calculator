/*
 * i18n.js — English / বাংলা switching for the whole site.
 *   IDLC_I18N.t('key', {vars})   a screen string (see js/strings.js)
 *   IDLC_I18N.g('group', 'id')   a word from a list (categories, filing periods…)
 * In the HTML:  data-i18n="key"  data-i18n-html="key"  data-i18n-attr="placeholder:key;aria-label:key2"
 * The choice is remembered in the browser (if it allows that).
 */
(function (root) {
  'use strict';

  var KEY = 'idlc-lang';
  var doc = root.document;
  var STR = root.IDLC_STRINGS;
  var lang = 'en';
  var listeners = [];
  var warned = {};

  try {
    var saved = root.localStorage.getItem(KEY);
    if (saved === 'bn' || saved === 'en') lang = saved;
  } catch (e) { /* storage blocked: stay on English */ }

  function fillVars(s, vars) {
    return vars ? s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; }) : s;
  }

  function t(key, vars) {
    var s = STR[lang].ui[key];
    if (s == null) s = STR.en.ui[key];
    if (s == null) {
      if (!warned[key]) { warned[key] = true; if (root.console) root.console.warn('Missing string: ' + key); }
      return key;
    }
    return fillVars(s, vars);
  }

  function g(group, id) {
    var set = STR[lang][group];
    var v = set && set[id];
    if (v == null) v = STR.en[group] && STR.en[group][id];
    return v == null ? id : v;
  }

  function month(m) { return STR[lang].months[m - 1] || STR.en.months[m - 1]; }

  function apply(scope) {
    var host = scope || doc;
    doc.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    var i, n, nodes;
    nodes = host.querySelectorAll('[data-i18n]');
    for (i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    nodes = host.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < nodes.length; i++) nodes[i].innerHTML = t(nodes[i].getAttribute('data-i18n-html'));
    nodes = host.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < nodes.length; i++) {
      var pairs = nodes[i].getAttribute('data-i18n-attr').split(';');
      for (n = 0; n < pairs.length; n++) {
        var kv = pairs[n].split(':');
        if (kv.length === 2) nodes[i].setAttribute(kv[0].trim(), t(kv[1].trim()));
      }
    }
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'bn') return;
    lang = next;
    try { root.localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
    apply();
    for (var i = 0; i < listeners.length; i++) listeners[i](lang);
  }

  function onChange(fn) { listeners.push(fn); }

  var started = false;
  function init() {
    if (started) return;
    started = true;
    doc.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-lang-toggle]') : null;
      if (b) setLang(lang === 'en' ? 'bn' : 'en');
    });
    apply();
  }

  root.IDLC_I18N = {
    t: t, g: g, month: month, apply: apply, init: init, onChange: onChange, setLang: setLang,
    lang: function () { return lang; }
  };
})(window);
