#!/usr/bin/env python3
"""Aplica a mesma navegacao em todas as paginas: menu, menu do celular, rodape e trilha (Inicio > Secao > Pagina).
A ordem segue o que a comunidade procura primeiro: Atendimento, Aprender, YouTube, Projetos e O PET.
Rode por ultimo, depois de gerar-projetos.py e gerar-ciclo.py:  python3 ferramentas/aplicar-navegacao.py
"""
import glob, html, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECOES = [  # (chave, nome no menu, endereco, prefixos das paginas que pertencem a ela)
    ('atendimento', 'Atendimento', '/atendimento/', ('atendimento/', 'agenda/', 'acao/', 'comunidade/', 'leve-o-pet/')),
    ('aprender', 'Aprender', '/aprender/', ('aprender/', 'colecoes/', 'saude-em-dia/', 'fato-ou-fake/', 'de-jaleco-e-fone/', 'voce-perguntou/')),
    ('youtube', 'YouTube', '/youtube/', ('youtube/',)),
    ('projetos', 'Projetos', '/projetos/', ('projetos/',)),
    ('o-pet', 'O PET', '/o-pet/', ('o-pet/', 'alcance/', 'publicacoes/', 'redes/', 'participar/', 'para-o-pet/', 'imprimir/')),
]
MEIO = {'publicacoes/': ('Publicações', '/publicacoes/')}
NOMES = {'404.html': 'Página não encontrada', 'comunidade/index.html': 'Tirar uma dúvida', 'agenda/index.html': 'Próximas ações',
         'projetos/curso-aph/index.html': 'Curso de APH', 'de-jaleco-e-fone/index.html': 'De Jaleco e Fone', 'fato-ou-fake/index.html': 'Fato ou Fake',
         'voce-perguntou/index.html': 'Você perguntou', 'acao/acuidade-visual/index.html': 'Teste de visão na escola', 'youtube/index.html': 'Vídeos'}
DUVIDA = '/comunidade/?tipo=duvida'


def secao(rel):
    for s in SECOES:
        if rel.startswith(s[3]):
            return s
    return None


# Menu de cima: Atendimento, Aprender e Projetos, depois as duas ferramentas mais usadas (acesso direto), YouTube e O PET.
# A trilha continua seguindo as secoes (Saude em Dia e Fato ou Fake ficam em Inicio > Aprender).
MENU = [('Atendimento', '/atendimento/', SECOES[0][3]), ('Aprender', '/aprender/', ('aprender/', 'colecoes/', 'de-jaleco-e-fone/', 'voce-perguntou/')),
        ('Projetos', '/projetos/', ('projetos/',)), ('Saúde em Dia', '/saude-em-dia/', ('saude-em-dia/',)), ('Fato ou Fake', '/fato-ou-fake/', ('fato-ou-fake/',)),
        ('YouTube', '/youtube/', ('youtube/',)), ('O PET', '/o-pet/', SECOES[4][3])]


def item_atual(rel):
    for nome, url, pre in MENU:
        if rel.startswith(pre):
            return url
    return None


def menu(q, rel):
    a = item_atual(rel)
    return ''.join(f"<a href={q}{u}{q}{f' aria-current={q}page{q}' if u == a else ''}>{n}</a>" for n, u, _ in MENU)


def celular(q, rel):
    a = item_atual(rel)
    h = f"<a href={q}{DUVIDA}{q} class={q}menu-destaque{q}>Tirar uma dúvida</a><a href={q}/{q}>Início</a>"
    h += ''.join(f"<a href={q}{u}{q}{f' class={q}active{q} aria-current={q}page{q}' if u == a else ''}>{n}</a>" for n, u, _ in MENU)
    return h + f"<span class={q}menu-sep{q} aria-hidden={q}true{q}></span><a href={q}/comunidade/#temas{q} class={q}menu-sec{q}>Votar em temas</a><button type={q}button{q} class={q}menu-sec{q} data-abrir-leitura>Preferências de leitura</button>"


