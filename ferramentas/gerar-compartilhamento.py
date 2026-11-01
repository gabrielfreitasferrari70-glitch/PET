#!/usr/bin/env python3
"""Gera a imagem de compartilhamento (1200x630) de cada pagina e atualiza as metatags sociais.
Rode depois de criar uma pagina ou mudar um titulo (precisa do Pillow):
   python3 ferramentas/gerar-compartilhamento.py
"""
import glob, html, os, re
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
FONTES = os.path.join(RAIZ, 'ferramentas', 'fontes')
SECOES = {'projetos': 'Projeto', 'aprender': 'Aprender', 'colecoes': 'Coleção', 'publicacoes': 'Publicações', 'o-pet': 'O PET',
          'de-jaleco-e-fone': 'Podcast', 'youtube': 'YouTube', 'agenda': 'Agenda', 'redes': 'Nas redes', 'comunidade': 'Participação',
          'participar': 'Participação', 'para-o-pet': 'O PET', 'privacidade': 'Transparência', 'termos': 'Transparência'}
VERDE, TINTA, CINZA, LINHA = '#0e614f', '#1c2522', '#5c6663', '#dfe5e2'
L, A, M = 1200, 630, 72


def fonte(nome, tamanho):
    return ImageFont.truetype(os.path.join(FONTES, nome), tamanho)


def quebra(texto, f, largura):
    linhas, atual = [], ''
    for palavra in texto.split():
        teste = (atual + ' ' + palavra).strip()
        if f.getlength(teste) <= largura:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    return linhas + [atual]


def arte(titulo, secao, destino):
    img = Image.new('RGB', (L, A), 'white')
    d = ImageDraw.Draw(img)
    logo = Image.open(os.path.join(RAIZ, 'logo.png')).convert('RGBA')
    img.paste(logo, (M, 56), logo)
    d.text((M + 112, 80), 'PET Conecta', font=fonte('editorial-3.ttf', 36), fill=TINTA)
    for tamanho in (84, 72, 62, 54):
        f = fonte('editorial-4.ttf', tamanho)
        linhas = quebra(titulo, f, L - 2 * M)
        if len(linhas) * tamanho * 1.18 <= 290:
            break
    y = 196
    if secao:
        d.text((M, y), secao.upper(), font=fonte('editorial-3.ttf', 26), fill=VERDE)
    y += 52
    for linha in linhas:
        d.text((M, y), linha, font=f, fill=TINTA)
        y += round(tamanho * 1.18)
    d.line((M, 546, L - M, 546), fill=LINHA, width=2)
    d.text((M, 562), 'PET Medicina UFMT', font=fonte('editorial-2.ttf', 26), fill=CINZA)
    img.save(destino, quality=85, optimize=True, progressive=True)


os.makedirs(os.path.join(RAIZ, 'assets', 'compartilhar'), exist_ok=True)
for pagina in glob.glob(os.path.join(RAIZ, '**/index.html'), recursive=True):
    rel = os.path.relpath(os.path.dirname(pagina), RAIZ)
    rel = '' if rel == '.' else rel
    s = open(pagina, encoding='utf-8', newline='').read()
    q = re.search(r"<meta charset=(['\"])", s).group(1)
    titulo = html.unescape(re.search(r'<title>(.*?)</title>', s).group(1)).replace(' · PET Conecta', '')
    if not rel:
        titulo = re.sub(r'<[^>]+>', '', re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S).group(1))
    nome = (rel.replace(os.sep, '-') or 'inicio') + '.jpg'
    arte(titulo, SECOES.get(rel.split(os.sep)[0], ''), os.path.join(RAIZ, 'assets', 'compartilhar', nome))
    s = re.sub(r"<meta (?:property|name)=['\"](?:og:image[^'\"]*|og:type|og:url|og:site_name|og:locale|twitter:card)['\"] content=(?:'[^']*'|\"[^\"]*\")>", '', s)
    url = f"{SITE}/{rel}/" if rel else f"{SITE}/"
    alt = html.escape(f'{titulo} · PET Conecta', quote=True).replace('&#x27;', '&#39;')
    tags = [('property', 'og:type', 'website'), ('property', 'og:site_name', 'PET Conecta'), ('property', 'og:locale', 'pt_BR'), ('property', 'og:url', url),
            ('property', 'og:image', f'{SITE}/assets/compartilhar/{nome}'), ('property', 'og:image:width', '1200'), ('property', 'og:image:height', '630'),
            ('property', 'og:image:alt', alt), ('name', 'twitter:card', 'summary_large_image')]
    bloco = ''.join(f'<meta {a}={q}{n}{q} content={q}{v}{q}>' for a, n, v in tags)
    s, feitos = re.subn(r"(<script src=['\"]/tema\.js['\"]></script>)", lambda m: bloco + m.group(1), s, count=1)
    assert feitos == 1, pagina
    open(pagina, 'w', encoding='utf-8', newline='').write(s)
print('imagens:', len(glob.glob(os.path.join(RAIZ, 'assets/compartilhar/*.jpg'))))
