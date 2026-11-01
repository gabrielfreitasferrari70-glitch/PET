#!/usr/bin/env python3
"""Lista arquivos citados pelo site que nao existem no repositorio. Rode antes de publicar:
   python3 ferramentas/checar-arquivos.py
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIPOS = ('.html', '.js', '.css', '.json')
EXT = 'png|jpe?g|svg|webp|gif|pdf|ics|ttf|woff2?|css|js|json'
# Caminhos absolutos do proprio site entre aspas, parenteses ou crases.
CITACAO = re.compile(r"""["'(`]((?:https://pet-conecta\.vercel\.app)?/[A-Za-z0-9_./-]+\.(?:%s))(?=["'`)?#])""" % EXT)
# Montagem de caminho em tempo de execucao: nao pode ser conferida, entao tambem e erro.
MONTADO = re.compile(r"""["'`]/?(?:assets|materiais)/[A-Za-z0-9_/-]*/?["'`]\s*\+""")

# Enderecos servidos por rewrite do vercel.json (ex.: /agenda/pet.ics) nao sao arquivos do repositorio.
with open(os.path.join(RAIZ, 'vercel.json'), encoding='utf-8') as f:
    REESCRITOS = {r['source'].lstrip('/') for r in json.load(f).get('rewrites', [])}

faltando, montados = {}, []
for pasta, subpastas, arquivos in os.walk(RAIZ):
    subpastas[:] = [s for s in subpastas if s not in ('.git', '.claude', 'ferramentas')]
    for nome in arquivos:
        if not nome.endswith(TIPOS):
            continue
        caminho = os.path.join(pasta, nome)
        rel = os.path.relpath(caminho, RAIZ)
        texto = open(caminho, encoding='utf-8', errors='replace').read()
        for citado in CITACAO.findall(texto):
            alvo = citado.replace('https://pet-conecta.vercel.app', '').lstrip('/')
            if alvo not in REESCRITOS and not os.path.isfile(os.path.join(RAIZ, alvo)):
                faltando.setdefault(alvo, set()).add(rel)
        if MONTADO.search(texto):
            montados.append(rel)

for alvo, origens in sorted(faltando.items()):
    print('FALTA  /%s  (citado em %s)' % (alvo, ', '.join(sorted(origens)[:3])))
for rel in sorted(montados):
    print('MONTADO  %s monta um caminho de arquivo em tempo de execucao' % rel)
print('Tudo certo.' if not faltando and not montados else '%d arquivo(s) faltando, %d caminho(s) montado(s).' % (len(faltando), len(montados)))
sys.exit(1 if faltando or montados else 0)
