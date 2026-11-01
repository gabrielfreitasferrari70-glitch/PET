/* PET Conecta: pagina YouTube: abre o resumo de cada video. */
(function () {
  'use strict';

  /* Resultado da busca que leva a uma secao desta pagina: fecha a busca para mostrar a secao. */
  window.addEventListener('hashchange', function () {
    var fb = document.querySelector('button[aria-label="Fechar busca"]');
    if (fb && fb.getClientRects().length) { fb.click(); }
    var alvo = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (alvo) { setTimeout(function () { alvo.scrollIntoView(); }, 0); }
  });

  /* Resumo do video. */
  var dlg = document.getElementById('yt-dialog');
  if (!dlg || typeof dlg.showModal !== 'function') { return; }
  var img = document.getElementById('yt-d-img');
  var meta = document.getElementById('yt-d-meta');
  var tit = document.getElementById('yt-d-titulo');
  var res = document.getElementById('yt-d-resumo');
  var ir = document.getElementById('yt-d-ir');
  var proj = document.getElementById('yt-d-proj');
  document.querySelectorAll('.yt-card').forEach(function (c) {
    c.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) { return; }
      ev.preventDefault();
      var li = c.parentNode;
      img.src = c.querySelector('img').src.replace('/mqdefault.', '/hqdefault.');
      meta.textContent = c.getAttribute('data-tipo') + ' · ' + c.getAttribute('data-dur');
      tit.textContent = c.querySelector('.yt-titulo').textContent;
      res.textContent = li.querySelector('.yt-resumo').textContent;
      ir.href = c.href;
      var pj = (c.getAttribute('data-projeto') || '').split('|');
      if (proj) {
        if (pj[0]) { proj.href = pj[0]; proj.firstChild.nodeValue = (pj[1] || 'Ver no site') + ' '; proj.hidden = false; }
        else { proj.hidden = true; }
      }
      dlg.showModal();
    });
  });
  document.getElementById('yt-d-fechar').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (ev) { if (ev.target === dlg) { dlg.close(); } });
  dlg.addEventListener('close', function () { img.removeAttribute('src'); });
})();
