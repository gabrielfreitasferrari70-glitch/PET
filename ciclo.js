/* Ciclo de alcance: pedido de ação (Leve o PET até você), página da ação com retorno anônimo,
   devolutiva (Você perguntou) e Onde o PET já esteve.
   Fora do endereço publicado (prévia, teste local) nada é enviado: a página mostra o que seria enviado. */
(function () {
  'use strict';
  var BASE = 'https://eupkdyhngmrsbvmaondp.supabase.co', KEY = 'sb_publishable_XogjNPP1iiEFFF9SlCHdOQ_2taX94S9';
  var ALIAS = '0c6a077896ce402455ad91693ad6b897';
  var NO_AR = location.hostname === 'pet-conecta.vercel.app';
  var RAIZ = document.currentScript && document.currentScript.src ? new URL('.', document.currentScript.src).href : '/';
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (txt != null) { e.textContent = txt; } return e; }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } }
  function dados(caminho) { return fetch(NO_AR ? caminho : RAIZ + caminho.slice(1), { cache: 'no-store' }).then(function (r) { if (!r.ok) { throw new Error('HTTP ' + r.status); } return r.json(); }); }
  // Só aceita endereço interno (/pasta/) ou https. Na prévia, o interno vira caminho relativo.
  function destino(u) { if (typeof u !== 'string') { return ''; } if (u.charAt(0) === '/' && u.charAt(1) !== '/') { return NO_AR ? u : RAIZ + u.slice(1) + (u.slice(-1) === '/' ? 'index.html' : ''); } return u.indexOf('https://') === 0 ? u : ''; }
  function link(u, txt) { var d = destino(u); if (!d) { return null; } var a = el('a', 'text-link'), fora = u.indexOf('https://') === 0; a.href = d; a.textContent = txt + (fora ? ' ↗' : ' →'); if (fora) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } return a; }
  function medir(alvo) { if (window.petMedir) { window.petMedir('avaliacao', { alvo: alvo }); } }

  /* ---------- Leve o PET até você: "Pedir esta ação" já escolhe a ação no pedido ---------- */
  document.querySelectorAll('[data-pedir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = $('lp-acao'); if (!sel) { return; }
      Array.prototype.forEach.call(sel.options, function (o, i) { if (o.text === b.getAttribute('data-pedir')) { sel.selectedIndex = i; } });
      var alvo = $('pedido'); if (alvo) { alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      setTimeout(function () { sel.focus({ preventScroll: true }); }, 400);
    });
  });

  /* ---------- Leve o PET até você: pedido formal de ação ---------- */
  var enviarBtn = $('lp-enviar');
  if (enviarBtn) {
    var msg = $('lp-msg'), previa = $('lp-previa');
    var estado = function (c, t) { msg.className = 'com-msg' + (c ? ' ' + c : ''); msg.textContent = t; };
    var valor = function (id) { return $(id).value.trim(); };
    var escolhido = function (id) { var s = $(id); return s.options[s.selectedIndex].text; };
    enviarBtn.addEventListener('click', function () {
      estado('', ''); previa.hidden = true;
      if ($('lp-hp').value) { estado('ok', 'Pedido enviado.'); return; }
      var inst = valor('lp-inst'), bairro = valor('lp-bairro'), nome = valor('lp-nome'), contato = valor('lp-contato'), qtd = valor('lp-qtd'), quando = valor('lp-quando'), obs = valor('lp-obs');
      var publico = Array.prototype.filter.call(document.querySelectorAll('[name=lp-publico]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (inst.length < 3) { estado('erro', 'Informe o nome da instituição.'); $('lp-inst').focus(); return; }
      if (bairro.length < 3) { estado('erro', 'Informe o bairro e a cidade.'); $('lp-bairro').focus(); return; }
      if (!publico.length) { estado('erro', 'Marque pelo menos um público.'); document.querySelector('[name=lp-publico]').focus(); return; }
      if (nome.length < 3) { estado('erro', 'Informe o nome de quem responde pelo pedido.'); $('lp-nome').focus(); return; }
      if (contato.length < 6) { estado('erro', 'Informe um telefone ou e-mail para o retorno.'); $('lp-contato').focus(); return; }
      var linhas = ['PEDIDO DE AÇÃO (Leve o PET até você)', 'Instituição: ' + inst + ' (' + escolhido('lp-tipo') + ')', 'Local: ' + bairro, 'Ação: ' + escolhido('lp-acao'), 'Público: ' + publico.join(', ') + (qtd ? ' · cerca de ' + qtd + ' pessoas' : ''), 'Período: ' + (quando || 'a combinar'), 'Responsável: ' + nome];
      if (obs) { linhas.push('Observações: ' + obs); }
      var texto = linhas.join('\n').slice(0, 1600);
      if (!NO_AR) { previa.textContent = texto + '\nContato: ' + contato; previa.hidden = false; estado('ok', 'Prévia: nada foi enviado. No site publicado, este pedido chega à caixa do responsável e por e-mail.'); return; }
      enviarBtn.disabled = true; enviarBtn.setAttribute('aria-busy', 'true'); estado('', 'Enviando…');
      var ok = 0, falhas = 0, feito = false;
      var fim = function (deuCerto) {
        if (deuCerto) { ok++; } else { falhas++; }
        if (feito || (!ok && falhas < 2)) { return; }
        feito = true; enviarBtn.disabled = false; enviarBtn.removeAttribute('aria-busy');
        if (!ok) { estado('erro', 'Não foi possível enviar agora. Tente novamente em instantes.'); return; }
        ['lp-inst', 'lp-bairro', 'lp-nome', 'lp-contato', 'lp-qtd', 'lp-quando', 'lp-obs'].forEach(function (id) { $(id).value = ''; });
        estado('ok', 'Pedido enviado! O retorno chega pelo contato que você informou.');
        if (window.petMedir) { window.petMedir('mensagem', { alvo: 'pedido-acao' }); }
      };
      // Dois destinos, como no Fale com o PET: a caixa privada do responsável e uma cópia por e-mail. Basta um funcionar.
      fetch(BASE + '/rest/v1/rpc/pet_enviar_mensagem', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ p: { tipo: 'parceria', categoria: '', texto: texto, nome: nome + ' · ' + inst, contato: contato } }) })
        .then(function (r) { fim(r.ok); }, function () { fim(false); });
      fetch('https://formsubmit.co/ajax/' + ALIAS, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, referrerPolicy: 'strict-origin-when-cross-origin', body: JSON.stringify({ _subject: 'PET Conecta: novo pedido de ação · ' + inst, _template: 'table', _captcha: 'false', Tipo: 'Pedido de ação', Mensagem: texto, Nome: nome, Contato: contato }) })
        .then(function (r) { fim(r.ok); }, function () { fim(false); });
    });
  }

  /* ---------- Material para imprimir: imprime só a folha escolhida ---------- */
  document.querySelectorAll('[data-imprimir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var folha = $(b.getAttribute('data-imprimir'));
      if (!folha) { return; }
      folha.classList.add('cx-alvo'); document.body.setAttribute('data-imprimir', '');
      var limpar = function () { folha.classList.remove('cx-alvo'); document.body.removeAttribute('data-imprimir'); window.removeEventListener('afterprint', limpar); };
      window.addEventListener('afterprint', limpar);
      try { window.print(); } catch (e) { limpar(); }
    });
  });

  /* ---------- Página da ação: o que o papel diz ---------- */
  var papel = document.querySelectorAll('[data-papel]');
  if (papel.length) {
    var mostrar = function (k) {
      papel.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-papel') === k ? 'true' : 'false'); });
      document.querySelectorAll('[data-painel]').forEach(function (p) { p.hidden = p.getAttribute('data-painel') !== k; });
    };
    papel.forEach(function (b) { b.addEventListener('click', function () { mostrar(b.getAttribute('data-papel')); }); });
    mostrar(location.hash === '#tudo-bem' ? 'bem' : 'consulta');
  }

  /* ---------- Página da ação: lembrete no calendário ---------- */
  var lembrar = $('ac-lembrar');
  if (lembrar) {
    lembrar.addEventListener('click', function () {
      var aviso = $('ac-lembrar-msg');
      if (!NO_AR) { aviso.textContent = 'Prévia: no site publicado, este botão baixa um lembrete para o calendário do celular, para daqui a 30 dias.'; return; }
      var d = new Date(Date.now() + 30 * 864e5), p = function (n) { return (n < 10 ? '0' : '') + n; };
      var dia = d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PET Conecta//Lembrete//PT', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@pet-conecta', 'DTSTAMP:' + dia + 'T120000Z', 'DTSTART;VALUE=DATE:' + dia, 'SUMMARY:Consulta de olhos da criança: já conseguiu?', 'DESCRIPTION:Conte ao PET como foi: https://pet-conecta.vercel.app/acao/acuidade-visual/', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'lembrete-consulta.ics';
      document.body.appendChild(a); a.click(); a.remove();
      aviso.textContent = 'Lembrete baixado. Abra o arquivo para salvar no calendário.';
    });
  }

  /* ---------- Página da ação: retorno anônimo ("conseguiu a consulta?") ---------- */
  var ret = $('ac-retorno');
  if (ret) {
    var CHAVE = 'pet-retorno-acuidade', passo2 = $('ac-passo2'), fimRet = $('ac-fim');
    var P2 = {
      ja: { perg: 'O médico indicou óculos?', ops: [['oculos-sim', 'Sim'], ['oculos-nao', 'Não'], ['oculos-aguarda', 'Ainda não sei']] },
      nao: { perg: 'O que mais dificultou até agora?', ops: [['motivo-onde', 'Não sei onde marcar'], ['motivo-vaga', 'Não consegui vaga'], ['motivo-tempo', 'Horário ou transporte'], ['motivo-achei', 'Achei que não precisava'], ['motivo-outro', 'Outro motivo']] }
    };
    var AJUDA = {
      'motivo-onde': 'Leve o papel da triagem à Unidade Básica de Saúde do seu bairro e peça o encaminhamento para o oftalmologista. Se ficar em dúvida, pergunte ao PET.',
      'motivo-vaga': 'Volte à unidade de saúde com o papel e pergunte pela fila de oftalmologia. Se quiser, conte ao PET o que aconteceu.',
      'motivo-tempo': 'Vale conversar com a escola e com a unidade de saúde sobre outro horário. A consulta é o passo que mostra se a criança precisa de óculos.',
      'motivo-achei': 'A triagem apontou que vale olhar com calma. Muitas crianças não reclamam porque acham que todo mundo enxerga igual. Só a consulta responde.',
      'marcada': 'Que bom. No dia, leve o papel da triagem, um documento da criança e o cartão do SUS.'
    };
    var encerrar = function (codigo) {
      gravar(CHAVE, '1'); passo2.hidden = true; fimRet.hidden = false;
      $('ac-fim-txt').textContent = (AJUDA[codigo] ? AJUDA[codigo] + ' ' : '') + 'Obrigado: sua resposta é anônima e ajuda o PET a melhorar as próximas ações.' + (NO_AR ? '' : ' (Prévia: nada foi enviado.)');
    };
    var botoes = function (onde, ops, aoClicar) {
      onde.textContent = '';
      ops.forEach(function (o) { var b = el('button', 'cx-op', o[1]); b.type = 'button'; b.addEventListener('click', function () { Array.prototype.forEach.call(onde.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.disabled = true; }); aoClicar(o[0]); }); onde.appendChild(b); });
    };
    if (ler(CHAVE) && NO_AR) { $('ac-passo1').hidden = true; fimRet.hidden = false; $('ac-fim-txt').textContent = 'Você já respondeu neste aparelho. Obrigado!'; }
    else {
      botoes($('ac-ops1'), [['ja', 'Sim, já foi'], ['marcada', 'Está marcada'], ['nao', 'Ainda não']], function (r) {
        medir('retorno:acuidade:consulta-' + r);
        if (!P2[r]) { encerrar(r); return; }
        $('ac-perg2').textContent = P2[r].perg; passo2.hidden = false;
        botoes($('ac-ops2'), P2[r].ops, function (r2) { medir('retorno:acuidade:' + r2); encerrar(r2); });
      });
    }
  }

  /* ---------- Você perguntou, o PET respondeu ---------- */
  var listaPr = $('vp-lista');
  if (listaPr) {
    dados('/devolutiva-dados.json').then(function (d) {
      var itens = (d.itens || []).filter(function (i) { return i && i.pergunta && i.resposta && (!i.exemplo || !NO_AR); });
      listaPr.textContent = '';
      if (!itens.length) { listaPr.appendChild(el('li', 'empty-state', 'Ainda não há respostas publicadas. Quando o PET responder a uma dúvida que serve para mais gente, ela aparece aqui, sem o nome de quem perguntou.')); return; }
      itens.forEach(function (i) {
        var li = el('li'), meta = el('div', 'cx-meta');
        if (i.exemplo) { meta.appendChild(el('span', 'chip', 'Exemplo da prévia')); }
        meta.appendChild(el('span', '', (i.tipo === 'tema' ? 'Tema votado pela comunidade' : 'Dúvida enviada pelo site') + (i.quando ? ' · ' + i.quando : '')));
        li.appendChild(meta); li.appendChild(el('h3', '', i.pergunta)); li.appendChild(el('p', '', i.resposta));
        var rod = el('div', 'cx-meta'), a = link(i.url, i.url_texto || 'Ler mais'), f = link(i.fonte_url, 'Fonte: ' + (i.fonte || 'ver'));
        if (a) { rod.appendChild(a); } if (f) { rod.appendChild(f); }
        if (rod.children.length) { li.appendChild(rod); }
        listaPr.appendChild(li);
      });
    }).catch(function () { listaPr.textContent = ''; listaPr.appendChild(el('li', 'empty-state', 'Não foi possível carregar as respostas agora. Tente novamente em instantes.')); });
  }

  /* ---------- Onde o PET já esteve ---------- */
  var nums = $('al-numeros');
  if (nums) {
    dados('/alcance-dados.json').then(function (d) {
      nums.textContent = '';
      (d.numeros || []).forEach(function (n) { var li = el('li'); li.appendChild(el('b', '', n.valor)); li.appendChild(el('strong', '', n.rotulo)); li.appendChild(el('span', '', n.detalhe)); var a = link(n.url, 'Ver a fonte'); if (a) { li.appendChild(a); } nums.appendChild(li); });
      var locais = $('al-locais'); locais.textContent = '';
      (d.locais || []).forEach(function (l) { var li = el('li'), c1 = el('div'), a = link(l.url, 'Ver o projeto'); c1.appendChild(el('strong', '', l.local)); c1.appendChild(el('span', '', l.tipo)); li.appendChild(c1); li.appendChild(el('span', '', l.acao + ' · ' + l.quando)); if (a) { li.appendChild(a); } locais.appendChild(li); });
      var depois = $('al-depois'); depois.textContent = '';
      var r = NO_AR ? d.retorno : (d.retorno || d.retorno_exemplo);
      if (!r || !r.respostas || r.respostas < 20) { depois.appendChild(el('p', 'empty-state', 'Ainda não há respostas suficientes. Os números aparecem aqui quando pelo menos 20 famílias tiverem respondido, para ninguém ser identificado.')); return; }
      if (!NO_AR && !d.retorno) { depois.appendChild(el('p', 'cx-aviso', 'Exemplo da prévia: estes números não são reais. Eles mostram como o bloco fica quando houver respostas.')); }
      var ul = el('ul', 'cx-nums');
      (r.itens || []).forEach(function (n) { var li = el('li'); li.appendChild(el('b', '', n.valor)); li.appendChild(el('strong', '', n.rotulo)); li.appendChild(el('span', '', n.detalhe)); ul.appendChild(li); });
      depois.appendChild(ul);
    }).catch(function () { nums.textContent = ''; nums.appendChild(el('li', 'empty-state', 'Não foi possível carregar os números agora. Tente novamente em instantes.')); });
  }
})();
