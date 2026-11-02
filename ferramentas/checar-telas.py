#!/usr/bin/env python3
"""Abre o site num navegador sem janela, em celular (360px) e computador (1280px), tema claro e escuro.
Tira capturas e confere o que so aparece na tela renderizada.
   pip install playwright && python3 -m playwright install chromium   (uma vez)
   python3 ferramentas/checar-telas.py                 # paginas principais
   python3 ferramentas/checar-telas.py --todas         # todas as paginas do sitemap

Capturas em ferramentas/telas/ (fora do git e fora da publicacao).
Verificacoes:
  T01 rolagem lateral da pagina          FALHA
  T02 tabela ou lista cortada sem rolagem FALHA
  T03 erros no console                   FALHA (falhas de rede do ambiente sao listadas a parte)
  T04 alvos de toque com menos de 44px de altura ou 24px de largura  META (so no celular)
"""
import asyncio, functools, http.server, json, os, re, sys, threading

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'ferramentas', 'telas')
PRINCIPAIS = ['/', '/projetos/', '/projetos/curso-aph/', '/agenda/', '/comunidade/', '/youtube/', '/aprender/',
              '/aprender/manual-pet/', '/publicacoes/', '/publicacoes/anamnese/', '/publicacoes/anamnese-48/',
              '/o-pet/', '/o-pet/linha-do-tempo/', '/participar/', '/redes/', '/de-jaleco-e-fone/']
PORTA = 8765

MEDIR = r'''() => {
  const W = document.documentElement.clientWidth, out = {rolagem: document.documentElement.scrollWidth > W + 1, cortados: [], pequenos: []};
  document.querySelectorAll('body *').forEach(e => {
    const cs = getComputedStyle(e);
    if (/(hidden|clip)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 2 && e.querySelector('table, ul, ol, img'))
      out.cortados.push((e.className || e.tagName).toString().slice(0, 40) + ' ' + e.scrollWidth + '>' + e.clientWidth);
  });
  document.querySelectorAll('a, button, input, select, summary, [role=button]').forEach(e => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    if (!r.width || !r.height || cs.visibility === 'hidden') return;
    if (e.tagName === 'A' && cs.display === 'inline' && e.closest('p, li, td')) return;  // link no meio do texto
    if (r.height < 44 || r.width < 24)
      out.pequenos.push(e.tagName.toLowerCase() + '.' + (e.className || '').toString().split(' ')[0] + ' "' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return out;
}'''


class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def servidor():
    h = functools.partial(Silencioso, directory=RAIZ)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', PORTA), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


async def main():
    from playwright.async_api import async_playwright
    paginas = PRINCIPAIS
    if '--todas' in sys.argv:
        with open(os.path.join(RAIZ, 'sitemap.xml'), encoding='utf-8') as f:
            paginas = re.findall(r'<loc>https://pet-conecta\.vercel\.app([^<]*)</loc>', f.read())
    os.makedirs(SAIDA, exist_ok=True)
    srv = servidor()
    res = {'T01': [], 'T02': [], 'T03': [], 'rede': set(), 'T04': {}}
    async with async_playwright() as p:
        try:
            nav = await p.chromium.launch()
        except Exception:
            nav = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for largura, altura in ((360, 780), (1280, 900)):
            for tema in ('claro', 'escuro'):
                ctx = await nav.new_context(viewport={'width': largura, 'height': altura})
                if tema == 'escuro':
                    await ctx.add_init_script("try{localStorage.setItem('pet-reading-plus',JSON.stringify({theme:'dark'}))}catch(e){}")
                pg = await ctx.new_page()
                erros = []
                pg.on('console', lambda m: m.type == 'error' and erros.append(m.text))
                pg.on('pageerror', lambda e: erros.append('JS: ' + str(e)))
                for caminho in paginas:
                    erros.clear()
                    try:
                        await pg.goto('http://127.0.0.1:%d%s' % (PORTA, caminho), wait_until='networkidle', timeout=20000)
                    except Exception:
                        await pg.goto('http://127.0.0.1:%d%s' % (PORTA, caminho), wait_until='load', timeout=20000)
                    await pg.wait_for_timeout(400)
                    nome = (caminho.strip('/').replace('/', '-') or 'inicio') + '-%d-%s.png' % (largura, tema)
                    await pg.screenshot(path=os.path.join(SAIDA, nome), full_page=True)
                    m = await pg.evaluate(MEDIR)
                    rotulo = '%s (%dpx, %s)' % (caminho, largura, tema)
                    if m['rolagem']:
                        res['T01'].append(rotulo)
                    for c in m['cortados']:
                        res['T02'].append(rotulo + ': ' + c)
                    for e in erros:
                        (res['rede'].add if re.search(r'Failed to load resource|ERR_|net::|CORS|supabase|formsubmit|ytimg', e) else res['T03'].append)(rotulo + ': ' + e[:120])
                    if largura == 360 and tema == 'claro':
                        res['T04'][caminho] = m['pequenos']
                await ctx.close()
        await nav.close()
    srv.shutdown()
    pequenos = sum(len(v) for v in res['T04'].values())
    linhas = [('T01', 'Sem rolagem lateral da página', res['T01'], True),
              ('T02', 'Nenhuma tabela ou lista cortada', res['T02'], True),
              ('T03', 'Sem erros de JavaScript no console', res['T03'], True)]
    falhas = 0
    for cod, titulo, itens, bloqueia in linhas:
        ok = not itens
        falhas += (not ok) and bloqueia
        print('%s %s  %s: %d' % ('ok   ' if ok else 'FALHA', cod, titulo, len(itens)))
        for i in itens[:12]:
            print('        - ' + i)
    print('%s T04  Alvos de toque abaixo de 44px de altura (ou 24px de largura) no celular: %d  (alvo 0)' % ('ok   ' if not pequenos else 'META ', pequenos))
    for caminho, itens in res['T04'].items():
        for i in itens[:4]:
            print('        - %s %s' % (caminho, i))
    if res['rede']:
        print('\nAvisos de rede (normalmente bloqueio do ambiente local, confira no site publicado): %d' % len(res['rede']))
    print('\nCapturas em ferramentas/telas/. Olhe as de 390px antes de publicar.')
    print('%d falha(s) bloqueante(s).' % falhas)
    sys.exit(1 if falhas else 0)


asyncio.run(main())
