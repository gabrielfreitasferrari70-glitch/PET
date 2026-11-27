// Seja um Petiano: marca cada etapa como concluida, agora ou em breve pela data, e filtra a lista de arquivos.
(function () {
  'use strict';
  var agora = Date.now();
  var passos = Array.prototype.slice.call(document.querySelectorAll('.sp-passo[data-inicio]'));
  var atual = null, proxima = null;
  passos.forEach(function (p) {
    var ini = Date.parse(p.dataset.inicio), fim = Date.parse(p.dataset.fim), estado, rotulo;
    if (agora > fim) { estado = 'feita'; rotulo = 'Concluída'; }
    else if (agora >= ini) { estado = 'agora'; rotulo = 'Agora'; atual = p; }
    else { estado = 'breve'; rotulo = 'Em breve'; if (!proxima) proxima = p; }
    p.dataset.estado = estado;
    var chip = p.querySelector('[data-estado]');
    if (chip) chip.textContent = rotulo;
    var linha = document.querySelector('[data-linha="' + p.id.replace('etapa-', '') + '"]');
    if (linha) { linha.dataset.estado = estado; if (estado === 'agora') linha.setAttribute('aria-current', 'step'); }
  });

  var card = document.querySelector('[data-agora]');
  var alvo = atual || proxima;
  if (card) {
    var t = card.querySelector('[data-agora-titulo]'), q = card.querySelector('[data-agora-quando]'),
        x = card.querySelector('[data-agora-texto]'), l = card.querySelector('[data-agora-link]');
    var eyebrow = card.querySelector('.eyebrow');
    if (alvo) {
      if (!atual && eyebrow) eyebrow.textContent = 'PRÓXIMA ETAPA';
      t.textContent = alvo.querySelector('h3').textContent;
      q.textContent = alvo.querySelector('.sp-quando').textContent;
      var p = alvo.querySelector('.sp-quando + p');
      x.textContent = p ? p.textContent : '';
      l.setAttribute('href', '#' + alvo.id);
    } else {
      if (eyebrow) eyebrow.textContent = 'PROCESSO ENCERRADO';
      t.textContent = 'Seleção concluída';
      q.textContent = 'O resultado final já foi publicado.';
      x.textContent = 'O próximo processo seletivo será anunciado no Instagram do PET. Enquanto isso, conheça os projetos e estude o material.';
      l.setAttribute('href', '#documentos');
    }
  }

  var filtros = Array.prototype.slice.call(document.querySelectorAll('.sp-filtro'));
  var grupos = Array.prototype.slice.call(document.querySelectorAll('.sp-doc-grupo'));
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filtro;
      filtros.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      grupos.forEach(function (g) { g.hidden = !!f && g.dataset.grupo !== f; });
    });
  });
})();
