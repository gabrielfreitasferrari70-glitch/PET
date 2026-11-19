/* Contagem anônima de uso. Não guarda IP, nome nem identificador de visitante:
   envia só o tipo do evento, a página, a origem em categoria e o tipo de aparelho.
   Abrir qualquer página com ?nao-contar=1 tira este aparelho da contagem (?nao-contar=0 devolve). */
(() => {
  'use strict';
  const BASE = 'https://eupkdyhngmrsbvmaondp.supabase.co';
  const KEY = 'sb_publishable_XogjNPP1iiEFFF9SlCHdOQ_2taX94S9';
  const FORA = 'pet-nao-contar';
  const DIA = 'pet-visita-dia';
  const ler = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const gravar = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sem armazenamento */ } };
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

  const ativo = () => location.hostname === 'pet-conecta.vercel.app' && !navigator.webdriver && ler(FORA) !== '1';

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

  const medir = (tipo, extra) => {
    if (!ativo()) return;
    const pagina = location.pathname.toLowerCase();
    if (!/^\/[a-z0-9/_-]*$/.test(pagina)) return;
    const corpo = {
      p_tipo: tipo, p_pagina: pagina, p_origem: origem(),
      p_aparelho: matchMedia('(max-width:760px)').matches ? 'celular' : 'computador',
      p_novo: Boolean(extra?.novo), p_n: Number.isInteger(extra?.n) ? extra.n : null,
      p_ok: typeof extra?.ok === 'boolean' ? extra.ok : null
    };
    try {
      fetch(BASE + '/rest/v1/rpc/pet_medir', { method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }).catch(() => {});
    } catch { /* a contagem nunca atrapalha a página */ }
  };
  window.petMedir = medir;

  // Uma visita por página aberta. "novo" marca a primeira do dia neste aparelho, sem identificar ninguém.
  const d = new Date();
  const hoje = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  const novo = ler(DIA) !== hoje;
  if (ativo()) { if (novo) gravar(DIA, hoje); medir('visita', { novo }); }
})();
