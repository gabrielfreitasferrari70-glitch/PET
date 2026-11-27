#!/usr/bin/env python3
"""Poe a versao (?v=<hash do conteudo>) em cada CSS e JS do site citado pelas paginas.
Com a versao no endereco, o navegador guarda esses arquivos por um ano (vercel.json) e so baixa de novo
quando o arquivo muda, porque a versao muda junto. Tambem abre a conexao com o banco mais cedo nas paginas que o usam.
Rode por ultimo, depois de todos os outros geradores:  python3 ferramentas/versionar.py
"""
import glob, hashlib, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANCO = 'https://eupkdyhngmrsbvmaondp.supabase.co'
USA_BANCO = ('/pet-dados.js', '/agenda.js', '/comunidade.js', '/anamnese.js')
versoes = {}


def versao(rel):
    if rel not in versoes:
        caminho = os.path.join(RAIZ, rel.lstrip('/'))
        if not os.path.isfile(caminho):
            return None
        versoes[rel] = hashlib.sha1(open(caminho, 'rb').read()).hexdigest()[:10]
    return versoes[rel]


faltando = []
paginas = [p for p in glob.glob(os.path.join(RAIZ, '**', '*.html'), recursive=True) if os.sep + 'ferramentas' + os.sep not in p]
for caminho in paginas:
    with open(caminho, encoding='utf-8', newline='') as f:
        h = f.read()
    original = h

    def troca(m):
        attr, q, rel = m.group(1), m.group(2), m.group(3)
        v = versao(rel)
        if not v:
            faltando.append(f'{os.path.relpath(caminho, RAIZ)}: {rel}')
            return m.group(0)
        return f'{attr}={q}{rel}?v={v}{q}'

    h = re.sub(r"""\b(src|href)=(['"])(/[A-Za-z0-9_./-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?\2""", troca, h)
    if any(s in h for s in USA_BANCO) and BANCO not in h.split('</head>')[0].split('preconnect')[-1][:200] and f"rel='preconnect' href='{BANCO}'" not in h and f'rel="preconnect" href="{BANCO}"' not in h:
        h = re.sub(r"(<meta charset=(['\"])utf-8\2>)", lambda m: m.group(1) + f"<link rel={m.group(2)}preconnect{m.group(2)} href={m.group(2)}{BANCO}{m.group(2)} crossorigin>", h, count=1)
    if h != original:
        with open(caminho, 'w', encoding='utf-8', newline='') as f:
            f.write(h)

# Nenhuma pagina pode citar CSS ou JS do site sem versao: esse arquivo ficaria guardado velho por um ano.
sem = []
for caminho in paginas:
    h = open(caminho, encoding='utf-8').read()
    for rel in re.findall(r"""\b(?:src|href)=['"](/[A-Za-z0-9_./-]+\.(?:css|js))['"]""", h):
        sem.append(f'{os.path.relpath(caminho, RAIZ)}: {rel}')
for x in faltando + sem:
    print('ERRO', x)
print(len(paginas), 'paginas,', len(versoes), 'arquivos versionados')
sys.exit(1 if faltando or sem else 0)
