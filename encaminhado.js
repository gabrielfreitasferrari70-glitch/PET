// Fui encaminhado: progresso das etapas e lista do que levar (so neste aparelho), retorno anonimo e lembrete.
(function () {
  'use strict';
  var NO_AR = location.hostname === 'pet-conecta.vercel.app';
  var ler = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  var gravar = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };

  // Etapas: marcar como feito, chip de estado, cartao "Seu caminho"
  var CHAVE = 'pet-caminho-encaminhado';
  var feitos = ler(CHAVE) || {};
  var etapas = Array.prototype.slice.call(document.querySelectorAll('[data-etapa]'));
  var card = document.querySelector('[data-caminho]');
  var desenha = function () {
    var atual = null, n = 0;
    etapas.forEach(function (li) {
      var id = li.getAttribute('data-etapa'), ok = !!feitos[id];
      if (ok) n++;
      else if (!atual) atual = li;
      li.dataset.estado = ok ? 'feita' : (li === atual ? 'agora' : 'breve');
      var chip = li.querySelector('[data-estado]'); if (chip) chip.textContent = ok ? 'Feito' : (li === atual ? 'Próximo passo' : '');
      var b = li.querySelector('[data-feito]'); b.setAttribute('aria-pressed', String(ok)); b.querySelector('[data-feito-txt]').textContent = ok ? 'Feito (desmarcar)' : 'Marcar como feito';
      var linha = document.querySelector('[data-linha="' + id + '"]');
      if (linha) { linha.dataset.estado = li.dataset.estado; if (li === atual) linha.setAttribute('aria-current', 'step'); else linha.removeAttribute('aria-current'); }
    });
    if (!card) return;
    var t = card.querySelector('[data-caminho-titulo]'), c = card.querySelector('[data-caminho-conta]'), l = card.querySelector('[data-caminho-link]');
    card.querySelector('[data-caminho-barra]').style.width = Math.round(n / etapas.length * 100) + '%';
    if (atual) {
      t.textContent = 'Passo ' + (etapas.indexOf(atual) + 1) + ' · ' + atual.querySelector('h3').textContent;
      c.textContent = n ? n + ' de ' + etapas.length + ' etapas feitas' : 'Nenhuma etapa marcada ainda';
      l.setAttribute('href', '#' + atual.id); l.firstChild.textContent = 'Ir para esta etapa ';
    } else {
      t.textContent = 'Você chegou ao fim do caminho';
      c.textContent = 'As ' + etapas.length + ' etapas estão feitas';
      l.setAttribute('href', '#retorno'); l.firstChild.textContent = 'Contar ao PET como foi ';
    }
  };
  etapas.forEach(function (li) {
    li.querySelector('[data-feito]').addEventListener('click', function () {
      var id = li.getAttribute('data-etapa');
      if (feitos[id]) delete feitos[id]; else feitos[id] = 1;
      gravar(CHAVE, feitos); desenha();
    });
  });
  desenha();

  // O que levar
  var CHAVE2 = 'pet-caminho-levar', levar = ler(CHAVE2) || {};
  var caixas = Array.prototype.slice.call(document.querySelectorAll('[data-levar]'));
  var conta = document.querySelector('[data-levar-conta]');
  var contar = function () { var n = caixas.filter(function (x) { return x.checked; }).length; if (conta) conta.textContent = n === caixas.length ? 'Tudo separado. Boa consulta!' : n + ' de ' + caixas.length + ' separados'; };
  caixas.forEach(function (x) {
    x.checked = !!levar[x.getAttribute('data-levar')];
    x.addEventListener('change', function () { if (x.checked) levar[x.getAttribute('data-levar')] = 1; else delete levar[x.getAttribute('data-levar')]; gravar(CHAVE2, levar); contar(); });
  });
  contar();

  // Retorno anonimo: em que etapa voce esta (uma resposta por aparelho)
  var ops = document.querySelector('[data-ret-ops]'), fim = document.querySelector('[data-ret-fim]');
  var AJUDA = { papel: 'O próximo passo é a UBS do seu bairro, com o papel e os documentos.', ubs: 'Agora é acompanhar: confira o telefone no cadastro da UBS e consulte a lista de espera.', espera: 'Você pode acompanhar pelo portal de Transparência da Regulação. Se passar muito do normal, ligue 136.', consulta: 'Que bom! Siga a orientação do especialista e volte à UBS se ele pedir.', travou: 'Veja "Está demorando ou travou?" acima, ou mande sua dúvida para o PET pelo botão no fim da página.' };
  var CHAVE3 = 'pet-retorno-encaminhado';
  if (ops) {
    var botoes = Array.prototype.slice.call(ops.querySelectorAll('[data-ret]'));
    var travar = function (k) { botoes.forEach(function (b) { b.disabled = true; b.setAttribute('aria-pressed', String(b.getAttribute('data-ret') === k)); }); };
    var antes = ler(CHAVE3);
    if (antes && NO_AR) { travar(antes); fim.textContent = 'Você já respondeu neste aparelho. Obrigado! ' + (AJUDA[antes] || ''); }
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-ret');
        travar(k);
        if (NO_AR && window.petMedir) window.petMedir('avaliacao', { alvo: 'retorno:encaminhado:etapa-' + k });
        if (NO_AR) gravar(CHAVE3, k);
        fim.textContent = (AJUDA[k] || '') + ' Obrigado: a resposta é anônima.' + (NO_AR ? '' : ' (Prévia: nada foi enviado.)');
      });
    });
  }

  // Lembrete no calendario do celular, para daqui a 30 dias
  var lem = document.querySelector('[data-lembrete]'), aviso = document.querySelector('[data-lembrete-aviso]');
  if (lem) lem.addEventListener('click', function (ev) {
    ev.preventDefault();
    var d = new Date(Date.now() + 30 * 864e5), p = function (n) { return (n < 10 ? '0' : '') + n; };
    var dia = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PET Conecta//Lembrete//PT', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@pet-conecta', 'DTSTAMP:' + dia + 'T120000Z', 'DTSTART;VALUE=DATE:' + dia,
      'SUMMARY:Encaminhamento do PET: perguntar na UBS', 'DESCRIPTION:Confira a situação do pedido na UBS ou na lista de espera. Caminho completo: https://pet-conecta.vercel.app/encaminhado/', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'lembrete-encaminhamento.ics';
    document.body.appendChild(a); a.click(); a.remove();
    if (aviso) aviso.textContent = 'Lembrete baixado. Abra o arquivo para salvar no calendário do celular.';
  });
})();
