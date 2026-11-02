#!/usr/bin/env python3
"""Confere o site contra o Design System e os achados do mapeamento de 02/11/2026.
Rode antes de publicar (nao precisa de internet nem de pacotes extras):
   python3 ferramentas/checar-qualidade.py            # relatorio
   python3 ferramentas/checar-qualidade.py --json     # saida para comparar rodadas

Cada verificacao tem um codigo (Q01...) que bate com a coluna "Verificacao" do plano de correcao.
FALHA = bloqueia a publicacao. META = numero que deve cair rodada a rodada ate o alvo.
O script sai com codigo 1 se houver alguma FALHA.
"""
import glob, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)


def ler(p):
    with open(p, encoding='utf-8', errors='replace') as f:
        return f.read()


PAGINAS = sorted(p for p in glob.glob('**/*.html', recursive=True) if not p.startswith(('ferramentas', 'node_modules', '.')))
HTML = {p: ler(p) for p in PAGINAS}
JS = {p: ler(p) for p in glob.glob('*.js')}
CSS = ler('site.css')
TODO_HTML = '\n'.join(HTML.values())
TODO_JS = '\n'.join(JS.values())

USO = TODO_HTML + TODO_JS


def usado(sel):
    """Seletor so conta se todas as classes dele aparecem em alguma pagina ou script."""
    return all(re.search(r'(?<![\w-])%s(?![\w-])' % re.escape(c), USO) for c in re.findall(r'\.([a-zA-Z][\w-]*)', sel))


# ---------- CSS: regras e tokens ----------
CSS_SEM_COMENT = re.sub(r'/\*.*?\*/', '', CSS, flags=re.S)
REGRAS = []  # (seletor, declaracoes, ordem)
for i, m in enumerate(re.finditer(r'([^{}]+)\{([^{}]*)\}', CSS_SEM_COMENT)):
    sel = m.group(1).strip()
    if sel.startswith('@'):
        sel = sel.split(')', 1)[-1].strip() or sel
    REGRAS.append((sel, m.group(2), i))


def decls(bloco):
    out = []
    for d in bloco.split(';'):
        if ':' in d:
            k, v = d.split(':', 1)
            out.append((k.strip().lower(), v.strip()))
    return out


def tokens_de(seletor_exato):
    t = {}
    variantes = {seletor_exato, 'html' + seletor_exato, ':root' + seletor_exato}
    for sel, bloco, _ in REGRAS:
        if sel in variantes:
            for k, v in decls(bloco):
                if k.startswith('--'):
                    t[k] = v
    return t


TEMAS = {'claro': tokens_de(':root')}
TEMAS['claro'].update(tokens_de('html'))
for nome in ('sepia', 'dark'):
    base = dict(TEMAS['claro'])
    base.update(tokens_de('[data-reading-theme="%s"]' % nome))
    TEMAS[nome] = base
NOMEADAS = {'white': '#ffffff', 'black': '#000000', '#fff': '#ffffff', '#000': '#000000'}


def resolve(valor, tema, prof=0):
    v = valor.strip().lower().replace('!important', '').strip()
    m = re.fullmatch(r'var\((--[\w-]+)(?:,\s*([^)]+))?\)', v)
    if m and prof < 5:
        alvo = TEMAS[tema].get(m.group(1)) or m.group(2)
        return resolve(alvo, tema, prof + 1) if alvo else None
    v = NOMEADAS.get(v, v)
    if re.fullmatch(r'#[0-9a-f]{3}', v):
        v = '#' + ''.join(c * 2 for c in v[1:])
    return v if re.fullmatch(r'#[0-9a-f]{6}', v) else None


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


RESULTADOS = []


def registra(cod, titulo, nivel, ok, valor, detalhes=(), alvo=None):
    RESULTADOS.append({'codigo': cod, 'titulo': titulo, 'nivel': nivel, 'ok': ok, 'valor': valor,
                       'alvo': alvo, 'detalhes': list(detalhes)[:12]})


def classe(html_attr, nome):
    return re.search(r'''class=['"][^'"]*\b%s\b''' % re.escape(nome), html_attr)


