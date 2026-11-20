(() => {
  'use strict';
  const URL_SB = 'https://eupkdyhngmrsbvmaondp.supabase.co';
  const CHAVE = 'sb_publishable_XogjNPP1iiEFFF9SlCHdOQ_2taX94S9';
  const sb = window.supabase.createClient(URL_SB, CHAVE, {
    auth: {flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'pet-painel-sessao'}
  });

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };
  const n = (v) => Number(v || 0).toLocaleString('pt-BR');
  const telas = ['tela-entrar', 'tela-negado', 'tela-carregando', 'tela-painel'];
  const mostrar = (qual) => telas.forEach((t) => { $(t).hidden = t !== qual; });
  const horaAgora = () => new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  const msgErro = (e) => {
    const t = (e && (e.message || e.error_description)) || String(e || '');
    if (/sem acesso|42501|permission/i.test(t)) return 'Sem permissão para isso.';
    if (/rate limit|too many/i.test(t)) return 'Muitos pedidos seguidos. Espere alguns minutos e tente de novo.';
    if (/Failed to fetch|NetworkError|network/i.test(t)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
    return t || 'Algo deu errado. Tente de novo.';
  };
  const avisar = (id, texto) => { const p = $(id); p.textContent = texto || ''; p.hidden = !texto; };

  let eu = null; // {email, papel}

  // ================= Entrar =================
  $('form-email').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    avisar('entrar-erro', '');
    const email = $('email').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { avisar('entrar-erro', 'Digite um e-mail válido.'); $('email').focus(); return; }
    const b = $('enviar-link'); b.disabled = true; b.textContent = 'Enviando…';
    const {error} = await sb.auth.signInWithOtp({email, options: {emailRedirectTo: location.origin + '/', shouldCreateUser: true}});
    b.disabled = false; b.textContent = 'Enviar link de acesso';
    if (error) { avisar('entrar-erro', msgErro(error)); return; }
    $('email-enviado').textContent = email;
    $('form-email').hidden = true; $('link-enviado').hidden = false;
  });
  $('outro-email').addEventListener('click', () => { $('form-email').hidden = false; $('link-enviado').hidden = true; $('email').focus(); });
  $('form-codigo').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    avisar('entrar-erro', '');
    const token = $('codigo').value.replace(/\D/g, '');
    if (token.length < 6) { avisar('entrar-erro', 'O código tem 6 dígitos ou mais.'); return; }
    const {error} = await sb.auth.verifyOtp({email: $('email-enviado').textContent, token, type: 'email'});
    if (error) avisar('entrar-erro', msgErro(error));
  });
  const sair = async () => { await sb.auth.signOut(); eu = null; pararAtualizacao(); $('quem').hidden = true; $('form-email').hidden = false; $('link-enviado').hidden = true; mostrar('tela-entrar'); };
  $('sair').addEventListener('click', sair);
  $('negado-sair').addEventListener('click', sair);

  let verificando = false;
  const entrarComSessao = async (sessao) => {
    if (verificando) return;
    if (!sessao) { eu = null; mostrar('tela-entrar'); return; }
    verificando = true;
    mostrar('tela-carregando');
    const {data, error} = await sb.rpc('pet_painel_eu');
    verificando = false;
    if (error) { mostrar('tela-entrar'); avisar('entrar-erro', msgErro(error)); return; }
    if (!data) { $('negado-email').textContent = sessao.user.email || ''; mostrar('tela-negado'); return; }
    eu = data;
    $('quem-email').textContent = eu.email + (eu.papel === 'dono' ? ' · dono' : '');
    $('quem').hidden = false;
    $('aba-acessos').hidden = eu.papel !== 'dono';
    if (location.hash.includes('access_token')) history.replaceState(null, '', location.pathname);
    mostrar('tela-painel');
    abrirAba(abaInicial());
    carregarDados(); carregarMensagens();
    if (eu.papel === 'dono') carregarAcessos();
    iniciarAtualizacao();
  };
  sb.auth.onAuthStateChange((evento, sessao) => {
    if (evento === 'SIGNED_IN' && !eu) setTimeout(() => entrarComSessao(sessao), 0);
    if (evento === 'SIGNED_OUT') { eu = null; mostrar('tela-entrar'); }
  });

  // ================= Abas =================
  const ABAS = ['estatisticas', 'mensagens', 'acessos'];
  const abaInicial = () => { const h = location.hash.replace('#', ''); return ABAS.includes(h) && !(h === 'acessos' && eu.papel !== 'dono') ? h : 'estatisticas'; };
  const abrirAba = (qual, foco) => {
    ABAS.forEach((a) => {
      const b = $('aba-' + a), p = $('painel-' + a), sim = a === qual;
      b.setAttribute('aria-selected', String(sim)); b.tabIndex = sim ? 0 : -1; p.hidden = !sim;
      if (sim && foco) b.focus();
    });
    if (location.hash !== '#' + qual) history.replaceState(null, '', '#' + qual);
    if (qual === 'mensagens' && eu) carregarMensagens();
  };
  ABAS.forEach((a) => $('aba-' + a).addEventListener('click', () => abrirAba(a)));
  document.querySelector('.abas').addEventListener('keydown', (ev) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
    const vis = ABAS.filter((a) => !$('aba-' + a).hidden);
    const i = vis.findIndex((a) => $('aba-' + a).getAttribute('aria-selected') === 'true');
    abrirAba(vis[(i + (ev.key === 'ArrowRight' ? 1 : vis.length - 1)) % vis.length], true);
  });

  // ================= Atualização automática =================
  let timer = null;
  const iniciarAtualizacao = () => { pararAtualizacao(); timer = setInterval(() => { if (document.visibilityState === 'visible' && eu) { carregarMensagens(true); } }, 60000); };
  const pararAtualizacao = () => { if (timer) clearInterval(timer); timer = null; };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && eu) carregarMensagens(true); });

  // ================= Estatísticas =================
  let dias = 30; let dados = null;
  const PERIODOS = {7: 'Nos últimos 7 dias', 30: 'Nos últimos 30 dias', 90: 'Nos últimos 90 dias', 3650: 'Desde o início da contagem'};
  try { const salvo = Number(localStorage.getItem('pet-painel-dias')); if (PERIODOS[salvo]) dias = salvo; } catch (e) { /* sem armazenamento */ }
  const marcarPeriodo = () => document.querySelectorAll('[data-dias]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.dias) === dias)));
  document.querySelectorAll('[data-dias]').forEach((b) => b.addEventListener('click', () => {
    dias = Number(b.dataset.dias); marcarPeriodo();
    try { localStorage.setItem('pet-painel-dias', String(dias)); } catch (e) { /* sem armazenamento */ }
    carregarDados();
  }));
  marcarPeriodo();

  let pedidoDados = 0;
  const carregarDados = async () => {
    const meu = ++pedidoDados;
    $('est-atualizado').textContent = 'Atualizando…';
    const {data, error} = await sb.rpc('pet_painel_dados', {p_dias: dias});
    if (meu !== pedidoDados) return;
    if (error) { avisar('est-erro', 'Não foi possível carregar as estatísticas. ' + msgErro(error)); $('est-atualizado').textContent = ''; return; }
    avisar('est-erro', '');
    dados = data;
    $('est-atualizado').textContent = 'Atualizado às ' + horaAgora();
    desenharEstatisticas();
  };

  const vazio = (alvo, texto) => alvo.replaceChildren(el('p', 'vazio', texto || 'Ainda sem dados neste período.'));
  const barras = (alvo, itens, opc) => {
    opc = opc || {};
    if (!itens.length) { vazio(alvo); return; }
    const max = Math.max(1, ...itens.map((i) => i.valor));
    alvo.replaceChildren(...itens.map((i) => {
      const linha = el(opc.clicar ? 'button' : 'div', 'bar');
      if (opc.clicar) { linha.type = 'button'; linha.setAttribute('aria-pressed', String(Boolean(i.marcado))); linha.addEventListener('click', () => opc.clicar(i)); }
      const tr = el('span', 'trilho' + (i.cinza ? ' cinza' : '')); const f = el('span'); f.style.width = (i.valor / max * 100) + '%'; tr.append(f);
      linha.append(el('span', 'bar-nome', i.nome), el('span', 'bar-val', i.texto !== undefined ? i.texto : n(i.valor)), tr);
      return linha;
    }));
  };
  const pctTexto = (v, soma) => Math.round(v / (soma || 1) * 100) + '% · ' + n(v);
  const nomePagina = (p) => p === '/' ? 'Início (/)' : p === '(saída)' ? 'Saiu do site' : p;
  const ORIGENS = {direto: 'Link direto', instagram: 'Instagram', whatsapp: 'WhatsApp', youtube: 'YouTube', busca: 'Busca (Google e outros)', outro: 'Outros sites'};
  const NOMES = {a: 'Primeira visita', b: 'Voltou no dia seguinte', c: 'Voltou em 2 a 7 dias', d: 'Voltou em 8 a 30 dias', e: 'Voltou depois de 30 dias', android: 'Android', ios: 'iPhone e iPad', windows: 'Windows', mac: 'Mac', linux: 'Linux', outro: 'Outro', chrome: 'Chrome', safari: 'Safari', firefox: 'Firefox', edge: 'Edge', samsung: 'Samsung Internet', instagram: 'Navegador do Instagram', opera: 'Opera'};
  const FRASES = ['A vacina da gripe pode causar gripe (fake)', 'Criança pode enxergar mal sem reclamar (fato)', 'Quem tomou vacina do HPV dispensa o preventivo (fake)', 'Cadastro de medula só precisa de uma coleta de sangue (fato)', 'Doar sangue vicia, engrossa ou afina o sangue (fake)', 'Mamografia pelo SUS dos 40 aos 49 sem sintomas (fato)', 'Na parada cardíaca, não tocar e esperar o SAMU (fake)', 'Vacina do HPV é dose única dos 9 aos 14 anos (fato)', 'Teste da Orelhinha só se o bebê parecer ter problema (fake)', 'Grávidas devem se vacinar para proteger o bebê (fato)'];
  let caminhoEscolhido = null;

  const desenharEstatisticas = () => {
    if (!dados) return;
    const r = (dados.resumo || [])[0] || {};
    const frase = $('frase');
    if (!r.visitas_total) frase.textContent = PERIODOS[dias] + ', nenhuma visita registrada. A contagem começou em ' + (r.desde || '19/11/2026') + '.';
    else frase.textContent = PERIODOS[dias] + ', o site teve ' + n(r.visitas_total) + ' visitas, e ' + n(r.aparelhos_total) + ' aparelhos abriram o site pela primeira vez' + (dias !== 3650 ? '. No período anterior, de mesmo tamanho, foram ' + n(r.visitas_antes) + ' visitas' : '') + '. A contagem começou em ' + (r.desde || '19/11/2026') + ' e não inclui os aparelhos marcados para ficar de fora.';
    $('c-visitas').textContent = n(r.visitas_total);
    const cv = $('c-var'); cv.classList.remove('sobe', 'desce');
    if (dias === 3650) cv.textContent = 'Desde o início';
    else if (r.visitas_antes > 0) { const v = Math.round((r.visitas_total - r.visitas_antes) / r.visitas_antes * 100); cv.textContent = (v > 0 ? '+' : '') + v + '% em relação ao período anterior'; if (v) cv.classList.add(v > 0 ? 'sobe' : 'desce'); }
    else cv.textContent = 'Sem comparação ainda';
    $('c-aparelhos').textContent = n(r.aparelhos_total);
    $('c-apm').textContent = r.aparelhos_total > 0 ? (Math.round(r.visitas_total / r.aparelhos_total * 10) / 10).toLocaleString('pt-BR', {minimumFractionDigits: 1}) + ' visitas por aparelho novo' : 'Abriram o site pela primeira vez';
    const tu = (r.util_sim || 0) + (r.util_nao || 0);
    $('c-util').textContent = tu ? Math.round(r.util_sim / tu * 100) + '%' : '—';
    $('c-util-sub').textContent = n(r.util_sim) + ' sim e ' + n(r.util_nao) + ' não';
    $('c-quiz').textContent = n(r.quiz_fins);
    $('c-quiz-sub').textContent = 'de ' + n(r.quiz_inicios) + ' iniciados · média de ' + Number(r.quiz_media || 0).toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' acertos em 10';
    $('c-listas').textContent = n(r.listas);
    $('c-listas-sub').textContent = n(r.listas_impressas) + ' impressas ou salvas em PDF';

    linhaDiaria($('g-dia'), dados.diario || []);
    const rec = dados.recortes || [];
    const grupo = (g) => rec.filter((x) => x.grupo === g);
    barras($('g-paginas'), grupo('pagina').slice(0, 10).map((x) => ({nome: nomePagina(x.chave), valor: x.visitas})));
    const orig = grupo('origem'); const so = orig.reduce((s, x) => s + x.visitas, 0);
    barras($('g-origens'), orig.slice(0, 10).map((x) => ({nome: ORIGENS[x.chave] || x.chave, valor: x.visitas, texto: pctTexto(x.visitas, so)})));
    const ap = grupo('aparelho'); const sa = ap.reduce((s, x) => s + x.visitas, 0);
    barras($('g-aparelhos'), ap.map((x) => ({nome: x.chave === 'celular' ? 'Celular' : 'Computador', valor: x.visitas, texto: pctTexto(x.visitas, sa)})));
    desenharCaminhos();
    calor($('g-calor'), dados.horarios || []);
    funil($('g-funil-quiz'), r, [['Visitas à página', 'quiz_visitas'], ['Desafios iniciados', 'quiz_inicios'], ['Desafios concluídos', 'quiz_fins']]);
    funil($('g-funil-saude'), r, [['Visitas à página', 'saude_visitas'], ['Listas geradas', 'listas'], ['Listas impressas', 'listas_impressas']]);
    const perf = dados.perfil_saude || [];
    $('gestantes').textContent = n(perf.reduce((s, x) => s + (x.gestantes || 0), 0));
    barras($('g-perfil'), perf.map((x) => ({nome: x.faixa + ' anos · ' + (x.sexo === 'f' ? 'feminino' : 'masculino'), valor: x.listas, texto: n(x.listas) + (x.gestantes ? ' · ' + n(x.gestantes) + ' gestantes' : '')})));
    const tempo = (s) => s >= 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : s + ' s';
    barras($('g-tempo'), (dados.paginas_tempo || []).map((x) => ({nome: nomePagina(x.pagina), valor: x.tempo_mediano, texto: tempo(x.tempo_mediano) + ' · ' + x.rolagem_media + '% rolado · ' + n(x.saidas) + ' saídas'})));
    const det = (g, rot) => { const l = (dados.detalhes || []).filter((x) => x.grupo === g); const s = l.reduce((a, x) => a + x.total, 0); return l.map((x) => ({nome: rot(x.chave), valor: x.total, texto: pctTexto(x.total, s)})); };
    barras($('g-retorno'), det('retorno', (c) => NOMES[c] || c));
    barras($('g-cliques'), det('clique', (c) => String(c).split(':').pop()));
    barras($('g-so'), det('so', (c) => NOMES[c] || c));
    barras($('g-nav'), det('nav', (c) => NOMES[c] || c));
    const qp = (dados.quiz_perguntas || []).filter((x) => x.respostas > 0).map((x) => ({nome: FRASES[x.pergunta - 1] || 'Frase ' + x.pergunta, pct: Math.round(x.erros / x.respostas * 100), resp: x.respostas})).sort((a, b) => b.pct - a.pct);
    barras($('g-boatos'), qp.map((x) => ({nome: x.nome, valor: x.pct, texto: x.pct + '% · ' + n(x.resp) + ' respostas'})));
    colunas($('g-placares'), dados.quiz_placares || []);
    barras($('g-temas'), (dados.temas || []).map((x) => ({nome: x.tema, valor: x.votos, texto: n(x.votos) + (x.votos === 1 ? ' voto' : ' votos')})));
  };

  const desenharCaminhos = () => {
    const c = dados.caminhos || [];
    const ent = c.filter((x) => x.de === '(entrada)');
    if (!caminhoEscolhido || !ent.some((x) => x.para === caminhoEscolhido)) caminhoEscolhido = ent.length ? ent[0].para : null;
    const se = ent.reduce((s, x) => s + x.total, 0);
    barras($('g-entradas'), ent.map((x) => ({nome: nomePagina(x.para), valor: x.total, texto: pctTexto(x.total, se), para: x.para, marcado: x.para === caminhoEscolhido})), {clicar: (i) => { caminhoEscolhido = i.para; desenharCaminhos(); }});
    $('g-seg-t').textContent = caminhoEscolhido ? 'Depois de ' + nomePagina(caminhoEscolhido) + ', vão para' : 'Depois, vão para';
    const seg = c.filter((x) => x.de === caminhoEscolhido); const ss = seg.reduce((s, x) => s + x.total, 0);
    barras($('g-seguintes'), seg.map((x) => ({nome: nomePagina(x.para), valor: x.total, texto: pctTexto(x.total, ss), cinza: x.para === '(saída)'})));
    const sai = c.filter((x) => x.para === '(saída)'); const sx = sai.reduce((s, x) => s + x.total, 0);
    barras($('g-saidas'), sai.map((x) => ({nome: nomePagina(x.de), valor: x.total, texto: pctTexto(x.total, sx)})));
  };

  const SVG = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const e = document.createElementNS(SVG, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  const linhaDiaria = (alvo, r) => {
    if (!r.length) { vazio(alvo); return; }
    const W = Math.max(300, alvo.clientWidth || 600), H = 240, m = {t: 28, r: 12, b: 26, l: 34};
    const maxY = Math.max(4, ...r.map((p) => Math.max(p.visitas, p.visitantes)));
    const passoY = Math.max(1, Math.ceil(maxY / 4)); const topo = passoY * 4;
    const x = (i) => r.length === 1 ? (m.l + W - m.r) / 2 : m.l + i * (W - m.l - m.r) / (r.length - 1);
    const y = (v) => H - m.b - v / topo * (H - m.t - m.b);
    const dm = (s) => { const p = String(s).split('-'); return p[2] + '/' + p[1]; };
    const svg = sv('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Visitas e visitantes por dia'});
    for (let t = 0; t <= topo; t += passoY) { svg.append(sv('line', {x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: '#d1dfda'})); const tx = sv('text', {x: m.l - 6, y: y(t) + 4, 'text-anchor': 'end'}); tx.textContent = t; svg.append(tx); }
    const salto = Math.ceil(r.length / Math.max(2, Math.floor((W - m.l - m.r) / 60)));
    r.forEach((p, i) => { if (i % salto === 0) { const tx = sv('text', {x: x(i), y: H - 6, 'text-anchor': 'middle'}); tx.textContent = dm(p.dia); svg.append(tx); } });
    const caminho = (k) => r.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[k]).toFixed(1)).join(' ');
    svg.append(sv('path', {d: caminho('visitas') + ' L' + x(r.length - 1) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + ' Z', fill: '#0e614f', opacity: '.1'}));
    [['visitas', '#0e614f', 'Visitas'], ['visitantes', '#c2410c', 'Visitantes por dia']].forEach(([k, cor, nome], i) => {
      svg.append(sv('path', {d: caminho(k), fill: 'none', stroke: cor, 'stroke-width': 2}));
      svg.append(sv('line', {x1: m.l + i * 140, x2: m.l + i * 140 + 18, y1: 12, y2: 12, stroke: cor, 'stroke-width': 2}));
      const tx = sv('text', {x: m.l + i * 140 + 24, y: 16}); tx.textContent = nome; svg.append(tx);
    });
    const guia = sv('line', {y1: m.t, y2: H - m.b, stroke: '#3d4944', 'stroke-dasharray': '3 3', visibility: 'hidden'}); svg.append(guia);
    const dica = el('div', 'dica'); dica.hidden = true;
    const mover = (ev) => {
      const cx = alvo.getBoundingClientRect(); const px = (ev.clientX - cx.left) / cx.width * W;
      let k = 0; r.forEach((p, i) => { if (Math.abs(x(i) - px) < Math.abs(x(k) - px)) k = i; });
      guia.setAttribute('x1', x(k)); guia.setAttribute('x2', x(k)); guia.setAttribute('visibility', 'visible');
      dica.textContent = dm(r[k].dia) + ' · ' + n(r[k].visitas) + ' visitas · ' + n(r[k].visitantes) + ' visitantes'; dica.hidden = false;
      const esq = x(k) / W * cx.width; dica.style.left = Math.max(0, Math.min(cx.width - dica.offsetWidth, esq - dica.offsetWidth / 2)) + 'px';
    };
    svg.addEventListener('pointermove', mover); svg.addEventListener('pointerdown', mover);
    svg.addEventListener('pointerleave', () => { dica.hidden = true; guia.setAttribute('visibility', 'hidden'); });
    alvo.replaceChildren(svg, dica);
  };
  const calor = (alvo, r) => {
    if (!r.length) { vazio(alvo); return; }
    const D = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']; const max = Math.max(1, ...r.map((x) => x.visitas));
    const mapa = new Map(r.map((x) => [x.dia_semana + '-' + x.hora, x.visitas]));
    const pico = r.slice().sort((a, b) => b.visitas - a.visitas)[0];
    const padrao = 'Pico: ' + D[pico.dia_semana - 1] + ' às ' + pico.hora + 'h, com ' + n(pico.visitas) + ' visitas.';
    const leg = el('p', 'calor-leg', padrao);
    const grade = el('div', 'calor');
    D.forEach((nd, i) => {
      const l = el('div', 'calor-l'); l.append(el('span', null, nd));
      for (let h = 0; h < 24; h++) { const v = mapa.get((i + 1) + '-' + h) || 0; const c = el('span', 'cel'); if (v) { c.style.background = '#0e614f'; c.style.opacity = String(0.2 + 0.8 * v / max); } c.addEventListener('pointerenter', () => { leg.textContent = nd + ' às ' + h + 'h · ' + n(v) + ' visitas'; }); l.append(c); }
      grade.append(l);
    });
    const hs = el('div', 'calor-l'); hs.append(el('span')); for (let h = 0; h < 24; h++) hs.append(el('span', null, h % 6 === 0 ? h + 'h' : '')); grade.append(hs);
    grade.addEventListener('pointerleave', () => { leg.textContent = padrao; });
    alvo.replaceChildren(grade, leg);
  };
  const funil = (alvo, r, etapas) => {
    if (!r[etapas[0][1]]) { vazio(alvo); return; }
    const base = Math.max(1, ...etapas.map((e) => r[e[1]] || 0));
    const f = el('div', 'funil');
    etapas.forEach((e, i) => {
      const v = r[e[1]] || 0, antes = i ? r[etapas[i - 1][1]] || 0 : 0;
      const b = el('div', 'etapa'); const t = el('div', 'etapa-t'); t.append(el('span', null, e[0]), el('span', 'etapa-n', n(v)));
      const barra = el('span', 'etapa-b'); barra.style.width = (v / base * 100) + '%'; barra.style.opacity = String(1 - i * 0.25);
      b.append(t, barra); if (i) b.append(el('span', 'etapa-p', antes > 0 ? Math.round(v / antes * 100) + '% da etapa anterior' : 'sem etapa anterior ainda'));
      f.append(b);
    });
    alvo.replaceChildren(f);
  };
  const colunas = (alvo, r) => {
    if (!r.some((x) => x.jogos > 0)) { alvo.style.display = 'block'; vazio(alvo); return; }
    alvo.style.display = '';
    const max = Math.max(1, ...r.map((x) => x.jogos));
    alvo.replaceChildren(...r.map((x) => { const c = el('div', 'col'); const b = el('span', 'col-b'); b.style.height = Math.round(x.jogos / max * 140) + 'px'; c.append(el('span', null, n(x.jogos)), b, el('span', 'col-r', String(x.placar))); return c; }));
  };
  let larguraAntes = window.innerWidth;
  window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - larguraAntes) > 40 && dados) { larguraAntes = window.innerWidth; linhaDiaria($('g-dia'), dados.diario || []); } });

  // ================= Mensagens =================
  const TIPOS = {duvida: 'Dúvida de saúde', tema: 'Sugestão de tema', mensagem: 'Mensagem', parceria: 'Proposta de parceria'};
  const CATS = {infancia: 'Saúde da criança', 'saude-sexual': 'Saúde sexual', 'saude-mental': 'Saúde mental', inclusao: 'Inclusão', outro: 'Outro tema'};
  const ESTADOS = {nova: 'Nova', lida: 'Lida', andamento: 'Em andamento', resolvida: 'Resolvida', arquivada: 'Arquivada'};
  let caixa = []; let filtro = 'entrada', tipoSel = '', busca = '', aberta = null; const rascunhos = {};
  let carregandoMsgs = false;
  const carregarMensagens = async (silencioso) => {
    if (carregandoMsgs || !eu) return;
    carregandoMsgs = true;
    if (!silencioso) $('cx-atualizado').textContent = 'Atualizando…';
    const {data, error} = await sb.rpc('pet_painel_mensagens');
    carregandoMsgs = false;
    if (error) { avisar('cx-erro', 'Não foi possível carregar as mensagens. ' + msgErro(error)); $('cx-atualizado').textContent = ''; if (!caixa.length) $('badge').textContent = '—'; return; }
    avisar('cx-erro', '');
    caixa = Array.isArray(data) ? data : [];
    $('cx-atualizado').textContent = 'Atualizado às ' + horaAgora();
    desenharCaixa();
  };
  const contar = () => { const c = (e) => caixa.filter((m) => m.estado === e).length; return {nova: c('nova'), lida: c('lida'), andamento: c('andamento'), resolvida: c('resolvida'), arquivada: c('arquivada'), entrada: c('nova') + c('lida') + c('andamento'), todas: caixa.length}; };
  const desenharResumo = () => {
    const k = contar();
    const b = $('badge'); b.textContent = n(k.nova); b.classList.toggle('tem', k.nova > 0); b.setAttribute('aria-label', k.nova + ' não lidas');
    $('cx-c-novas').textContent = n(k.nova); $('cx-c-andamento').textContent = n(k.andamento); $('cx-c-resolvidas').textContent = n(k.resolvida); $('cx-c-total').textContent = 'de ' + n(k.todas) + ' recebidas';
    document.querySelectorAll('[data-n]').forEach((s) => { s.textContent = n(k[s.dataset.n]); });
    const h = caixa.filter((m) => m.estado === 'resolvida' && m.resolvida_em).map((m) => (new Date(m.resolvida_em) - new Date(m.criado_em)) / 36e5).filter((x) => x >= 0).sort((a, b) => a - b);
    let med = null; if (h.length) { const i = Math.floor(h.length / 2); med = Math.round((h.length % 2 ? h[i] : (h[i - 1] + h[i]) / 2) * 10) / 10; }
    $('cx-c-tempo').textContent = med === null ? '—' : med < 48 ? n(med) + ' h' : n(Math.round(med / 24 * 10) / 10) + ' dias';
  };
  const quandoTexto = (iso) => {
    const d = new Date(iso); const min = (Date.now() - d) / 6e4;
    if (min < 1) return 'agora'; if (min < 60) return 'há ' + Math.floor(min) + ' min'; if (min < 1440) return 'há ' + Math.floor(min / 60) + ' h';
    return d.toLocaleDateString('pt-BR', {timeZone: 'America/Cuiaba', day: '2-digit', month: '2-digit', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined}) + ' às ' + d.toLocaleTimeString('pt-BR', {timeZone: 'America/Cuiaba', hour: '2-digit', minute: '2-digit'});
  };
  const dataHora = (iso) => { const d = new Date(iso); return d.toLocaleDateString('pt-BR', {timeZone: 'America/Cuiaba'}) + ' às ' + d.toLocaleTimeString('pt-BR', {timeZone: 'America/Cuiaba', hour: '2-digit', minute: '2-digit'}); };
  const contatoLinks = (m) => {
    const c = (m.contato || '').trim(); const links = [];
    const primeiro = (m.nome || '').trim().split(/\s+/)[0] || '';
    const trecho = m.texto.length > 160 ? m.texto.slice(0, 157) + '…' : m.texto;
    const saud = 'Olá' + (primeiro ? ', ' + primeiro : '') + '! Aqui é do PET Medicina UFMT, sobre a sua mensagem no PET Conecta: "' + trecho + '"\n\n';
    const email = c.match(/[^\s@<>()"']+@[^\s@<>()"']+\.[^\s@<>()"']+/);
    if (email) links.push({rotulo: 'Responder por e-mail', href: 'mailto:' + encodeURIComponent(email[0]).replace(/%40/g, '@') + '?subject=' + encodeURIComponent('Resposta do PET Medicina UFMT') + '&body=' + encodeURIComponent(saud)});
    const dig = c.replace(/\D/g, '');
    if (!email && dig.length >= 10 && dig.length <= 13) links.push({rotulo: 'Responder pelo WhatsApp', href: 'https://wa.me/' + (dig.length <= 11 ? '55' + dig : dig) + '?text=' + encodeURIComponent(saud)});
    return links;
  };
  const salvar = async (m, mudanca) => {
    const {data, error} = await sb.rpc('pet_painel_marcar', {p_id: m.id, p: mudanca});
    if (error) { avisar('cx-erro', 'Não foi possível salvar a mudança. ' + msgErro(error)); return false; }
    avisar('cx-erro', '');
    Object.assign(m, {estado: data.estado, lida_em: data.lida_em, resolvida_em: data.resolvida_em, nota: data.nota || '', atualizado_em: data.atualizado_em, atualizado_por: data.atualizado_por});
    return true;
  };
  document.querySelectorAll('[data-filtro]').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.filtro; document.querySelectorAll('[data-filtro]').forEach((o) => o.setAttribute('aria-pressed', String(o === b))); desenharLista();
  }));
  $('cx-tipo').addEventListener('change', (ev) => { tipoSel = ev.target.value; desenharLista(); });
  $('cx-busca').addEventListener('input', (ev) => { busca = ev.target.value.trim().toLowerCase(); desenharLista(); });
  const desenharCaixa = () => { desenharResumo(); desenharLista(); };
  const desenharLista = () => {
    const raiz = $('cx-lista');
    // Não redesenhar enquanto alguém digita uma nota (a atualização automática esperaria a próxima rodada)
    if (raiz.contains(document.activeElement) && document.activeElement.tagName === 'TEXTAREA') return;
    const lista = caixa.filter((m) => {
      if (filtro === 'entrada' && !['nova', 'lida', 'andamento'].includes(m.estado)) return false;
      if (!['entrada', 'todas'].includes(filtro) && m.estado !== filtro) return false;
      if (tipoSel && m.tipo !== tipoSel) return false;
      if (busca && !(m.texto + ' ' + m.nome + ' ' + m.contato).toLowerCase().includes(busca)) return false;
      return true;
    });
    if (!lista.length) { raiz.replaceChildren(el('p', 'lista-vazia', caixa.length ? 'Nenhuma mensagem com esses filtros.' : 'Nenhuma mensagem recebida ainda. Quando alguém escrever em Fale com o PET, ela aparece aqui.')); return; }
    raiz.replaceChildren(...lista.map((m) => {
      const item = el('article', 'item' + (m.estado === 'nova' ? ' nova' : '') + (aberta === m.id ? ' aberta' : ''));
      const cab = el('button', 'item-cab'); cab.type = 'button'; cab.setAttribute('aria-expanded', String(aberta === m.id));
      const topo = el('div'); const meta = el('div', 'meta');
      meta.append(el('span', 'tipo', TIPOS[m.tipo] || m.tipo));
      if (m.categoria) meta.append(el('span', null, '· ' + (CATS[m.categoria] || m.categoria)));
      meta.append(el('span', null, '· ' + (m.nome || 'Sem nome')), el('span', 'estado ' + m.estado, ESTADOS[m.estado] || m.estado));
      topo.append(meta, el('p', 'resumo', m.texto));
      cab.append(topo, el('span', 'quando', quandoTexto(m.criado_em)));
      cab.addEventListener('click', async () => {
        aberta = aberta === m.id ? null : m.id;
        desenharLista();
        if (aberta === m.id && m.estado === 'nova') { if (await salvar(m, {estado: 'lida'})) desenharCaixa(); }
      });
      item.append(cab);
      if (aberta === m.id) {
        const corpo = el('div', 'corpo');
        corpo.append(el('p', 'texto', m.texto));
        const dl = el('dl', 'dados'); const lin = (t, v) => dl.append(el('dt', null, t), el('dd', null, v));
        lin('Nome', m.nome || 'Não informado'); lin('Contato', m.contato || 'Não informado'); lin('Recebida', dataHora(m.criado_em));
        corpo.append(dl);
        const acoes = el('div', 'acoes');
        contatoLinks(m).forEach((l) => {
          const a = el('a', 'btn', l.rotulo); a.href = l.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.addEventListener('click', async () => { if (['nova', 'lida'].includes(m.estado) && await salvar(m, {estado: 'andamento'})) desenharCaixa(); });
          acoes.append(a);
        });
        const botao = (rot, mud, desl) => { const b = el('button', 'btn-sec', rot); b.type = 'button'; b.disabled = Boolean(desl); b.addEventListener('click', async () => { b.disabled = true; if (await salvar(m, mud)) { if (mud.estado === 'nova' || mud.estado === 'arquivada') aberta = null; desenharCaixa(); } else b.disabled = false; }); acoes.append(b); };
        if (m.estado === 'resolvida' || m.estado === 'arquivada') botao('Reabrir', {estado: 'lida'});
        else { botao('Em andamento', {estado: 'andamento'}, m.estado === 'andamento'); botao('Marcar como resolvida', {estado: 'resolvida'}); botao('Marcar como não lida', {estado: 'nova'}); botao('Arquivar', {estado: 'arquivada'}); }
        corpo.append(acoes);
        const nota = el('div'); const idt = 'nota-' + m.id;
        const lab = el('label', null, 'Nota interna (só quem tem acesso ao painel vê)'); lab.htmlFor = idt;
        const ta = el('textarea'); ta.id = idt; ta.maxLength = 1000; ta.value = rascunhos[m.id] !== undefined ? rascunhos[m.id] : (m.nota || '');
        ta.addEventListener('input', () => { rascunhos[m.id] = ta.value; });
        const sn = el('button', 'btn-sec', 'Salvar nota'); sn.type = 'button'; sn.style.marginTop = 'var(--esp-2)';
        sn.addEventListener('click', async () => { sn.disabled = true; if (await salvar(m, {nota: ta.value.slice(0, 1000)})) { delete rascunhos[m.id]; sn.textContent = 'Nota salva'; setTimeout(() => { sn.textContent = 'Salvar nota'; }, 1800); } sn.disabled = false; });
        nota.append(lab, ta, sn); corpo.append(nota);
        const hist = [];
        if (m.lida_em) hist.push('Lida em ' + dataHora(m.lida_em));
        if (m.resolvida_em) hist.push('resolvida em ' + dataHora(m.resolvida_em));
        if (m.atualizado_em && m.atualizado_por) hist.push('última mudança em ' + dataHora(m.atualizado_em) + ', por ' + (m.atualizado_por === eu.email ? 'você' : m.atualizado_por));
        if (hist.length) corpo.append(el('p', 'hist', hist.join(' · ') + '.'));
        item.append(corpo);
      }
      return item;
    }));
  };

  // ================= Acessos =================
  let acessos = [];
  const carregarAcessos = async () => {
    const {data, error} = await sb.rpc('pet_painel_acessos');
    if (error) { avisar('ac-erro', msgErro(error)); return; }
    acessos = data || []; desenharAcessos();
  };
  const desenharAcessos = () => {
    const raiz = $('ac-lista');
    raiz.replaceChildren(...acessos.map((a) => {
      const c = el('div', 'cartao acesso');
      const info = el('div'); const linha1 = el('div', 'meta'); linha1.append(el('span', 'acesso-e', a.email), el('span', 'selo', a.papel === 'dono' ? 'Dono' : 'Membro'));
      if (a.email === eu.email) linha1.append(el('span', null, '(você)'));
      info.append(linha1, el('p', 'sub', 'Autorizado em ' + dataHora(a.criado_em) + (a.criado_por && a.criado_por !== 'instalação' ? ' por ' + a.criado_por : '')));
      c.append(info);
      if (a.email !== eu.email) {
        const acs = el('div', 'acoes');
        const trocar = el('button', 'btn-sec', a.papel === 'dono' ? 'Tornar membro' : 'Tornar dono'); trocar.type = 'button';
        trocar.addEventListener('click', () => autorizar(a.email, a.papel === 'dono' ? 'membro' : 'dono', trocar));
        const rem = el('button', 'btn-sec btn-perigo', 'Remover'); rem.type = 'button';
        let armado = false;
        rem.addEventListener('click', async () => {
          if (!armado) { armado = true; rem.textContent = 'Confirmar remoção'; setTimeout(() => { armado = false; rem.textContent = 'Remover'; }, 4000); return; }
          rem.disabled = true;
          const {data, error} = await sb.rpc('pet_painel_remover', {p_email: a.email});
          if (error) { avisar('ac-erro', msgErro(error)); rem.disabled = false; return; }
          avisar('ac-erro', ''); avisar('ac-ok', a.email + ' não tem mais acesso.'); acessos = data || []; desenharAcessos();
        });
        acs.append(trocar, rem); c.append(acs);
      }
      return c;
    }));
  };
  const autorizar = async (email, papel, botao) => {
    if (botao) botao.disabled = true;
    const {data, error} = await sb.rpc('pet_painel_autorizar', {p_email: email, p_papel: papel});
    if (botao) botao.disabled = false;
    if (error) { avisar('ac-ok', ''); avisar('ac-erro', msgErro(error)); return false; }
    avisar('ac-erro', ''); avisar('ac-ok', email + ' agora é ' + (papel === 'dono' ? 'dono' : 'membro') + '. A pessoa entra em ' + location.host + ' com esse e-mail.');
    acessos = data || []; desenharAcessos(); return true;
  };
  $('form-acesso').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = $('novo-email').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { avisar('ac-ok', ''); avisar('ac-erro', 'Digite um e-mail válido.'); $('novo-email').focus(); return; }
    if (await autorizar(email, $('novo-papel').value, ev.submitter)) $('novo-email').value = '';
  });

  // ================= Início =================
  (async () => {
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.get('error_description')) { mostrar('tela-entrar'); avisar('entrar-erro', 'O link não funcionou (' + hash.get('error_description').replace(/\+/g, ' ') + '). Peça um novo.'); history.replaceState(null, '', location.pathname); return; }
    const {data} = await sb.auth.getSession();
    entrarComSessao(data.session);
  })();
})();
