#!/usr/bin/env python3
"""Gera a imagem de compartilhamento (1200x630) de cada pagina e atualiza as metatags sociais.
Rode depois de criar uma pagina ou mudar um titulo (precisa do Pillow):
   python3 ferramentas/gerar-compartilhamento.py
"""
import glob, hashlib, html, os, re
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
FONTES = os.path.join(RAIZ, 'ferramentas', 'fontes')
SECOES = {'projetos': 'Projeto', 'aprender': 'Aprender', 'colecoes': 'Coleção', 'publicacoes': 'Publicações', 'o-pet': 'O PET',
          'de-jaleco-e-fone': 'Podcast', 'youtube': 'YouTube', 'agenda': 'Agenda', 'redes': 'Nas redes', 'comunidade': 'Participação',
          'participar': 'Participação', 'seja-petiano': 'Processo seletivo', 'doar': 'Atendimento', 'encaminhado': 'Atendimento', 'para-o-pet': 'O PET', 'privacidade': 'Transparência', 'termos': 'Transparência', 'saude-em-dia': 'Ferramenta', 'fato-ou-fake': 'Ferramenta'}
CLARO, MENTA, SUAVE, ACENTO = '#ffffff', '#d6f2ea', '#9fd3c6', '#45dccb'
L, A, M = 1200, 630, 80


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


def fundo():
    """Verde do PET com brilho suave e aneis discretos (lembram o estetoscopio da logo)."""
    g = Image.radial_gradient('L').resize((int(L * 1.6), int(A * 2.4)))
    g = g.crop((int(L * 0.3), int(A * 0.55), int(L * 1.3), int(A * 0.55) + A))
    img = Image.composite(Image.new('RGB', (L, A), '#063d32'), Image.new('RGB', (L, A), '#12725d'), g).convert('RGBA')
    ov = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for r, al in ((420, 22), (330, 16), (240, 12)):
        d.ellipse((L - 260 - r, -140 - r, L - 260 + r, -140 + r), outline=(255, 255, 255, al), width=3)
    for r, al in ((300, 14), (210, 10)):
        d.ellipse((60 - r, A + 80 - r, 60 + r, A + 80 + r), outline=(255, 255, 255, al), width=3)
    return Image.alpha_composite(img, ov)