# Q01 Filtro "Salvos" precisa de botoes de salvar
tem_filtro = 'saved-only' in TODO_HTML
tem_botao = bool(re.search(r'data-save=', TODO_HTML + TODO_JS.replace("'[data-save]'", '').replace("$$('[data-save]')", '')))
registra('Q01', 'Filtro "Salvos" tem botões de salvar nos cards', 'FALHA', not tem_filtro or tem_botao,
         'filtro sem botões' if tem_filtro and not tem_botao else 'ok')

# Q02 Conteineres de rolagem anulados por overflow:hidden posterior
rolagem, conflitos = {}, []
for sel, bloco, i in REGRAS:
    for k, v in decls(bloco):
        for s in [x.strip() for x in sel.split(',')]:
            if k in ('overflow-x', 'overflow') and v.startswith(('auto', 'scroll')):
                rolagem.setdefault(s, i)
            if k in ('overflow', 'overflow-x') and v.startswith(('hidden', 'clip')) and s in rolagem and i > rolagem[s]:
                conflitos.append('%s: overflow %s depois de rolagem' % (s, v))
registra('Q02', 'Nenhuma área de rolagem anulada por overflow:hidden', 'FALHA', not conflitos, len(conflitos), conflitos)

# Q03 Contraste AA (4,5:1) em regras com cor de texto e fundo, nos 3 temas (a ultima regra de cada seletor vale)
efetivo = {}
for sel, bloco, _ in REGRAS:
    if not usado(sel):
        continue
    d = dict(decls(bloco))
    e = efetivo.setdefault(sel, {})
    if 'color' in d:
        e['cor'] = d['color']
    bg = d.get('background-color') or d.get('background')
    if bg and bg.strip().startswith(('var(', '#', 'white', 'black')):
        e['fundo'] = bg
ruins = set()
for sel, e in efetivo.items():
    cor = e.get('cor')
    if not cor:
        continue
    fundo = e.get('fundo') or ('var(--paper)' if cor.startswith('var(--perigo') else None)
    for tema in TEMAS:
        if 'data-reading-theme' in sel and ('"%s"' % tema) not in sel:
            continue
        c, f = resolve(cor, tema), resolve(fundo, tema) if fundo else None
        if c and f and c != f and contraste(c, f) < 4.5:
            ruins.add('%s [%s] %.2f:1' % (sel[:60], tema, contraste(c, f)))
registra('Q03', 'Contraste AA de texto sobre fundo nos temas claro, sépia e escuro', 'FALHA', not ruins, len(ruins), sorted(ruins))

# Q04 Cor literal fora dos tokens
literais = []
for sel, bloco, _ in REGRAS:
    if sel == ':root' or sel.startswith('[data-reading-theme="') and sel.endswith('"]'):
        continue
    for k, v in decls(bloco):
        if k.startswith('--'):
            continue
        if re.search(r'#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|(?<![\w-])(white|black)(?![\w-])', v) and 'var(' not in v.split('rgba')[0][:0]:
            literais.append('%s { %s: %s }' % (sel[:50], k, v[:40]))
registra('Q04', 'Nenhuma cor solta fora dos tokens', 'FALHA', not literais, len(literais), literais)

# Q05 Espacamento solto: padding/margin/gap devem usar os tokens --esp-* (0 e o 1px do .sr-only ficam de fora)
ESCALA = {0, 4, 8, 12, 16, 24, 32, 48, 64, 80}
soltos_esp, fora = 0, 0
exemplos = {}
for sel, bloco, _ in REGRAS:
    if sel == ':root' or not usado(sel):
        continue
    for k, v in decls(bloco):
        if re.fullmatch(r'(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block)(-start|-end)?)?', k):
            for n in re.findall(r'(?<![\w.-])(-?\d+(?:\.\d+)?)px', v):
                if abs(float(n)) in (0, 1):
                    continue
                soltos_esp += 1
                if abs(float(n)) not in ESCALA:
                    fora += 1
                exemplos.setdefault(n + 'px', sel[:40])
