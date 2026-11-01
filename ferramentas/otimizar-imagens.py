#!/usr/bin/env python3
"""Gera versoes WebP das fotos de assets/media e atualiza o srcset das tags <img>.
Rode depois de acrescentar ou trocar uma foto (precisa do Pillow):
   python3 ferramentas/otimizar-imagens.py
"""
import glob, os, re
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LARGURAS = (480, 800, 1200)
# Espaco ocupado na tela por cada foto, usado para o navegador escolher o arquivo.
TAMANHOS = {
    'de-jaleco-e-fone': '(max-width: 760px) 100vw, 50vw',
    'anamnese-48-editorial': '(max-width: 760px) 100vw, 800px',
}
PADRAO = '(max-width: 760px) 100vw, 600px'


def versoes(foto):
    base, _ = os.path.splitext(foto)
    img = Image.open(foto).convert('RGB')
    saida = []
    for largura in LARGURAS:
        if largura >= img.width * 0.9:
            continue
        altura = round(img.height * largura / img.width)
        img.resize((largura, altura), Image.LANCZOS).save(f'{base}-{largura}.webp', quality=80, method=6)
        saida.append(largura)
    img.save(f'{base}-{img.width}.webp', quality=80, method=6)
    return saida + [img.width]


TAG = re.compile(r"<img\b[^>]*?/assets/media/([\w-]+\.(?:jpg|png))[^>]*>")
PAGINAS = glob.glob(os.path.join(RAIZ, '**/*.html'), recursive=True)
citadas = {nome for pagina in PAGINAS for nome in TAG.findall(open(pagina, encoding='utf-8').read())}
for velha in glob.glob(os.path.join(RAIZ, 'assets/media/*.webp')):
    os.remove(velha)
fotos = {nome: versoes(os.path.join(RAIZ, 'assets/media', nome)) for nome in citadas}


def marca(m):
    nome = m.group(1)
    if nome not in fotos:
        return m.group(0)
    tag = re.sub(r"\s(?:srcset|sizes)=(['\"]).*?\1", '', m.group(0))
    aspa = re.search(r"src=(['\"])", tag).group(1)
    base = os.path.splitext(nome)[0]
    srcset = ', '.join(f'/assets/media/{base}-{w}.webp {w}w' for w in fotos[nome])
    extra = f" srcset={aspa}{srcset}{aspa} sizes={aspa}{TAMANHOS.get(base, PADRAO)}{aspa}"
    return re.sub(r"(src=(['\"])[^'\"]+\2)", lambda s: s.group(1) + extra, tag, count=1)


for pagina in PAGINAS:
    texto = open(pagina, encoding='utf-8', newline='').read()
    novo = TAG.sub(marca, texto)
    if novo != texto:
        open(pagina, 'w', encoding='utf-8', newline='').write(novo)
        print('atualizada', os.path.relpath(pagina, RAIZ))
print(fotos)
