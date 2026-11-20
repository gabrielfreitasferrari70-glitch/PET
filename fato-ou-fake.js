/* Fato ou Fake da Saúde: quiz de mitos e verdades, com fonte oficial em cada resposta.
   Roda neste navegador. O site só conta acertos e erros por pergunta, sem identificar quem respondeu. Conteúdo conferido em 19/11/2026. */
(function () {
  var raiz = document.getElementById('ff-app');
  if (!raiz) return;

  var Q = [
    { a: 'A vacina da gripe pode causar gripe.', fato: false,
      t: 'Não causa. A vacina é feita com vírus inativados e fragmentados, que não conseguem provocar a doença. Pode haver reações leves, como dor no braço, que passam em poucos dias. E quem fica resfriado logo depois, em geral, pegou outro vírus respiratório que circulava na mesma época.',
      f: 'Ministério da Saúde e Instituto Butantan' },
    { a: 'Uma criança pode enxergar mal sem perceber e sem reclamar.', fato: true,
      t: 'Para a criança, o jeito que ela enxerga é o "normal". Miopia, hipermetropia e astigmatismo estão entre as principais causas de baixa visão na infância, e o teste na escola descobre o problema antes que ele atrapalhe o aprendizado.',
      f: 'PET Medicina UFMT, projeto Acuidade Visual', l: { href: '/projetos/acuidade-visual/', txt: 'Conheça o Acuidade Visual' } },
    { a: 'Quem tomou a vacina do HPV não precisa fazer o exame preventivo.', fato: false,
      t: 'Precisa. A vacina protege contra os tipos mais perigosos do HPV, mas não contra todos, e não substitui o exame. Mulheres e pessoas com útero de 25 a 64 anos devem fazer o teste DNA-HPV a cada 5 anos (ou o preventivo, onde o teste ainda não chegou).',
      f: 'INCA' },
    { a: 'Para se cadastrar como doador de medula óssea, basta uma pequena coleta de sangue.', fato: true,
      t: 'No cadastro, ninguém mexe no osso: é só uma amostra de sangue para o exame de compatibilidade. Pode se cadastrar quem tem de 18 a 35 anos e está bem de saúde.',
      f: 'INCA/REDOME', l: { href: '/projetos/cadastro-do-bem/', txt: 'Veja o Cadastro do Bem' } },
    { a: 'Doar sangue vicia, engrossa ou afina o sangue.', fato: false,
      t: 'Nada disso acontece. O corpo repõe o volume doado, e a doação não muda a "espessura" do sangue. Também ninguém é obrigado a doar de novo.',
      f: 'Ministério da Saúde', l: { href: '/projetos/trote-solidario/', txt: 'Veja o Trote Solidário' } },
    { a: 'Mulheres de 40 a 49 anos podem fazer mamografia pelo SUS mesmo sem sintomas.', fato: true,
      t: 'Desde setembro de 2025, o SUS não restringe o exame nessa faixa. A decisão é tomada junto com o profissional de saúde. Dos 50 aos 74 anos, a mamografia é recomendada a cada 2 anos.',
      f: 'Ministério da Saúde, Nota Técnica nº 626/2025' },
    { a: 'Se alguém tiver uma parada cardíaca, o melhor é não tocar na pessoa e esperar o SAMU.', fato: false,
      t: 'Esperar parado diminui a chance de sobrevivência. Ligue 192 e comece logo as compressões no centro do peito, sem parar, até o socorro chegar. Qualquer pessoa pode fazer isso, e começar cedo faz muita diferença.',
      f: 'Hasselqvist-Ax et al., New England Journal of Medicine, 2015: reanimação antes da ambulância mais que dobrou a sobrevivência em 30 mil paradas cardíacas', l: { href: '/projetos/curso-aph/', txt: 'Conheça o Curso de APH' } },
    { a: 'A vacina contra o HPV é dose única para quem tem de 9 a 14 anos.', fato: true,
      t: 'Desde 2024, o SUS aplica uma única dose em meninas e meninos de 9 a 14 anos, seguindo a OMS. Em um estudo com mais de 2 mil jovens, uma dose protegeu mais de 97% contra os tipos 16 e 18, os que mais causam câncer.' + (new Date() < new Date(2027, 0, 1) ? ' Quem tem de 15 a 19 anos e nunca tomou pode se vacinar pelo SUS até 31 de dezembro de 2026.' : ''),
      f: 'Ministério da Saúde; Barnabas et al., NEJM Evidence, 2022 (estudo KEN SHE)' },
    { a: 'O Teste da Orelhinha só precisa ser feito se o bebê parecer ter algum problema.', fato: false,
      t: 'É para todos os recém-nascidos. O teste é obrigatório e gratuito desde 2010, rápido e indolor, e descobre perdas de audição que não aparecem a olho nu.',
      f: 'Lei Federal nº 12.303/2010', l: { href: '/aprender/saude-auditiva/', txt: 'Leia o material do PET' } },
    { a: 'Grávidas devem tomar vacinas durante a gestação para proteger também o bebê.', fato: true,
      t: 'A dTpa (a partir da 20ª semana) e a vacina contra o VSR (a partir da 28ª semana) passam anticorpos para o bebê, que fica protegido nos primeiros meses de vida. No principal estudo da vacina contra o VSR, publicado em 2023, ela evitou cerca de 8 em cada 10 casos graves nos primeiros 3 meses.',
      f: 'Calendário Nacional de Vacinação 2026; Kampmann et al., New England Journal of Medicine, 2023' }
  ];

  var i = 0, acertos = 0, ordem = [], partida = 0;
  // A cada partida as frases vêm em ordem sorteada; o número registrado continua sendo o da frase, não o da posição.
  function sortear() {
    ordem = Q.map(function (_, k) { return k; });
    for (var a = ordem.length - 1; a > 0; a--) { var b = Math.floor(Math.random() * (a + 1)); var t = ordem[a]; ordem[a] = ordem[b]; ordem[b] = t; }
  }
  var prog = document.getElementById('ff-progresso-txt');
  var barra = document.getElementById('ff-barra');
  var palco = document.getElementById('ff-palco');
  var pontos = document.getElementById('ff-pontos');
  var nAcertos = document.getElementById('ff-acertos');
  var tAcertos = document.getElementById('ff-acertos-txt');

  function montarPontos() {
    if (!pontos) return;
    pontos.textContent = '';
    for (var k = 0; k < Q.length; k++) pontos.appendChild(document.createElement('li'));
    placar();
  }
  function marcar(k, estado) {
    if (pontos && pontos.children[k]) pontos.children[k].className = estado;
  }
  function placar() {
    if (nAcertos) nAcertos.textContent = acertos;
    if (tAcertos) tAcertos.textContent = acertos === 1 ? 'acerto até aqui' : 'acertos até aqui';
  }

  // Foco sem pulo: a página só rola quando o que importa ficou fora da tela, e o mínimo necessário.
  var suave = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  function focar(alvo) { if (!alvo) return; try { alvo.focus({ preventScroll: true }); } catch (e) { alvo.focus(); } }
  function mostrar(alvo, bloco) {
    if (!alvo || !alvo.getBoundingClientRect) return;
    var r = alvo.getBoundingClientRect(), topo = 90, base = window.innerHeight - 70;
    if (r.top >= topo && r.bottom <= base) return;
    if (bloco === 'start' && r.top >= topo && r.top <= window.innerHeight * 0.5) return;
    alvo.scrollIntoView({ block: bloco || 'nearest', behavior: suave });
  }

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function atualizarProgresso(fim) {
    prog.textContent = fim ? 'Concluído' : 'Pergunta ' + (i + 1) + ' de ' + Q.length;
    barra.style.width = ((fim ? Q.length : i) / Q.length * 100) + '%';
  }

  function pergunta() {
    var q = Q[ordem[i]];
    var inicio = Date.now();
    atualizarProgresso(false);
    marcar(i, 'atual');
    palco.textContent = '';
    var card = el('div', 'ff-card');
    card.appendChild(el('span', 'eyebrow', 'Fato ou fake?'));
    var af = el('p', 'ff-afirmacao', '“' + q.a + '”');
    af.tabIndex = -1;
    card.appendChild(af);
    var bot = el('div', 'ff-botoes');
    var bF = el('button', null, 'Fato');
    var bK = el('button', null, 'Fake');
    bF.type = bK.type = 'button';
    bot.appendChild(bF);
    bot.appendChild(bK);
    card.appendChild(bot);
    var resp = el('div', 'ff-resposta');
    resp.hidden = true;
    resp.setAttribute('aria-live', 'polite');
    card.appendChild(resp);
    palco.appendChild(card);

    function responder(escolhaFato) {
      var certo = escolhaFato === q.fato;
      if (certo) acertos++;
      marcar(i, certo ? 'certa' : 'errada');
      if (window.petMedir) { if (i === 0) { partida = window.petVez ? window.petVez('quiz') : 1; window.petMedir('quiz_inicio', { tentativa: partida }); } window.petMedir('quiz_resposta', { n: ordem[i] + 1, ok: certo, posicao: i + 1, tentativa: partida, valor: Math.min(600000, Date.now() - inicio) }); }
      placar();
      bF.disabled = bK.disabled = true;
      (q.fato ? bF : bK).classList.add('ff-certa');
      if (!certo) (escolhaFato ? bF : bK).classList.add('ff-errada');
      resp.appendChild(el('span', 'ff-veredito' + (q.fato ? '' : ' fake'), q.fato ? 'É fato' : 'É fake'));
      resp.appendChild(el('h3', null, certo ? 'Você acertou!' : 'Não foi dessa vez.'));
      var p = el('p', null, q.t + ' ');
      if (q.l) { var a = el('a', null, q.l.txt + ' →'); a.href = q.l.href; p.appendChild(a); }
      resp.appendChild(p);
      resp.appendChild(el('p', 'meta int-fonte', 'Fonte: ' + q.f));
      var nav = el('div', 'ff-proxima');
      var prox = el('button', 'button', i + 1 < Q.length ? 'Próxima pergunta →' : 'Ver meu resultado →');
      prox.type = 'button';
      prox.addEventListener('click', function () { i++; if (i < Q.length) { pergunta(); focar(palco.querySelector('.ff-afirmacao')); mostrar(palco.querySelector('.ff-card'), 'start'); } else final(); });
      nav.appendChild(prox);
      resp.appendChild(nav);
      resp.hidden = false;
      focar(prox);
      // Âncora única: o topo do cartão. A resposta abre abaixo da frase e a página não fica subindo e descendo.
      var rc = card.getBoundingClientRect();
      if (rc.top < 90 || rc.bottom > window.innerHeight - 70) card.scrollIntoView({ block: 'start', behavior: suave });
    }
    bF.addEventListener('click', function () { responder(true); });
    bK.addEventListener('click', function () { responder(false); });
  }

  function final() {
    atualizarProgresso(true);
    if (window.petMedir) window.petMedir('quiz_fim', { n: acertos, tentativa: partida });
    palco.textContent = '';
    var box = el('div', 'ff-card ff-final');
    box.appendChild(el('span', 'eyebrow', 'Seu resultado'));
    var pl = el('p', 'ff-placar', acertos + '/' + Q.length);
    pl.tabIndex = -1;
    box.appendChild(pl);
    var msg = acertos === Q.length ? 'Perfeito! Você está imune à desinformação. Que tal desafiar alguém?'
      : acertos >= 7 ? 'Muito bem! Você conhece bastante sobre saúde. Compartilhe para ajudar mais gente.'
      : 'Esses boatos enganam muita gente. Agora você sabe a verdade: compartilhe para quebrar a corrente.';
    box.appendChild(el('p', null, msg));
    var acoes = el('div', 'int-acoes');
    var comp = el('button', 'button', 'Desafiar alguém');
    comp.type = 'button';
    comp.addEventListener('click', function () {
      if (window.petMedir) window.petMedir('quiz_acao', { alvo: 'desafiar' });
      var texto = 'Acertei ' + acertos + ' de ' + Q.length + ' no Fato ou Fake da Saúde do PET Medicina UFMT. Consegue fazer melhor?';
      var url = location.origin + '/fato-ou-fake/';
      if (navigator.share) { navigator.share({ title: 'Fato ou Fake da Saúde', text: texto, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(texto + ' ' + url).then(function () { avisar('Texto copiado. É só colar onde quiser.'); }, function () { avisar('Não deu para copiar. Copie o endereço da página.'); });
    });
    var de = el('button', 'button secondary', 'Jogar de novo');
    de.type = 'button';
    de.addEventListener('click', function () { if (window.petMedir) window.petMedir('quiz_acao', { alvo: 'jogar_de_novo' }); i = 0; acertos = 0; sortear(); montarPontos(); pergunta(); focar(palco.querySelector('.ff-afirmacao')); mostrar(palco.querySelector('.ff-card')); });
    acoes.appendChild(comp);
    acoes.appendChild(de);
    box.appendChild(acoes);
    var mais = el('p', 'int-privacidade');
    mais.appendChild(document.createTextNode('Viu um boato que não está aqui? '));
    var a = el('a', null, 'Mande para o PET →');
    a.href = '/comunidade/?tipo=tema';
    mais.appendChild(a);
    box.appendChild(mais);
    if (window.petAvaliar) window.petAvaliar(box, 'quiz');
    palco.appendChild(box);
    focar(pl);
    mostrar(box);
  }

  function avisar(t) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = t;
    toast.hidden = false;
    setTimeout(function () { toast.hidden = true; }, 3000);
  }

  sortear();
  montarPontos();
  pergunta();
})();