registra('Q05', 'Espaçamentos sem token --esp-* (fora da escala: %d)' % fora, 'META', soltos_esp == 0, soltos_esp,
         ['%s (ex.: %s)' % kv for kv in sorted(exemplos.items(), key=lambda x: -abs(float(x[0][:-2])))], alvo=0)

# Q06 Cards: todos usam o mesmo padding (token --card-pad) na regra que vale por ultimo
CARDS = ['.project-card .project-copy', '.learning-card > div', '.pathway-card', '.acervo-card', '.agenda-assinar',
         '.com-form', '.fale-form', '.hm-painel', '.hp-corpo', '.yt-corpo', '.yt-d-corpo', '.aside-card']
ultimo = {}
for sel, bloco, _ in REGRAS:
    for s_ in [x.strip() for x in sel.split(',')]:
        s_n = re.sub(r'\s*>\s*', ' > ', s_)
        if s_n in CARDS:
            for k, v in decls(bloco):
                if k == 'padding':
                    ultimo[s_n] = v
sem_token = ['%s: %s' % (c, ultimo.get(c, '(sem padding)')) for c in CARDS if ultimo.get(c) != 'var(--card-pad)']
registra('Q06', 'Cards com o padding único --card-pad', 'META', not sem_token, len(sem_token), sem_token, alvo=0)

# Q07 Barra de acento com topo reto
retos = ['%s { %s }' % (sel[:50], v) for sel, bloco, _ in REGRAS for k, v in decls(bloco)
         if usado(sel) and k == 'border-radius' and re.match(r'0(px)?\s+0(px)?\s+\S', v)]
registra('Q07', 'Cards com barra de acento respeitam o raio', 'FALHA', not retos, len(retos), retos)

# Q08 Etiqueta menta dentro de etiqueta menta
menta = set()
for sel, bloco, _ in REGRAS:
    d = dict(decls(bloco))
    if 'var(--mint)' in (d.get('background', '') + d.get('background-color', '')):
        for s in sel.split(','):
            m = re.fullmatch(r'\s*\.([\w-]+)\s*', s)
            if m:
                menta.add(m.group(1))
aninhados = set()
for txt in list(HTML.values()) + list(JS.values()):
    for a, b in re.findall(r'''class=\\?['"]([^'"]+)\\?['"][^>]*>\s*<[a-z]+ class=\\?['"]([^'"]+)''', txt):
        ca, cb = set(a.split()) & menta, set(b.split()) & menta
        if ca and cb:
            aninhados.add('.%s > .%s' % (sorted(ca)[0], sorted(cb)[0]))
registra('Q08', 'Nenhuma etiqueta menta dentro de outra menta', 'FALHA', not aninhados, len(aninhados), sorted(aninhados))

# Q09 / Q10 Setas: externo com ↗, interno sem ↗
sem_seta, com_seta = [], []
for p, txt in HTML.items():
    for attrs, corpo in re.findall(r'<a\s([^>]*)>(.*?)</a>', txt, flags=re.S):
        href = re.search(r'''href=['"]([^'"]+)''', attrs)
        if not href:
            continue
        h = href.group(1)
        texto = re.sub(r'<[^>]+>', '', corpo).strip()
        if h.startswith('http') and 'pet-conecta.vercel.app' not in h:
            # marcas da tabela de anos sao simbolos com aria-label; o nome da linha leva a seta
            if 'yt-card' in attrs or 'tl-mark' in attrs or not texto or '<img' in corpo:
                continue
            if '↗' not in corpo:
                sem_seta.append('%s: %s' % (p, texto[:40]))
        elif h.startswith('/') and '↗' in corpo:
            com_seta.append('%s: %s' % (p, texto[:40]))
registra('Q09', 'Links externos com ↗', 'FALHA', not sem_seta, len(sem_seta), sem_seta)
registra('Q10', 'Links internos sem ↗', 'FALHA', not com_seta, len(com_seta), com_seta)