def logo(img, x, y, lado, raio):
    """Logo oficial num cartao branco arredondado, com sombra."""
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((x, y + lado // 16, x + lado, y + lado + lado // 16), raio, fill=(0, 0, 0, 90))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(max(6, lado // 11))))
    interno = int(lado * 0.86)
    lg = Image.open(os.path.join(RAIZ, 'logo.png')).convert('RGBA').resize((interno, interno), Image.LANCZOS)
    lg = lg.filter(ImageFilter.UnsharpMask(1.2, 80, 2))
    mascara = Image.new('L', (lado, lado), 0)
    ImageDraw.Draw(mascara).rounded_rectangle((0, 0, lado - 1, lado - 1), raio, fill=255)
    img.paste(Image.new('RGBA', (lado, lado), 'white'), (x, y), mascara)
    o = (lado - interno) // 2
    img.paste(lg, (x + o, y + o), lg)
    return img


def rodape(d, centralizado):
    f = fonte('editorial-2.ttf', 24)
    t = 'PET MEDICINA UFMT   ·   pet-conecta.vercel.app'
    if centralizado:
        d.line(((L - 120) / 2, 508, (L + 120) / 2, 508), fill=ACENTO, width=3)
        d.text((L / 2, 566), t, font=f, fill=SUAVE, anchor='ms')
    else:
        d.line((M, 520, M + 120, 520), fill=ACENTO, width=3)
        d.text((M, 572), t, font=f, fill=SUAVE, anchor='ls')


def arte_inicio(chamada, destino):
    """Cartao do link principal: logo grande e nome centralizados (sobrevive ao recorte quadrado do WhatsApp)."""
    img = logo(fundo(), (L - 196) // 2, 58, 196, 36)
    d = ImageDraw.Draw(img)
    d.text((L / 2, 392), 'PET Conecta', font=fonte('editorial-4.ttf', 112), fill=CLARO, anchor='ms')
    d.text((L / 2, 458), chamada, font=fonte('editorial-3.ttf', 32), fill=MENTA, anchor='ms')
    rodape(d, True)
    img.convert('RGB').save(destino, quality=90, optimize=True, progressive=True)


def arte(titulo, secao, destino):
    img = logo(fundo(), M, 60, 96, 20)
    d = ImageDraw.Draw(img)
    d.text((M + 120, 108), 'PET Conecta', font=fonte('editorial-4.ttf', 44), fill=CLARO, anchor='lm')
    for tamanho in (78, 68, 60, 52):
        f = fonte('editorial-4.ttf', tamanho)
        linhas = quebra(titulo, f, L - 2 * M)
        if len(linhas) * tamanho * 1.15 <= 260:
            break
    y = 222
    if secao:
        d.text((M, y), secao.upper(), font=fonte('editorial-3.ttf', 24), fill=ACENTO, anchor='lt')
    y += 46
    for linha in linhas:
        d.text((M, y), linha, font=f, fill=CLARO, anchor='lt')
        y += round(tamanho * 1.15)
    rodape(d, False)
    img.convert('RGB').save(destino, quality=88, optimize=True, progressive=True)


os.makedirs(os.path.join(RAIZ, 'assets', 'compartilhar'), exist_ok=True)
CHAMADA_INICIO = 'A comunidade em contato com todos os projetos do PET'
for pagina in glob.glob(os.path.join(RAIZ, '**/index.html'), recursive=True):
    rel = os.path.relpath(os.path.dirname(pagina), RAIZ)
    rel = '' if rel == '.' else rel
    s = open(pagina, encoding='utf-8', newline='').read()
    q = re.search(r"<meta charset=(['\"])", s).group(1)
    titulo = html.unescape(re.search(r'<title>(.*?)</title>', s).group(1)).replace(' · PET Conecta', '')
    if not rel:
        titulo = CHAMADA_INICIO  # cartao de quem compartilha o link principal
    nome = (rel.replace(os.sep, '-') or 'inicio') + '.jpg'
    caminho = os.path.join(RAIZ, 'assets', 'compartilhar', nome)
    if rel:
        arte(titulo, SECOES.get(rel.split(os.sep)[0], ''), caminho)
    else:
        arte_inicio(titulo, caminho)
    versao = hashlib.md5(open(caminho, 'rb').read()).hexdigest()[:8]  # muda a URL quando a arte muda (WhatsApp guarda cache)
    s = re.sub(r"<meta (?:property|name)=['\"](?:og:image[^'\"]*|og:type|og:url|og:site_name|og:locale|twitter:card)['\"] content=(?:'[^']*'|\"[^\"]*\")>", '', s)
    url = f"{SITE}/{rel}/" if rel else f"{SITE}/"
    alt = html.escape(f'{titulo} · PET Conecta', quote=True).replace('&#x27;', '&#39;')
    tags = [('property', 'og:type', 'website'), ('property', 'og:site_name', 'PET Conecta'), ('property', 'og:locale', 'pt_BR'), ('property', 'og:url', url),
            ('property', 'og:image', f'{SITE}/assets/compartilhar/{nome}?v={versao}'), ('property', 'og:image:width', '1200'), ('property', 'og:image:height', '630'),
            ('property', 'og:image:alt', alt), ('name', 'twitter:card', 'summary_large_image')]
    bloco = ''.join(f'<meta {a}={q}{n}{q} content={q}{v}{q}>' for a, n, v in tags)
    s, feitos = re.subn(r"(<script src=['\"]/tema\.js(?:\?v=[0-9a-f]+)?['\"]></script>)", lambda m: bloco + m.group(1), s, count=1)
    assert feitos == 1, pagina
    open(pagina, 'w', encoding='utf-8', newline='').write(s)
print('imagens:', len(glob.glob(os.path.join(RAIZ, 'assets/compartilhar/*.jpg'))))
