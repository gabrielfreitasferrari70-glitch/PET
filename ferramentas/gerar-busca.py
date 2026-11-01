"""Atualiza search-index.json com as edicoes do Anamnese e os videos da pagina YouTube.

Le o acervo publicado no Supabase (somente leitura) e youtube/index.html. Rode depois de publicar
uma edicao nova ou acrescentar um video. Tambem da a cada video o id usado pelo link da busca.
"""
import html, json, os, re, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
caminho = lambda *p: os.path.join(RAIZ, *p)
ler = lambda p: open(caminho(p), encoding='utf-8', newline='').read()


def texto(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def edicoes():
    js = ler('pet-dados.js')
    base = re.search(r"BASE='([^']+)'", js).group(1)
    chave = re.search(r"KEY='([^']+)'", js).group(1)
    url = base + '/rest/v1/pet_edicoes_anamnese?select=numero,titulo,mes,ano,resumo,disponivel_publicamente,pagina_interna&publicado=eq.true&order=numero.desc'
    with urllib.request.urlopen(urllib.request.Request(url, headers={'apikey': chave}), timeout=20) as r:
        linhas = json.load(r)
    for e in linhas:
        if not e['disponivel_publicamente'] or e['pagina_interna'] or not e['titulo']:
            continue
        quando = ' '.join(str(x) for x in (e['mes'], e['ano']) if x)
        yield {'title': f"Anamnese nº {e['numero']}: {e['titulo']}", 'text': ' '.join(x for x in (e['resumo'], quando) if x),
               'url': '/publicacoes/anamnese/?q=' + urllib.parse.quote(e['titulo']), 'kind': 'Jornal'}


def videos():
    pagina = ler('youtube/index.html')

    def marca(m):
        codigo = re.search(r'watch\?v=([\w-]{11})', m.group(0)).group(1)
        return re.sub(r'<li class="yt-item"(?: id="[^"]*")?>', f'<li class="yt-item" id="v-{codigo}">', m.group(0), count=1)

    nova = re.sub(r'<li class="yt-item"[^>]*>.*?</li>', marca, pagina, flags=re.S)
    if nova != pagina:
        open(caminho('youtube/index.html'), 'w', encoding='utf-8', newline='').write(nova)
    for m in re.finditer(r'<li class="yt-item" id="v-([\w-]{11})">.*?</li>', nova, flags=re.S):
        item = m.group(0)
        titulo = texto(re.search(r'class="yt-titulo">(.*?)</strong>', item, re.S).group(1))
        resumo = texto(re.search(r'class="yt-resumo"[^>]*>(.*?)</p>', item, re.S).group(1))
        yield {'title': titulo, 'text': resumo, 'url': f'/youtube/#v-{m.group(1)}', 'kind': 'Vídeo'}


indice = [x for x in json.loads(ler('search-index.json')) if not x['url'].startswith(('/youtube/#v-', '/publicacoes/anamnese/?q='))]
novos = list(edicoes()) + list(videos())
with open(caminho('search-index.json'), 'w', encoding='utf-8', newline='') as f:
    json.dump(indice + novos, f, ensure_ascii=False)
print(f'{len(indice)} itens fixos e {len(novos)} gerados.')
