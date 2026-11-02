#!/usr/bin/env python3
"""Junta os CSS e os JS de ferramentas/origem em site.css e site.js, na raiz do site.
Edite sempre em ferramentas/origem e rode antes de publicar:
   python3 ferramentas/unir-arquivos.py
"""
import os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, 'ferramentas', 'origem')
# A ordem e a da cascata: fontes, base, ajustes e por fim o pet-padrao.
CSS = ('fonts.css', 'styles.css', 'pet-plus.css', 'pet-editorial-base.css', 'pet-v2.css', 'pet-v3.css', 'pet-editorial.css',
       'privacy.css', 'podcast.css', 'pet-extra.css', 'youtube.css', 'pet-padrao.css', 'design-system.css')
JS = ('portal.js', 'privacy.js')
AVISO = '/* Gerado por ferramentas/unir-arquivos.py. Nao edite aqui. */\n'


def ler(nome):
    with open(os.path.join(ORIGEM, nome), encoding='utf-8', newline='') as f:
        return f.read()


css = '\n'.join(re.sub(r'/\*.*?\*/', '', ler(n), flags=re.S).strip() for n in CSS)
js = ';\n'.join(ler(n).strip() for n in JS)
for nome, texto in (('site.css', css), ('site.js', js)):
    with open(os.path.join(RAIZ, nome), 'w', encoding='utf-8', newline='') as f:
        f.write(AVISO + texto + '\n')
    print(nome, os.path.getsize(os.path.join(RAIZ, nome)), 'bytes')