# Q11 Links internos quebrados
rotas = {'/' + p.replace('index.html', '') for p in PAGINAS}
vercel = json.loads(ler('vercel.json'))
desvios = {r['source'] for r in vercel.get('redirects', []) + vercel.get('rewrites', [])}
quebrados = set()
for p, txt in HTML.items():
    for h in re.findall(r'''(?:href|src)=['"](/[^'"#?]*)''', txt):
        alvo = h.lstrip('/')
        if h in rotas or h in desvios or os.path.isfile(alvo) or os.path.isfile(os.path.join(alvo, 'index.html')):
            continue
        quebrados.add('%s -> %s' % (p, h))
registra('Q11', 'Links internos sem destino quebrado', 'FALHA', not quebrados, len(quebrados), sorted(quebrados))

# Q12 Arquivos soltos na raiz e midia sem uso
PERMITIDOS = {'.vercelignore', '.gitignore', '404.html', 'favicon.png', 'index.html', 'logo.png', 'robots.txt',
              'sitemap.xml', 'vercel.json', 'search-index.json', 'projetos-dados.json', 'redes-dados.json', 'site.css',
              'README.md'}
soltos = [f for f in os.listdir('.') if os.path.isfile(f) and f not in PERMITIDOS and not f.endswith('.js')]
citado = TODO_HTML + TODO_JS + CSS + ler('projetos-dados.json') + ler('redes-dados.json')
for f in glob.glob('assets/media/*'):
    base = re.sub(r'-\d+\.webp$', '', os.path.basename(f)).rsplit('.', 1)[0]
    if os.path.basename(f) not in citado and base not in citado:
        soltos.append(f)
registra('Q12', 'Nenhum arquivo solto ou mídia sem uso', 'FALHA', not soltos, len(soltos), soltos)

# Q13 Ganchos de JS que nao existem em nenhuma pagina
ids_html = set(re.findall(r'''id=['"]([\w-]+)['"]''', TODO_HTML)) | set(re.findall(r'''id=\\?['"]([\w-]+)''', TODO_JS))
mortos = set()
for p, txt in JS.items():
    for i in re.findall(r'''\$\(['"]#([\w-]+)['"]\)|getElementById\(['"]([\w-]+)['"]\)''', txt):
        i = i[0] or i[1]
        if i not in ids_html:
            mortos.add('%s: #%s' % (p, i))
    for a in re.findall(r'''\[data-([\w-]+)\]''', txt):
        if not re.search(r'data-%s\b' % re.escape(a), TODO_HTML) and ('data-%s=' % a) not in TODO_JS and ("dataset." not in txt or a not in ('kind', 'value')):
            mortos.add('%s: [data-%s]' % (p, a))
registra('Q13', 'Nenhum código de JS para elementos que não existem', 'FALHA', not mortos, len(mortos), sorted(mortos))

