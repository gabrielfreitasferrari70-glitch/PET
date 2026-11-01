/* PET Conecta: additive reading controls and shortcuts to the portal's filters. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'pet-reading-plus';
  var groups = [
    { key: 'theme', label: 'Tema', options: [['paper', 'Papel'], ['sepia', 'Sépia'], ['dark', 'Escuro']] },
    { key: 'font', label: 'Fonte', options: [['serif', 'Editorial'], ['sans', 'Moderna']] },
    { key: 'size', label: 'Tamanho do texto', options: [['sm', 'A−', 'A−: diminuir texto'], ['md', 'A', 'A: tamanho padrão'], ['lg', 'A+', 'A+: aumentar texto']] }
  ];
  var defaults = { theme: 'paper', font: 'serif', size: 'md' };
  var prefs = {};
  try {
    var stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    groups.forEach(function (g) {
      if (stored && g.options.some(function (o) { return o[0] === stored[g.key]; })) prefs[g.key] = stored[g.key];
    });
  } catch (e) { /* Reading still works when storage is unavailable. */ }
  var originalTheme = document.querySelector('meta[name="theme-color"]');
  var themeColor = originalTheme && originalTheme.content;
  var sized = [];
  function scaleText() {
    // Measure the original cascade, including the portal's “Aumentar textos”.
    sized.forEach(function (item) { item.node.style.fontSize = item.original; });
    sized = [];
    var ratio = prefs.size === 'sm' ? 0.9375 : prefs.size === 'lg' ? 1.125 : 1;
    if (ratio === 1) return;
    var measurements = [];
    document.querySelectorAll('main :is(h1,h2,h3,h4,p,li,dt,dd,figcaption,label),main .pet-number :is(strong,span,small,em)').forEach(function (node) {
      measurements.push({ node: node, original: node.style.fontSize, size: parseFloat(getComputedStyle(node).fontSize) });
    });
    measurements.forEach(function (item) { item.node.style.fontSize = (item.size * ratio) + 'px'; });
    sized = measurements;
  }
  function apply() {
    groups.forEach(function (g) {
      var value = prefs[g.key] || defaults[g.key];
      if (value === defaults[g.key]) root.removeAttribute('data-reading-' + g.key);
      else root.setAttribute('data-reading-' + g.key, value);
      document.querySelectorAll('[data-rp="' + g.key + '"]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.value === value));
      });
    });
    if (originalTheme) originalTheme.content = prefs.theme === 'dark' ? '#0d1715' : prefs.theme === 'sepia' ? '#f4ecdb' : themeColor;
    scaleText();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }
  var panel = document.getElementById('reading-panel');
  if (panel && !panel.querySelector('.reading-plus')) {
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Preferências de leitura');
    var box = document.createElement('div');
    box.className = 'reading-plus';
    groups.forEach(function (g) {
      var fieldset = document.createElement('fieldset');
      var legend = document.createElement('legend');
      legend.textContent = g.label;
      var options = document.createElement('div');
      options.className = 'rp-options';
      g.options.forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = o[1]; b.dataset.rp = g.key; b.dataset.value = o[0];
        if (o[2]) b.setAttribute('aria-label', o[2]);
        b.addEventListener('click', function () { prefs[g.key] = o[0]; save(); apply(); });
        options.appendChild(b);
      });
      fieldset.append(legend, options); box.appendChild(fieldset);
    });
    panel.prepend(box);
    document.getElementById('reading-open').addEventListener('click', function (e) {
      if (!panel.hidden && e.detail === 0) box.querySelector('button').focus();
    });
    document.getElementById('reading-reset').addEventListener('click', function () { prefs = {}; save(); apply(); });
    document.getElementById('large-text').addEventListener('change', scaleText);
    // Keep every preference reachable on small screens and at high zoom.
    document.addEventListener('click', function (e) {
      var opener = document.getElementById('reading-open');
      if (!panel.hidden && !panel.contains(e.target) && !opener.contains(e.target)) {
        panel.hidden = true; opener.setAttribute('aria-expanded', 'false');
      }
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.getElementById('reading-open').focus();
    });
  }
  apply();
  var resizeFrame;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(scaleText);
  });

  var catalog = document.querySelector('[data-catalog="projects"]');
  if (catalog && !catalog.querySelector('.theme-dock')) {
    var cards = Array.from(catalog.querySelectorAll('.project-card'));
    var theme = document.getElementById('theme-filter');
    var period = document.getElementById('period-filter');
    if (!cards.length || !theme || !period) return;
    var dock = document.createElement('div');
    dock.className = 'theme-dock'; dock.setAttribute('role', 'group');
    dock.setAttribute('aria-label', 'Atalhos para filtrar projetos');
    var choices = [['Todos', '', '', cards.length]];
    [period, theme].forEach(function (select) {
      Array.from(select.options).filter(function (o) { return o.value; }).forEach(function (o) {
        var kind = select === period ? 'period' : 'theme';
        var count = cards.filter(function (c) { return c.dataset[kind] === o.value; }).length;
        if (count) choices.push([o.value === '2026' ? 'Em 2026' : o.value === 'historico' ? 'Histórico' : o.textContent, kind, o.value, count]);
      });
    });
    function sync() {
      dock.querySelectorAll('button').forEach(function (b) {
        var active = b.dataset.kind === 'theme' ? theme.value === b.dataset.value : b.dataset.kind === 'period' ? period.value === b.dataset.value : !theme.value && !period.value;
        b.setAttribute('aria-pressed', String(active));
      });
    }
    choices.forEach(function (choice) {
      var b = document.createElement('button'); b.type = 'button';
      b.dataset.kind = choice[1]; b.dataset.value = choice[2]; b.setAttribute('aria-controls', 'catalog-grid');
      b.appendChild(document.createTextNode(choice[0] + ' '));
      var count = document.createElement('span'); count.className = 'count'; count.textContent = choice[3]; count.setAttribute('aria-hidden', 'true');
      b.appendChild(count);
      b.addEventListener('click', function () {
        if (!choice[1]) document.getElementById('reset-filters').click();
        else {
          var select = choice[1] === 'theme' ? theme : period;
          select.value = select.value === choice[2] ? '' : choice[2];
          // The existing portal owns search, favorites, visibility, counts and URL state.
          select.dispatchEvent(new Event('input', { bubbles: true }));
        }
        sync();
      });
      dock.appendChild(b);
    });
    catalog.insertBefore(dock, document.getElementById('catalog-grid'));
    catalog.addEventListener('input', sync);
    document.getElementById('reset-filters').addEventListener('click', sync);
    sync();
  }
})();
