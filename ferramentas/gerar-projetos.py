#!/usr/bin/env python3
"""Escreve o conteudo completo de cada pagina de projeto (projetos/<slug>/index.html) a partir de
projetos-dados.json e redes-dados.json. Assim a pagina abre inteira mesmo sem JavaScript e para buscadores;
o projeto.js so monta a pagina se ela nao tiver sido gerada.
   python3 ferramentas/gerar-projetos.py            # gera
   python3 ferramentas/gerar-projetos.py --checar   # so confere se esta em dia (sai com 1 se nao estiver)
Rode depois de editar projetos-dados.json ou redes-dados.json.
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NBH = '‑'  # hifen que nao quebra linha


def esc_base(s):
    s = '' if s is None else str(s)
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;')


def esc(s):
    return esc_base(s).replace('Pré-Hospitalar', 'Pré' + NBH + 'Hospitalar')


def safe_url(u):
    if not u:
        return ''
    if u.startswith('/') and not u.startswith('//'):
        return u
    return u if u.startswith('https://') else ''


def url(u):
    return safe_url(u) or '#'


def la(u):
    return " target='_blank' rel='noopener noreferrer'" if (u or '').startswith('https://') else ''


def seta(u):
    return '↗' if re.match(r'https?:', u or '') else '→'


def listas_redes(r, tag):
    ig = [i for i in r.get('instagram', []) if i and i.get('titulo') and re.fullmatch(r'https://www\.instagram\.com/[\w./-]+', i.get('url') or '')]
    yt = [i for i in r.get('youtube', []) if i and i.get('titulo') and re.fullmatch(r'[\w-]{11}', i.get('id') or '')]
    h = ''
    titulo = lambda t: '<%s class="pj-rede">%s</%s>' % (tag, t, tag)
    if ig:
        h += titulo('No Instagram') + '<ul class="pj-redes">' + ''.join(
            '<li><a href="%s" target="_blank" rel="noopener noreferrer"><strong>%s</strong><span>Ver no Instagram <span aria-hidden="true">↗</span></span></a></li>'
            % (esc_base(i['url']), esc_base(i['titulo'])) for i in ig) + '</ul>'
    if yt:
        h += titulo('No YouTube') + '<ul class="pj-redes">' + ''.join(
            '<li><a href="https://www.youtube.com/watch?v=%s" target="_blank" rel="noopener noreferrer"><img src="https://i.ytimg.com/vi/%s/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async"><strong>%s</strong><span>Ver no YouTube <span aria-hidden="true">↗</span></span></a></li>'
            % (esc_base(i['id']), esc_base(i['id']), esc_base(i['titulo'])) for i in yt) + '</ul>'
    return h


def pagina(p, r):
    l = listas_redes(r, 'h3')
    redes = '<section id="redes" class="pj-sec"><h2>Nas redes</h2>' + l + '</section>' if l else ''
    nav = [('oque', 'O que é'), ('quem', 'Para quem'), ('como', 'Como funciona'), ('anos', 'Ano a ano')]
    if p.get('mats'):
        nav.append(('mat', 'Materiais'))
    if redes:
        nav.append(('redes', 'Nas redes'))
    nav.append(('part', 'Como participar'))
    h = '<a href="/projetos/" class="breadcrumb">← Todos os projetos</a>'
    h += '<header class="pj-cab"><span class="eyebrow">%s</span><h1>%s</h1><p class="pj-lead">%s</p><p class="pj-status"><span class="chip">%s</span></p></header>' % (
        esc(p['tema'].upper()), esc(p['nome']), esc(p['resumo']), esc(p['status']))
    if p.get('capa'):
        h += '<figure class="pj-capa"><img src="%s" alt="%s" width="1600" height="900" loading="eager" decoding="async"></figure>' % (esc(url(p['capa']['src'])), esc(p['capa']['alt']))
    h += '<nav class="pj-nav" aria-label="Nesta página">' + ''.join('<a href="#%s">%s</a>' % n for n in nav) + '</nav>'
    h += '<section id="oque" class="pj-sec"><h2>O que é</h2><p>%s</p></section>' % esc(p['oque'])
    h += '<section id="quem" class="pj-sec"><h2>Para quem</h2><p>%s</p></section>' % esc(p['quem'])
    h += '<section id="como" class="pj-sec"><h2>Como funciona</h2><ol class="pj-passos">' + ''.join(
        '<li><b>%d</b><span>%s</span></li>' % (i + 1, esc(t)) for i, t in enumerate(p['passos'])) + '</ol>'
    if p.get('nums'):
        h += '<ul class="pj-nums" aria-label="Resultados documentados">' + ''.join(
            '<li><strong>%s</strong><span>%s</span><small>%s</small></li>' % (esc(n[0]), esc(n[1]), esc(n[2])) for n in p['nums']) + '</ul>'
    h += '</section>'
    h += '<section id="anos" class="pj-sec"><h2>Ano a ano</h2><ol class="pj-hist">' + ''.join(
        '<li><span class="pj-ano">%s</span><div><h3>%s</h3><p>%s</p><a class="text-link" href="%s"%s>Ver registro %s</a></div></li>'
        % (esc(x[0]), esc(x[1]), esc(x[2]), esc(url(x[3])), la(x[3]), seta(x[3])) for x in p['hist']) + '</ol>' + (
        '<p class="pj-nd">%s</p>' % esc(p['nd']) if p.get('nd') else '') + '</section>'
    if p.get('mats'):
        h += '<section id="mat" class="pj-sec"><h2>Materiais</h2><ul class="pj-mats">' + ''.join(
            '<li><a href="%s">%s <span aria-hidden="true">→</span></a></li>' % (esc(url(m[1])), esc(m[0])) for m in p['mats']) + '</ul></section>'
    h += redes
    pl = p.get('partlink')
    h += '<section id="part" class="pj-sec pj-part"><h2>Como participar</h2><p>%s</p><div class="part-acoes">' % esc(p['part'])
    if pl:
        h += '<a class="button" href="%s">%s <span aria-hidden="true">%s</span></a>' % (esc(url(pl[0])), esc(pl[1]), seta(pl[0]))
    h += '<a class="button%s" href="/comunidade/?tipo=duvida">Perguntar ao PET <span aria-hidden="true">→</span></a></div></section>' % (' secondary' if pl else '')
    h += '<section class="pj-sec pj-fontes"><h2>Fontes</h2><ul>' + ''.join(
        '<li><a class="text-link" href="%s"%s>%s %s</a></li>' % (esc(url(f[1])), la(f[1]), esc(f[0]), seta(f[1])) for f in p['fontes']) + (
        '</ul><p class="hm-nota">Informações tiradas do perfil público do PET e de páginas oficiais. Onde não há registro, a página diz isso. '
        'Para confirmar datas e vagas, use os canais oficiais.</p></section>')
    h += ('<section class="pj-sec pj-acompanhe" id="acompanhe"><h2>Acompanhe</h2><p>Os registros mais recentes do PET saem no Instagram e no YouTube oficiais do grupo.</p>'
          '<p><a class="text-link" href="https://www.instagram.com/petmedicina.ufmt/" target="_blank" rel="noopener noreferrer">Abrir o Instagram do PET ↗</a> · '
          '<a class="text-link" href="https://www.youtube.com/@petmedicina-ufmt3590" target="_blank" rel="noopener noreferrer">Abrir o canal no YouTube ↗</a></p>'
          '<p><a class="text-link" href="/redes/">Ver os posts e vídeos de todos os projetos →</a></p></section>')
    return h


def main():
    checar = '--checar' in sys.argv
    dados = json.load(open(os.path.join(RAIZ, 'projetos-dados.json'), encoding='utf-8'))
    redes = json.load(open(os.path.join(RAIZ, 'redes-dados.json'), encoding='utf-8'))
    raiz_re = re.compile(r"(<div class='wrap pj' id='pj-raiz'[^>]*>)(.*?)(</div></main>)", re.S)
    fora = []
    for slug, p in dados.items():
        caminho = os.path.join(RAIZ, 'projetos', slug, 'index.html')
        if not os.path.exists(caminho):
            fora.append(slug + ' (sem página)')
            continue
        html = open(caminho, encoding='utf-8', newline='').read()
        m = raiz_re.search(html)
        if not m:
            fora.append(slug + ' (sem #pj-raiz)')
            continue
        novo = html[:m.start()] + "<div class='wrap pj' id='pj-raiz' data-gerado>" + pagina(p, redes.get(slug, {})) + m.group(3) + html[m.end():]
        # o titulo e a descricao acompanham os dados
        novo = re.sub(r"<meta name='description' content='[^']*'>", "<meta name='description' content='%s'>" % esc_base(p['resumo']), novo, count=1)
        if novo != html:
            fora.append(slug)
            if not checar:
                open(caminho, 'w', encoding='utf-8', newline='').write(novo)
    if checar:
        print('Páginas de projeto em dia.' if not fora else 'Fora de dia: ' + ', '.join(fora))
        sys.exit(1 if fora else 0)
    print('%d página(s) atualizada(s)%s' % (len(fora), ': ' + ', '.join(fora) if fora else ''))


main()
