/* Registro anônimo de uso, para gestão e pesquisa (coleta v2).
   Não guarda IP, nome nem identificador que acompanhe a pessoa entre visitas. Cada registro leva o tipo do evento,
   a página e dados gerais do aparelho. A "sessao" é um código aleatório que vale só para a aba aberta.
   Abrir qualquer página com ?nao-contar=1 tira este aparelho do registro (?nao-contar=0 devolve). */
(() => {
  'use strict';
  const BASE = 'https://eupkdyhngmrsbvmaondp.supabase.co';
  const KEY = 'sb_publishable_XogjNPP1iiEFFF9SlCHdOQ_2taX94S9';
  const FORA = 'pet-nao-contar';
  const DIA = 'pet-visita-dia';
  const JA = 'pet-visita-primeira';
  const ler = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const gravar = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sem armazenamento */ } };
  const lerS = k => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const gravarS = (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* sem armazenamento */ } };
  let params = null;
  try { params = new URLSearchParams(location.search); } catch { /* endereço sem parâmetros */ }

  const avisar = texto => {
    const a = document.createElement('p');
    a.className = 'medir-aviso';
    a.setAttribute('role', 'status');
    a.textContent = texto;
    document.body.appendChild(a);
    setTimeout(() => a.remove(), 6000);
  };
  if (params?.has('nao-contar')) {
    const desligar = params.get('nao-contar') !== '0';
    gravar(FORA, desligar ? '1' : null);
    const dizer = () => avisar(desligar ? 'Este aparelho não entra mais na contagem de visitas.' : 'Este aparelho voltou a entrar na contagem de visitas.');
    if (document.body) dizer(); else document.addEventListener('DOMContentLoaded', dizer);
  }

  // Robôs, buscadores e pré-visualizadores de link não entram no registro.
  const robo = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pagespeed/i.test(navigator.userAgent || '');
  const ativo = () => location.hostname === 'pet-conecta.vercel.app' && !navigator.webdriver && !robo && ler(FORA) !== '1';
  const pagina = location.pathname.toLowerCase();
  if (!/^\/[a-z0-9/_-]*$/.test(pagina)) return;

  const origem = () => {
    const de = (params?.get('de') || params?.get('utm_source') || '').toLowerCase();
    if (['instagram', 'whatsapp', 'youtube'].includes(de)) return de;
    if (!document.referrer) return 'direto';
    let h = '';
    try { h = new URL(document.referrer).hostname; } catch { return 'outro'; }
    if (h === location.hostname) return 'interno';
    if (/(^|\.)instagram\.com$/.test(h)) return 'instagram';
    if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(h)) return 'whatsapp';
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return 'youtube';
    if (/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com)$/.test(h)) return 'busca';
    return 'outro';
  };
  const ua = navigator.userAgent || '';
  const so = /android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) ? 'ios' : /windows/i.test(ua) ? 'windows' : /mac os x/i.test(ua) ? 'mac' : /linux/i.test(ua) ? 'linux' : 'outro';
  const nav = /instagram/i.test(ua) ? 'instagram' : /samsungbrowser/i.test(ua) ? 'samsung' : /edg\//i.test(ua) ? 'edge' : /opr\//i.test(ua) ? 'opera' : /firefox|fxios/i.test(ua) ? 'firefox' : /chrome|crios/i.test(ua) ? 'chrome' : /safari/i.test(ua) ? 'safari' : 'outro';
  const largura = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const idioma = (navigator.language || '').toLowerCase().match(/^[a-z]{2}(-[a-z]{2})?/)?.[0] || null;
  let tema = 'paper';
  try { const g = JSON.parse(ler('pet-reading-plus') || '{}'); if (['paper', 'sepia', 'dark'].includes(g?.theme)) tema = g.theme; } catch { /* preferência ilegível */ }
  let sessao = lerS('pet-sessao');
  if (!/^[a-z0-9]{6,16}$/.test(sessao || '')) { sessao = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); gravarS('pet-sessao', sessao); }
  let ref = null;
  try { const r = new URL(document.referrer); if (r.hostname === location.hostname && /^\/[a-z0-9/_-]{0,79}$/.test(r.pathname.toLowerCase())) ref = r.pathname.toLowerCase(); } catch { /* sem referência */ }
  // Campanha: código opcional no link (?c=stories-vacina), lembrado enquanto a aba estiver aberta.
  let campanha = (params?.get('c') || '').toLowerCase();
  if (/^[a-z0-9-]{1,30}$/.test(campanha)) gravarS('pet-campanha', campanha); else campanha = lerS('pet-campanha') || undefined;
  const comum = { campanha, pagina, origem: origem(), aparelho: largura <= 760 ? 'celular' : 'computador', sessao, so, nav, tela: largura <= 760 ? 'p' : largura <= 1200 ? 'm' : 'g', idioma, tema };

  // Envia pelo próprio endereço do site (/m), que bloqueadores não barram; se não funcionar, vai direto ao banco.
  let via = lerS('pet-via') === 'd' ? 'd' : 'p';
  const direto = corpo => fetch(BASE + '/rest/v1/rpc/pet_registrar', { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ e: { ...corpo, via: 'd' } }) }).catch(() => {});
  const enviar = corpo => {
    try {
      if (via === 'd') { direto(corpo); return; }
      fetch('/m', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ e: { ...corpo, via: 'p' } }) })
        .then(r => { if (!r.ok) throw new Error('proxy'); })
        .catch(() => { via = 'd'; gravarS('pet-via', 'd'); direto(corpo); });
    } catch { /* o registro nunca atrapalha a página */ }
  };
  const inteiro = v => Number.isInteger(v) && v >= 0 ? v : undefined;
  const medir = (tipo, extra) => {
    if (!ativo()) return;
    const x = extra || {};
    enviar({ ...comum, tipo, ref,
      novo: x.novo === true || undefined, primeiro: x.primeiro === true || undefined, retorno: inteiro(x.retorno),
      n: inteiro(x.n), ok: typeof x.ok === 'boolean' ? x.ok : undefined, valor: inteiro(x.valor),
      dur: inteiro(x.dur), rolagem: inteiro(x.rolagem), tentativa: inteiro(x.tentativa), posicao: inteiro(x.posicao),
      alvo: typeof x.alvo === 'string' ? x.alvo.toLowerCase().replace(/[^a-z0-9:/._-]/g, '').slice(0, 60) || undefined : undefined,
      faixa: x.faixa, sexo: x.sexo, gestante: typeof x.gestante === 'boolean' ? x.gestante : undefined });
  };
  window.petMedir = medir;
  // Conta quantas vezes algo aconteceu nesta aba (1ª partida, 2ª lista…), para separar a primeira tentativa das repetições.
  window.petVez = chave => { const k = 'pet-vez-' + chave; const v = (Number(lerS(k)) || 0) + 1; gravarS(k, String(v)); return v; };
  // Pergunta de um toque no fim das ferramentas: "Isso foi útil?"
  window.petAvaliar = (onde, alvo) => {
    if (!onde) return;
    const caixa = document.createElement('div'); caixa.className = 'medir-util';
    const p = document.createElement('p'); p.textContent = 'Isso foi útil para você?';
    const sim = document.createElement('button'); sim.type = 'button'; sim.textContent = 'Sim';
    const nao = document.createElement('button'); nao.type = 'button'; nao.textContent = 'Não';
    const responder = ok => () => { medir('avaliacao', { alvo, ok }); p.textContent = 'Obrigado pela resposta.'; sim.remove(); nao.remove(); };
    sim.addEventListener('click', responder(true)); nao.addEventListener('click', responder(false));
    caixa.append(p, sim, nao); onde.appendChild(caixa);
  };
  if (!ativo()) return;

  // Visita: "novo" é a primeira do dia neste aparelho, "primeiro" a primeira de todas, "retorno" os dias desde a última.
  const d = new Date();
  const hoje = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const ultima = ler(DIA);
  const novo = ultima !== hoje;
  const primeiro = ler(JA) === null;
  let retorno;
  if (novo && ultima) { const p = ultima.split('-').map(Number); const dias = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(p[0], p[1] - 1, p[2])) / 864e5); if (dias > 0) retorno = Math.min(dias, 999); }
  if (novo) gravar(DIA, hoje);
  if (primeiro) gravar(JA, hoje);
  medir('visita', { novo, primeiro, retorno });

  // Saída: tempo com a aba visível e até onde a página foi rolada. Enviada uma vez, quando a aba é escondida ou fechada.
  let visivelDesde = document.visibilityState === 'visible' ? Date.now() : 0;
  let tempo = 0, rolou = 0, saiu = false;
  const medirRolagem = () => { const alt = document.documentElement.scrollHeight - window.innerHeight; const pct = alt <= 0 ? 100 : Math.round((window.scrollY || 0) / alt * 100); if (pct > rolou) rolou = Math.min(100, pct); };
  window.addEventListener('scroll', medirRolagem, { passive: true });
  const sair = () => {
    if (visivelDesde) { tempo += Date.now() - visivelDesde; visivelDesde = 0; }
    if (saiu) return;
    saiu = true; medirRolagem();
    medir('saida', { dur: Math.min(86400, Math.round(tempo / 1000)), rolagem: rolou });
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sair(); else if (!visivelDesde) visivelDesde = Date.now(); });
  window.addEventListener('pagehide', sair);

  // Cliques em links que saem do site e uso da busca (sem guardar o que foi digitado).
  document.addEventListener('click', ev => {
    const a = ev.target.closest?.('a[href]');
    if (!a) return;
    let u; try { u = new URL(a.href, location.href); } catch { return; }
    if (u.hostname === location.hostname || !/^https?:$/.test(u.protocol)) return;
    const h = u.hostname.toLowerCase();
    const grupo = /instagram\.com$/.test(h) ? 'instagram' : /(youtube\.com|youtu\.be)$/.test(h) ? 'youtube' : /(wa\.me|whatsapp\.com)$/.test(h) ? 'whatsapp' : /google\.com$/.test(h) ? 'google' : /gov\.br$/.test(h) ? 'governo' : 'outro';
    medir('clique', { alvo: grupo + ':' + h });
  }, true);
  let buscou = false;
  document.getElementById('search-dialog')?.addEventListener('input', () => { if (!buscou) { buscou = true; medir('busca'); } });
})();