RODAPE = ("<div><h2>Explore</h2><a href='/atendimento/'>Atendimento</a><a href='/agenda/'>Próximas ações</a><a href='/comunidade/?tipo=duvida'>Tirar uma dúvida</a>"
          "<a href='/aprender/'>Aprender</a><a href='/saude-em-dia/'>Saúde em Dia</a><a href='/fato-ou-fake/'>Fato ou Fake</a>"
          "<a href='/youtube/'>YouTube</a><a href='/projetos/'>Projetos</a><a href='/o-pet/'>O PET</a><a href='/publicacoes/'>Jornal e publicações</a>"
          "<a href='/participar/'>Processo seletivo</a></div>")

paginas = sorted(p for p in glob.glob(os.path.join(RAIZ, '**', '*.html'), recursive=True) if os.sep + 'ferramentas' + os.sep not in p)
for caminho in paginas:
    rel = os.path.relpath(caminho, RAIZ).replace(os.sep, '/')
    with open(caminho, encoding='utf-8', newline='') as f:
        h = f.read()
    original = h
    s = secao(rel)
    h, n1 = re.subn(r"(<nav class=(['\"])desktop-nav\2 aria-label=\2Principal\2>).*?(</nav>)", lambda m: m.group(1) + menu(m.group(2), rel) + m.group(3), h, count=1, flags=re.S)
    h, n2 = re.subn(r"(<nav id=(['\"])mobile-menu\2 aria-label=\2Menu móvel\2 hidden>).*?(</nav>)", lambda m: m.group(1) + celular(m.group(2), rel) + m.group(3), h, count=1, flags=re.S)
    h = re.sub(r"<a href=(['\"])/comunidade/#temas\1 class=\1join-votar\1>Votar em temas</a>", '', h)
    h, n3 = re.subn(r"<a href=(['\"])/comunidade/[^'\"]*\1 class=\1join\1[^>]*>(<span class=\1fala-ic\1 aria-hidden=\1true\1></span>)[^<]*</a>",
                    lambda m: f"<a href={m.group(1)}{DUVIDA}{m.group(1)} class={m.group(1)}join{m.group(1)} data-v2=''>{m.group(2)}Tirar uma dúvida</a>", h, count=1)
    h = re.sub(r"<div><h2>Explore</h2>.*?</div>", lambda m: RODAPE, h, count=1, flags=re.S)
    # Trilha: tira as antigas e poe uma so, no inicio do conteudo
    h = re.sub(r"<nav class='wrap trilha'.*?</nav>", '', h, flags=re.S)
    h = re.sub(r"<a[^>]*class=(['\"])breadcrumb\1[^>]*>[^<]*</a>", '', h)
    h = re.sub(r"<a class=(['\"])caminho-volta\1[^>]*>[^<]*</a>", '', h)
    if rel != 'index.html':
        titulo = re.search(r'<title>(.*?)</title>', h, re.S).group(1)
        nome = NOMES.get(rel) or html.unescape(titulo.split(' · PET Conecta')[0]).strip()
        itens = ["<li><a href='/'>Início</a></li>"]
        if s and rel != s[2].strip('/') + '/index.html':
            itens.append(f"<li><a href='{s[2]}'>{s[1]}</a></li>")
            for pre, (mn, mu) in MEIO.items():
                if rel.startswith(pre) and rel != pre + 'index.html':
                    itens.append(f"<li><a href='{mu}'>{mn}</a></li>")
            itens.append(f"<li aria-current='page'>{html.escape(nome, quote=False)}</li>")
        else:
            itens.append(f"<li aria-current='page'>{html.escape(s[1] if s else nome, quote=False)}</li>")
        trilha = "<nav class='wrap trilha' aria-label='Você está aqui'><ol>" + ''.join(itens) + "</ol></nav>"
        h, n4 = re.subn(r"(<main id=(['\"])conteudo\2[^>]*>)", lambda m: m.group(1) + trilha, h, count=1)
        assert n4 == 1, rel
    assert n1 == n2 == 1, rel + ' sem menu'
    assert n3 == 1, rel + ' sem botao'
    if h != original:
        with open(caminho, 'w', encoding='utf-8', newline='') as f:
            f.write(h)
print(len(paginas), 'paginas conferidas')
