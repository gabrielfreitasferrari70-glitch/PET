/* PET Conecta: pagina YouTube. 1) traz cabecalho e rodape da pagina Projetos para manter tudo igual; 2) abre o resumo de cada video. */
(function () {
  'use strict';

  /* 1) Cabecalho e rodape: lidos de /projetos/ antes dos scripts do site rodarem. */
  var main = document.getElementById('conteudo');
  try {
    var x = new XMLHttpRequest();
    x.open('GET', '/projetos/', false);
    x.send();
    if (x.status === 200 && main) {
      var doc = new DOMParser().parseFromString(x.responseText, 'text/html');
      var kids = Array.prototype.slice.call(doc.body.children);
      var i = -1;
      kids.forEach(function (k, n) { if (i < 0 && (k.tagName === 'MAIN' || k.id === 'conteudo')) { i = n; } });
      if (i > 0) {
        var antes = kids.slice(0, i), depois = kids.slice(i + 1);
        var ok = function (k) { return k.tagName !== 'SCRIPT'; };
        antes.filter(ok).forEach(function (k) { main.parentNode.insertBefore(document.importNode(k, true), main); });
        var ref = main.nextSibling;
        depois.filter(ok).forEach(function (k) { main.parentNode.insertBefore(document.importNode(k, true), ref); });
        /* Nenhum link do menu fica marcado como ativo: quem marca e o pet-editorial.js. */
        document.querySelectorAll('.editorial-nav .active, .editorial-nav [aria-current]').forEach(function (a) {
          a.classList.remove('active'); a.removeAttribute('aria-current');
        });
        var mini = document.getElementById('yt-mini');
        if (mini) { mini.remove(); }
      }
    }
  } catch (e) { /* sem cabecalho completo, fica o menu simples da propria pagina */ }

  /* Resultado da busca que leva a uma secao desta pagina: fecha a busca para mostrar a secao. */
  window.addEventListener('hashchange', function () {
    var fb = document.querySelector('button[aria-label="Fechar busca"]');
    if (fb && fb.getClientRects().length) { fb.click(); }
    var alvo = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (alvo) { setTimeout(function () { alvo.scrollIntoView(); }, 0); }
  });

  /* 2) Resumo do video. */
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