# Q14 CSP: nada inline
inline = []
for p, txt in HTML.items():
    if re.search(r'''\sstyle=['"]''', txt):
        inline.append(p + ': style=')
    if re.search(r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>', txt):
        inline.append(p + ': <script> inline')
    if re.search(r'\son[a-z]+=[\'"]', txt):
        inline.append(p + ': on…=')
registra('Q14', 'Sem estilo, script ou evento inline (CSP)', 'FALHA', not inline, len(inline), inline)

# Q15 Tamanhos de fonte fora da escala (12 13 14 15 16 18 20 24 28 32 40 48 64 80 96 128 160)
FS = {12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80, 96, 128, 160}
tams, fora_fs = set(), []
for sel, bloco, _ in REGRAS:
    if not usado(sel):
        continue
    for k, v in decls(bloco):
        if k in ('font-size', 'font'):
            for n in re.findall(r'(\d+(?:\.\d+)?)px', v.split('/')[0] if k == 'font' else v):
                tams.add(float(n))
                if float(n) not in FS:
                    fora_fs.append('%s: %spx' % (sel[:40], n))
registra('Q15', 'Tamanhos de fonte fora da escala (%d tamanhos em uso)' % len(tams), 'META', not fora_fs, len(fora_fs), fora_fs, alvo=0)

# Q16 Classes do CSS sem uso (meta)
classes_css = set(re.findall(r'\.([a-zA-Z][\w-]*)', ' '.join(s for s, _, _ in REGRAS)))
sem_uso = sorted(c for c in classes_css if not usado('.' + c))
registra('Q16', 'Classes do CSS sem uso em HTML ou JS', 'META', not sem_uso, len(sem_uso), sem_uso, alvo=0)

# Q17 site.css e site.js em dia com ferramentas/origem
sys.path.insert(0, os.path.join(RAIZ, 'ferramentas'))
try:
    src = ler('ferramentas/unir-arquivos.py')
    ordem_css = eval(re.search(r'CSS = (\(.*?\))', src, re.S).group(1))
    ordem_js = eval(re.search(r'JS = (\(.*?\))', src, re.S).group(1))
    aviso = '/* Gerado por ferramentas/unir-arquivos.py. Nao edite aqui. */\n'
    esperado_css = aviso + '\n'.join(re.sub(r'/\*.*?\*/', '', ler('ferramentas/origem/' + n), flags=re.S).strip() for n in ordem_css) + '\n'
    esperado_js = aviso + ';\n'.join(ler('ferramentas/origem/' + n).strip() for n in ordem_js) + '\n'
    dif = [n for n, e in (('site.css', esperado_css), ('site.js', esperado_js)) if ler(n) != e]
except Exception as e:
    dif = ['não foi possível conferir: %s' % e]
registra('Q17', 'site.css e site.js gerados a partir de ferramentas/origem', 'FALHA', not dif, len(dif),
         [d + ' difere da origem: rode ferramentas/unir-arquivos.py' for d in dif])

# Q18 Sitemap cobre todas as paginas
sm = set(re.findall(r'<loc>https://pet-conecta\.vercel\.app([^<]*)</loc>', ler('sitemap.xml')))
faltam = sorted(r for r in rotas if r not in sm and r != '/404.html')
registra('Q18', 'Sitemap cobre todas as páginas', 'FALHA', not faltam, len(faltam), faltam)

# Q20 Paginas de projeto geradas e em dia com projetos-dados.json
import subprocess
r20 = subprocess.run([sys.executable, os.path.join(RAIZ, 'ferramentas', 'gerar-projetos.py'), '--checar'], capture_output=True, text=True)
registra('Q20', 'Páginas de projeto completas no HTML e em dia com os dados', 'FALHA', r20.returncode == 0, 0 if r20.returncode == 0 else 1,
         [] if r20.returncode == 0 else [r20.stdout.strip() + ' — rode ferramentas/gerar-projetos.py'])

# Q19 Tokens de cor sem versao escura (texto e fundo)
cores_root = [k for k, v in TEMAS['claro'].items() if not v.strip().startswith('var(') and resolve(v, 'claro')]
escuro = tokens_de('[data-reading-theme="dark"]')
IGNORAR = {'--claro',  # branco fixo sobre fundos que continuam escuros no tema escuro (De Jaleco e Fone)
           '--spotify', '--djf-orange', '--djf-deep', '--djf-soft', '--djf-dark', '--djf-cream'}
sem_escuro = sorted(k for k in cores_root if k not in escuro and k not in IGNORAR)
registra('Q19', 'Tokens de cor com versão para o tema escuro', 'FALHA', not sem_escuro, len(sem_escuro), sem_escuro)

# ---------- saida ----------
if '--json' in sys.argv:
    print(json.dumps(RESULTADOS, ensure_ascii=False, indent=1))
else:
    falhas = [r for r in RESULTADOS if r['nivel'] == 'FALHA' and not r['ok']]
    for r in RESULTADOS:
        marca = 'ok   ' if r['ok'] else ('FALHA' if r['nivel'] == 'FALHA' else 'META ')
        alvo = '' if r['alvo'] is None else '  (alvo %s)' % r['alvo']
        print('%s %s  %s: %s%s' % (marca, r['codigo'], r['titulo'], r['valor'], alvo))
        if not r['ok']:
            for d in r['detalhes']:
                print('        - ' + d)
    print('\n%d falha(s) bloqueante(s). %s' % (len(falhas), 'NO-GO para publicar.' if falhas else 'GO nas verificações estáticas.'))
    sys.exit(1 if falhas else 0)
