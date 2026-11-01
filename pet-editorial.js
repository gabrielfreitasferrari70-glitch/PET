/* PET Conecta: cabecalho em uma linha, menu novo e botao Fale com o PET. */
(function () {
  'use strict';
  document.querySelectorAll('[data-pathway]').forEach(function (card) {
    var items;
    try { items = JSON.parse(card.dataset.pathwayItems); } catch (e) { return; }
    var s = card.querySelector('[data-pathway-status]');
    if (s && Array.isArray(items)) { s.textContent = items.length + ' conteúdos'; }
  });
  var path = location.pathname;
  var naFala = path.indexOf('/comunidade/') === 0;
  var YT = 'https://www.youtube.com/@petmedicina-ufmt3590';
  function ic() { var s = document.createElement('span'); s.className = 'fala-ic'; s.setAttribute('aria-hidden', 'true'); return s; }

  /* Cabecalho: a marca entra na mesma linha do menu. */
  var inner = document.querySelector('.header-inner');
  var brand = document.querySelector('.editorial-header .editorial-brand');
  if (inner && brand) { inner.insertBefore(brand, inner.firstChild); document.body.classList.add('cab-v2'); }

  /* Aba YouTube no menu do computador (depois de Aprender). */
  var dn = document.querySelector('.desktop-nav');
  if (dn && !dn.querySelector('a[href="/youtube/"]')) {
    var apr0 = dn.querySelector('a[href="/aprender/"]');
    var yl = document.createElement('a');
    yl.href = '/youtube/'; yl.textContent = 'YouTube';
    if (apr0) { yl.className = apr0.className.replace(/\bactive\b/, '').trim(); }
    if (path.indexOf('/youtube/') === 0) { yl.classList.add('active'); yl.setAttribute('aria-current', 'page'); }
    if (apr0 && apr0.nextSibling) { apr0.parentNode.insertBefore(yl, apr0.nextSibling); } else { dn.appendChild(yl); }
  }

  /* Aprender tambem fica ativo nas Publicacoes. */
  if (path.indexOf('/publicacoes/') === 0) {
    var ap = document.querySelector('.desktop-nav a[href="/aprender/"]');
    if (ap) { ap.classList.add('active'); }
  }

  /* Aprender: comece por aqui, em tres caminhos. */
  if (path === '/aprender/' || path === '/aprender') {
    var intro = document.querySelector('.page-intro');
    var d = intro && intro.querySelector('.intro-description');
    if (d) { d.textContent = 'Vídeos, leituras e materiais do PET sobre saúde e formação médica, explicados em linguagem simples. Escolha um caminho para começar.'; }
    if (intro && !document.querySelector('.ap-guia')) {
      var g = document.createElement('section'); g.className = 'wrap ap-guia'; g.setAttribute('aria-labelledby', 'ap-guia-t');
      g.innerHTML = '<h2 id="ap-guia-t">Por onde começar</h2><div class="ap-guia-grid">' +
        '<a href="/aprender/manual-pet/"><strong>Quero conhecer o PET</strong><span>O manual do programa e como o grupo funciona.</span></a>' +
        '<a href="/colecoes/infancia/"><strong>Quero aprender sobre saúde</strong><span>Visão, audição e cuidado desde a infância.</span></a>' +
        '<a href="/projetos/"><strong>Quero entender um projeto</strong><span>Cada projeto tem materiais e vídeos ligados a ele.</span></a></div>';
      intro.parentNode.insertBefore(g, intro.nextSibling);
    }
  }

  /* Botao Fale com o PET. */
  var join = document.querySelector('.header-tools .join');
  if (join) {
    join.href = '/comunidade/';
    join.textContent = '';
    join.appendChild(ic());
    join.appendChild(document.createTextNode('Fale com o PET'));
    join.setAttribute('data-v2', '');
    if (naFala) { join.setAttribute('aria-current', 'page'); }
  }
  if (!naFala) {
    var f = document.createElement('a');
    f.className = 'fale-flutuante';
    f.href = '/comunidade/';
    f.appendChild(ic());
    f.appendChild(document.createTextNode('Fale com o PET'));
    document.body.appendChild(f);
    /* O botao some quando o rodape ou um bloco de contato aparece na tela. */
    if ('IntersectionObserver' in window) {
      var fim = document.querySelectorAll('footer, .hm-fale, #contato');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.__visivel = e.isIntersecting; });
        var alguma = false;
        fim.forEach(function (n) { if (n.__visivel) { alguma = true; } });
        f.classList.toggle('is-oculto', alguma);
      });
      fim.forEach(function (n) { io.observe(n); });
    }
  }

  function ativo(href) {
    if (href === '/') { return path === '/'; }
    if (href === '/aprender/' && path.indexOf('/publicacoes/') === 0) { return true; }
    return path.indexOf(href) === 0;
  }
  function link(href, txt, cls) {
    var a = document.createElement('a');
    a.href = href; a.textContent = txt;
    if (cls) { a.className = cls; }
    if (ativo(href)) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    return a;
  }

  /* Menu movel. */
  var mm = document.getElementById('mobile-menu');
  if (mm) {
    mm.textContent = '';
    [['/', 'Início'], ['/projetos/', 'Projetos'], ['/agenda/', 'Agenda'], ['/aprender/', 'Aprender'], ['/youtube/', 'YouTube'], ['/o-pet/', 'O PET']].forEach(function (l) { mm.appendChild(link(l[0], l[1])); });
    mm.appendChild(link('/comunidade/', 'Fale com o PET', 'menu-destaque'));
    var sep = document.createElement('span'); sep.className = 'menu-sep'; sep.setAttribute('aria-hidden', 'true'); mm.appendChild(sep);
    mm.appendChild(link('/publicacoes/', 'Publicações e Jornal Anamnese', 'menu-sec'));
    mm.appendChild(link('/participar/', 'Processo seletivo e parcerias', 'menu-sec'));
    var ro = document.getElementById('reading-open');
    if (ro) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'menu-sec'; b.textContent = 'Preferências de leitura';
      b.addEventListener('click', function () { ro.click(); });
      mm.appendChild(b);
    }
  }

  /* Rodape. */
  var fm = document.querySelector('.footer-main');
  var ex = fm && fm.children[1];
  if (ex && ex.querySelector('h2')) {
    var h = ex.querySelector('h2');
    ex.textContent = ''; ex.appendChild(h);
    [['/projetos/', 'Projetos'], ['/agenda/', 'Agenda'], ['/aprender/', 'Aprender'], ['/youtube/', 'YouTube'], ['/o-pet/', 'O PET'], ['/comunidade/', 'Fale com o PET'], ['/publicacoes/', 'Publicações'], ['/de-jaleco-e-fone/', 'De Jaleco e Fone'], ['/participar/', 'Processo seletivo e parcerias']].forEach(function (l) {
      var a = document.createElement('a'); a.href = l[0]; a.textContent = l[1]; ex.appendChild(a);
    });
  }
  /* Rodada 3: canal do YouTube junto do Instagram, em todas as paginas. */
  var enc = fm && fm.children[2];
  if (enc && !enc.querySelector('a[href^="https://www.youtube.com/"]')) {
    var ig = enc.querySelector('a[href*="instagram.com"]');
    var yt = document.createElement('a');
    yt.href = YT; yt.target = '_blank'; yt.rel = 'noopener noreferrer'; yt.textContent = 'YouTube oficial ↗';
    if (ig && ig.nextSibling) { enc.insertBefore(yt, ig.nextSibling); } else { enc.appendChild(yt); }
  }

  var purpose = document.getElementById('contact-purpose');
  if (purpose && new URLSearchParams(location.search).get('interesse') === 'parceria') {
    purpose.value = 'Propor uma parceria';
    purpose.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* Seta ↗ so em link que sai do site; link interno usa →. Tambem vale para o que e criado depois (busca, agenda) e para os cards de caminho, que sao clicaveis por script. */
  function troca(raiz) {
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf('↗') !== -1) { n.nodeValue = n.nodeValue.replace(/↗/g, '→'); }
    }
  }
  function setas() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var externo;
      try { externo = new URL(a.getAttribute('href'), location.href).origin !== location.origin; } catch (e) { return; }
      if (externo || a.textContent.indexOf('↗') === -1) { return; }
      troca(a);
    });
    document.querySelectorAll('.pathway-card').forEach(function (c) {
      if (c.textContent.indexOf('↗') !== -1) { troca(c); }
    });
    document.querySelectorAll('.footer-wordmark span').forEach(function (s) {
      if (s.textContent.trim() === '↗') { s.remove(); }
    });
  }

  /* Rodada 2: selo "Acontecendo agora" e votacao (sem ranking enquanto ha poucos votos; contagem fora do botao). */
  function plural(n) { return n + (n === 1 ? ' voto' : ' votos'); }
  function selo() {
    document.querySelectorAll('#home-datas small').forEach(function (s) {
      var t = s.firstChild;
      var pref = 'Acontecendo agora · ';
      if (t && t.nodeType === 3 && t.nodeValue.indexOf(pref) === 0) {
        t.nodeValue = t.nodeValue.slice(pref.length);
        var e = document.createElement('span');
        e.className = 'selo-agora';
        e.textContent = 'Acontecendo agora';
        s.insertBefore(e, t);
      }
    });
  }
  function votos() {
    var bts = document.querySelectorAll('.tema-lista .voto, #temas-lista .voto');
    if (!bts.length) { return; }
    var soma = 0;
    bts.forEach(function (b) {
      var col = b.parentNode;
      var cont = col.classList && col.classList.contains('voto-col') ? col.querySelector('.voto-n') : null;
      var num = b.querySelector('b');
      if (num) {
        var n = parseInt(num.textContent, 10) || 0;
        if (!cont) {
          col = document.createElement('div'); col.className = 'voto-col';
          b.parentNode.insertBefore(col, b); col.appendChild(b);
          cont = document.createElement('span'); cont.className = 'voto-n'; col.appendChild(cont);
        }
        cont.setAttribute('data-n', n);
        cont.textContent = plural(n);
        num.remove();
      }
      if (cont) { soma += parseInt(cont.getAttribute('data-n'), 10) || 0; }
    });
    if (soma < 20) {
      document.querySelectorAll('.tema-lista .pos, #temas-lista .pos').forEach(function (p) { p.remove(); });
    }
  }

  /* Rodada 3: secao Aprender na home, com o tema mais votado em destaque. */
  function aprenderHome() {
    if (path !== '/' || document.querySelector('.hm-aprender')) { return; }
    var proj = document.querySelector('.hm-proj');
    if (!proj) { return; }
    var sec = document.createElement('section');
    sec.className = 'hm-proj hm-aprender';
    sec.setAttribute('aria-labelledby', 'hm-apr-t');
    sec.innerHTML = "<div class='hm-cab'><div><span class='eyebrow'>APRENDER</span><h2 id='hm-apr-t'>Aprenda com o PET.</h2></div><a class='text-link' href='/aprender/'>Toda a biblioteca →</a></div>" +
      "<p class='hm-nota hm-tema-topo' id='hm-tema-topo' hidden></p>" +
      "<div class='hm-grid'>" +
      "<a class='hp-card' href='/aprender/visao-nas-escolas/'><span class='hp-capa' aria-hidden='true'><small>Vídeo · Saúde visual</small><b>Um olhar para o futuro</b></span><span class='hp-corpo'><strong>Um olhar para o futuro</strong><span>Conheça o caminho do Acuidade Visual: triagem nas escolas, encaminhamento para avaliação e acesso a óculos quando indicados.</span><em>Ver o vídeo <span aria-hidden='true'>→</span></em></span></a>" +
      "<a class='hp-card' href='/aprender/saude-auditiva/'><span class='hp-capa' aria-hidden='true'><small>Publicação · Saúde auditiva</small><b>Cuidado desde os primeiros sons</b></span><span class='hp-corpo'><strong>Cuidado desde os primeiros sons</strong><span>A publicação do Setembro Azul apresenta o Teste da Orelhinha e abre uma conversa sobre saúde auditiva na infância.</span><em>Explorar a publicação <span aria-hidden='true'>→</span></em></span></a>" +
      "<a class='hp-card' href='/aprender/formacao-medica/'><span class='hp-capa' aria-hidden='true'><small>Publicação · Formação médica</small><b>Como formamos quem cuida?</b></span><span class='hp-corpo'><strong>Como formamos quem cuida?</strong><span>A 46ª edição do Anamnese propõe uma reflexão sobre educação médica e a formação dos profissionais de amanhã.</span><em>Explorar a publicação <span aria-hidden='true'>→</span></em></span></a>" +
      "</div>";
    proj.parentNode.insertBefore(sec, proj.nextSibling);
  }
  function temaTopo() {
    var alvo = document.getElementById('hm-tema-topo');
    var it = document.querySelector('#home-temas .tema-item');
    if (!alvo || !it) { return; }
    var p = it.querySelector('p');
    var n = it.querySelector('.voto-n');
    var votosN = n ? parseInt(n.getAttribute('data-n'), 10) || 0 : 0;
    if (!p || votosN < 1) { alvo.hidden = true; return; }
    var txt = p.textContent.replace(/^\s*\d+\s*/, '').trim();
    alvo.textContent = '';
    var s = document.createElement('strong'); s.textContent = txt;
    alvo.appendChild(document.createTextNode('Tema mais votado agora (' + plural(votosN) + '): '));
    alvo.appendChild(s);
    alvo.appendChild(document.createTextNode('. '));
    var a = document.createElement('a'); a.className = 'text-link'; a.href = '/comunidade/?tipo=tema'; a.textContent = 'Votar ou sugerir →';
    alvo.appendChild(a);
    alvo.hidden = false;
  }

  /* Rodada 3: bloco Acompanhe em cada pagina de projeto. */
  function acompanhe() {
    if (!/^\/projetos\/[^/]+\/?$/.test(path)) { return; }
    var raiz = document.getElementById('pj-raiz');
    if (!raiz || !raiz.querySelector('.pj-sec') || raiz.querySelector('.pj-acompanhe')) { return; }
    var s = document.createElement('section');
    s.className = 'pj-sec pj-acompanhe';
    s.id = 'acompanhe';
    s.innerHTML = "<h2>Acompanhe</h2><p>Os registros mais recentes do PET saem no Instagram e no YouTube oficiais do grupo.</p><p><a class='text-link' href='https://www.instagram.com/petmedicina.ufmt/' target='_blank' rel='noopener noreferrer'>Abrir o Instagram do PET ↗</a> · <a class='text-link' href='" + YT + "' target='_blank' rel='noopener noreferrer'>Abrir o canal no YouTube ↗</a></p>";
    raiz.appendChild(s);
  }

  /* Capas ilustradas de cada projeto: cards, inicio e topo da pagina do projeto. */
  var CAPAS = {
    'de-jaleco-e-fone': 'Ilustração do De Jaleco e Fone: fones de ouvido sobre a gola de um jaleco',
    'acuidade-visual': 'Ilustração do Acuidade Visual: óculos sobre uma lousa, com letras de tabela de leitura nas lentes',
    'trote-solidario': 'Ilustração do Trote Solidário: gota de sangue com uma cruz, entre corações',
    'arte-na-veia': 'Ilustração do Arte na Veia: relógio antigo e notas musicais numa faixa de filme',
    'curso-aph': 'Ilustração do Curso de APH: selo com a estrela da vida',
    'jornal-anamnese': 'Ilustração do Jornal Anamnese: página de jornal e estetoscópio',
    'petnews': 'Ilustração do PETNews: megafone e cartões de notícia',
    '12-e-30': 'Ilustração do 12&30: microfone de karaokê e disco',
    'cartas-coracao': 'Ilustração do Cartas CorAção: envelope com um coração',
    'cadastro-do-bem': 'Ilustração do Cadastro do Bem: mão segurando uma gota com a fita do DNA'
  };
  function chaveCapa(href) {
    if (!href) { return null; }
    var m = href.match(/^\/projetos\/([^\/#?]+)\/?$/);
    if (m && CAPAS[m[1]]) { return m[1]; }
    if (/^\/publicacoes\/anamnese\/?$/.test(href)) { return 'jornal-anamnese'; }
    if (/^\/de-jaleco-e-fone\/?$/.test(href)) { return 'de-jaleco-e-fone'; }
    return null;
  }
  function imgCapa(k) {
    var i = document.createElement('img');
    i.src = '/assets/capas/' + k + '.svg'; i.alt = CAPAS[k];
    i.width = 1600; i.height = 900; i.loading = 'lazy'; i.decoding = 'async';
    return i;
  }
  var cssCapas = false;
  function estiloCapas() {
    if (cssCapas) { return; }
    cssCapas = true;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/capas.css';
    document.head.appendChild(l);
  }
  function capas() {
    document.querySelectorAll('main article').forEach(function (art) {
      if (art.classList.contains('tem-capa')) { return; }
      var h = art.querySelector('h2 a[href], h3 a[href]');
      var k = h && chaveCapa(h.getAttribute('href'));
      if (!k) { return; }
      estiloCapas();
      var primeiro = art.firstElementChild;
      var midia;
      if (primeiro && primeiro.tagName === 'A' && !primeiro.querySelector('h2, h3')) {
        midia = primeiro; midia.textContent = '';
      } else if (primeiro && primeiro.getAttribute('aria-hidden') === 'true' && !primeiro.querySelector('h2, h3')) {
        midia = document.createElement('a'); art.replaceChild(midia, primeiro);
      } else {
        midia = document.createElement('a'); art.insertBefore(midia, primeiro);
      }
      midia.href = h.getAttribute('href');
      midia.className = 'capa-midia';
      midia.setAttribute('tabindex', '-1');
      midia.setAttribute('aria-hidden', 'true');
      midia.appendChild(imgCapa(k));
      art.classList.add('tem-capa');
    });
    document.querySelectorAll('a.hp-card').forEach(function (c) {
      var k = chaveCapa(c.getAttribute('href'));
      var capa = c.querySelector('.hp-capa');
      if (!k || !capa || capa.classList.contains('capa-midia')) { return; }
      estiloCapas();
      /* O nome do projeto ficava dentro da capa: passa para o corpo do card antes de trocar a imagem. */
      var corpo = c.querySelector('.hp-corpo');
      var nome = capa.querySelector('b');
      if (corpo && nome && !corpo.querySelector('strong')) {
        var st = document.createElement('strong'); st.textContent = nome.textContent.trim();
        corpo.insertBefore(st, corpo.firstChild);
      }
      /* Se o nome existir so para leitor de tela, ele passa a aparecer. */
      var tit = corpo && corpo.querySelector('strong');
      if (tit && tit.offsetWidth <= 1) { tit.classList.add('capa-titulo'); }
      capa.textContent = ''; capa.classList.add('capa-midia'); capa.appendChild(imgCapa(k));
    });
    var pm = path.match(/^\/projetos\/([^\/]+)\/?$/);
    if (pm && CAPAS[pm[1]]) {
      var raiz = document.getElementById('pj-raiz');
      if (raiz && raiz.querySelector('.pj-sec') && !raiz.querySelector('.pj-capa')) {
        estiloCapas();
        var fig = document.createElement('figure'); fig.className = 'pj-capa';
        var im = imgCapa(pm[1]); im.loading = 'eager'; fig.appendChild(im);
        var alvo = raiz.querySelector('nav') || raiz.querySelector('.pj-sec');
        alvo.parentNode.insertBefore(fig, alvo);
      }
    }
  }

  /* Padronizacao (Rodadas A, B e C): folha de estilo final, textos e caminho de volta. */
  (function () {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/pet-padrao.css';
    document.head.appendChild(l);
    if (path === '/') { document.body.classList.add('pg-home'); }
    if (path.indexOf('/agenda') === 0) { document.body.classList.add('pg-agenda'); }
  })();
  var TROCAS = [
    [/\bPet Conecta\b/g, 'PET Conecta'],
    [/Dezesseis anos de PET, com fonte\./g, 'Dezesseis anos de PET, com registros.'],
    [/O Jornal Anamnese e os balanços do portal têm propósitos distintos\./g, 'O Jornal Anamnese e os balanços do PET Conecta, cada um no seu lugar.'],
    [/Pré-Hospitalar/g, 'Pré‑Hospitalar'],
    [/PET — resultado/g, 'PET: resultado']
  ];
  var CTA = { 'Conhecer projeto': 'Conhecer o projeto', 'Ver o projeto': 'Conhecer o projeto', 'Explorar edição': 'Ler a edição' };
  var FALE = { 'Perguntar ao PET': 1, 'Enviar informação ao PET': 1, 'Enviar uma proposta': 1 };
  function textos() {
    if (document.title) {
      document.title = document.title.replace(/\s*\|\s*PET Conecta/, ' · PET Conecta').replace(/Pet Conecta/g, 'PET Conecta');
    }
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var t = n.parentNode && n.parentNode.nodeName;
        return (t === 'SCRIPT' || t === 'STYLE' || t === 'TEXTAREA' || t === 'NOSCRIPT') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue, o = v;
      if (!v.trim()) { continue; }
      TROCAS.forEach(function (t) { v = v.replace(t[0], t[1]); });
      var k = v.trim().replace(/\s*[→↗]\s*$/, '');
      if (CTA[k]) { v = v.replace(k, CTA[k]); }
      if (FALE[k]) {
        var a = n.parentNode.closest && n.parentNode.closest('a[href]');
        if (a) {
          var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { u = null; }
          if (u && u.origin === location.origin && u.pathname === '/comunidade/' && !u.search) { v = v.replace(k, 'Fale com o PET'); }
        }
      }
      if (v !== o) { n.nodeValue = v; }
    }
  }
  function interno(a) {
    try { return new URL(a.getAttribute('href'), location.href).origin === location.origin; } catch (e) { return false; }
  }
  function setasInternas() {
    document.querySelectorAll('.hero-actions .button, .pathway-kicker, .pathway-continue, .participation-shortcuts a, .material-entry, .pet-entry-action').forEach(function (el) {
      if (el.classList.contains('seta-int')) { return; }
      var card = el.closest('.pathway-card');
      var a = el.closest('a[href]') || (card && card.querySelector('a[href]'));
      if (a && interno(a)) { el.classList.add('seta-int'); }
    });
  }
  function volta() {
    document.querySelectorAll('.breadcrumb-line:not([data-volta]), .djf-breadcrumb:not([data-volta])').forEach(function (c) {
      var as = [].slice.call(c.querySelectorAll('a[href]'));
      c.setAttribute('data-volta', '1');
      if (!as.length) { return; }
      var ant = as.filter(function (a) { return /^\s*←/.test(a.textContent); })[0];
      var alvo = ant || as[as.length - 1];
      var n = document.createElement('a');
      n.className = 'caminho-volta'; n.href = alvo.getAttribute('href');
      n.textContent = '← ' + alvo.textContent.replace(/^\s*←\s*/, '').trim();
      c.textContent = ''; c.appendChild(n);
    });
    var todos = document.querySelectorAll('.caminho-volta');
    if (todos.length > 1) {
      [].forEach.call(todos, function (a) {
        if (/^← In[ií]cio$/.test(a.textContent.trim())) { (a.parentNode || a).style.display = 'none'; }
      });
    }
  }
  function menuAtivo() {
    if (!/^\/o-pet\//.test(path)) { return; }
    document.querySelectorAll('.desktop-nav a[href="/o-pet/"], #mobile-menu a[href="/o-pet/"]').forEach(function (a) {
      a.classList.add('active'); a.setAttribute('aria-current', 'page');
    });
  }
  function ingresso() {
    var p = document.querySelector('.hm-ingresso');
    var fb = document.querySelector('footer .footer-bottom');
    if (p && fb && !p.classList.contains('footer-ingresso')) {
      p.className = 'footer-ingresso'; fb.parentNode.insertBefore(p, fb);
    }
  }
  function padrao() { textos(); setasInternas(); volta(); menuAtivo(); ingresso(); }

  aprenderHome(); setas(); selo(); votos(); temaTopo(); acompanhe(); capas(); padrao();
  var quadro = 0;
  new MutationObserver(function () {
    cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(function () { aprenderHome(); setas(); selo(); votos(); temaTopo(); acompanhe(); capas(); padrao(); });
  }).observe(document.body, { childList: true, subtree: true });
})();
