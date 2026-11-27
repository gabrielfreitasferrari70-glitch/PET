#!/usr/bin/env python3
"""Gera /seja-petiano/: tudo do processo seletivo do PET Medicina UFMT num lugar so, com o arquivo direto em cada passo.
Fonte: edital 014/2026 PROEG (pasta do processo seletivo 2027.1 no Drive do PET) e o link da bio do @petmedicina.ufmt.
Para um novo edital: troque EDICAO, FATOS, REQUISITOS, ETAPAS, NOTA e DOCS e rode antes de aplicar-navegacao.py:
   python3 ferramentas/gerar-seja-petiano.py
O estado de cada etapa (concluida, agora, em breve) e calculado no navegador pelas datas (seja-petiano.js).
"""
import html, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
URL = SITE + '/seja-petiano/'
TITULO = 'Seja um Petiano'
DESC = 'Processo seletivo do PET Medicina UFMT: requisitos, etapas, datas, edital, anexos, material de estudo e resultados, cada um com o arquivo direto.'

D = 'https://drive.google.com/file/d/{}/view'
DOC = 'https://docs.google.com/document/d/{}/edit'
PASTA = 'https://drive.google.com/drive/folders/{}'

EDICAO = {'nome': 'Processo seletivo 2027.1', 'edital': 'Edital 014/2026 PROEG/CFD/GPE', 'email': 'selecaopetmedicinaufmt@gmail.com',
          'pasta': PASTA.format('1yr9QoVW5UdYMA7Rtkjb-xwRUcErOoLa_'), 'edital_url': D.format('1F5mylE-1WllSIig1MpxaVFa3UTwEQ-QY')}

FATOS = [('3', 'vagas de bolsista'), ('R$ 700', 'de bolsa por mês'), ('20 h', 'por semana no programa'), ('Quinta, 18h', 'reunião semanal do grupo')]

REQUISITOS = [
    'Estar no 1º, 2º, 3º ou 4º semestre de Medicina na data da seleção.',
    'Coeficiente de rendimento igual ou maior que 7,0 e nenhuma reprovação no curso.',
    'Não receber outra bolsa (Capes, CNPq, IES, CIEE, IEL ou institucional), exceto a Bolsa Permanência do MEC, ou abrir mão dela.',
    'Ter 20 horas por semana para o PET e poder ir às reuniões de quinta, a partir das 18h.',
    'Conhecer o programa (Manual de Orientações Básicas e legislação) e as atividades do PET Medicina em 2026 e 2027.',
    'Participar das três etapas nas datas do edital, com histórico escolar e Currículo Lattes atualizados.',
]

# Cada arquivo: (tipo, titulo, url, detalhe). Tipos: PDF, DOC, PASTA, SITE, FORM.
EDITAL = ('PDF', 'Edital do processo seletivo', EDICAO['edital_url'], 'Edital 014/2026 · 6 páginas')
ANEXO1 = ('DOC', 'Anexo I · Declaração de não receber bolsa', DOC.format('1ux1FJIP0qBz-819LL9SQPLnv7ui6nB_MrRoFZrF-B9w'), 'Modelo para preencher e assinar')
ANEXO2 = ('DOC', 'Anexo II · Declaração de 20 horas semanais', DOC.format('1RUQvXxyWnP4gNwYe6igeIEvsimI1ss0QoNtPXLUbRK4'), 'Modelo para preencher e assinar')
ANEXO3 = ('DOC', 'Anexo III · Normas do projeto de extensão', DOC.format('1B9HYtHastFdIJNeLMWO2J1onXUkXPoPN6tKjVWhsfdM'), 'Formatação da etapa II')
ANEXO4 = ('DOC', 'Anexo IV · Critérios de avaliação do projeto', DOC.format('1PRInwyj5p0lOq8w2K3FiIP91qnKw_MfWqwpQ4LGTn-c'), 'Como o projeto é corrigido')
MOB = ('PDF', 'MOB · Manual de Orientações Básicas do PET', D.format('1DLNhu9N4NsBjh3O7LH87innB6thiIFVb'), 'Base da prova objetiva')
ESTUDO = ('PASTA', 'Pasta Material de Estudo', PASTA.format('1vBdylD-tvaeYQrEzqAmUdGMvF8SdaDFs'), 'Indicada no edital')
CENAPET = ('PASTA', 'Materiais do processo seletivo · MOB e CENAPET', PASTA.format('1oumVm7Z9C7mchhTrcnjm1jEZXQzFYvwU'), 'Acervo do PET')
MEC_MANUAL = ('SITE', 'Manual básico do PET no portal do MEC', 'http://portal.mec.gov.br/sesu/arquivos/pdf/PET/pet_manual_basico.pdf', 'portal.mec.gov.br')
MEC_LEIS = ('SITE', 'Legislação do PET no portal do MEC', 'http://portal.mec.gov.br/pet/legislacao', 'portal.mec.gov.br')
INSCR = ('PDF', 'Inscrições deferidas e indeferidas', D.format('1i6d-y-AGdhKdyQuCi6HEBkdyc_-CBrvb'), 'Publicado em 17 out')
INSCR_POS = ('PDF', 'Inscrições após recurso', D.format('1p2vEYQvJPBD4xRBJMahkf02EF8aY6WwQ'), 'Publicado em 20 out')
GABARITO = ('PDF', 'Gabarito da prova objetiva', D.format('1hBy8ZgJ7P1IkdrAMdv-18wmXnhKmV0s1'), 'Publicado em 5 nov')
ETAPA2 = ('PDF', 'Classificados para a etapa II', D.format('1QzYt9ThipIJ9HOD1xmKn8UfDwT56VeD3'), 'Publicado em 5 nov')
ETAPA2_NOTAS = ('PDF', 'Notas da etapa I', D.format('14BHlcJi1uFA1joXrCH4ExN0LHO4jcRKp'), 'Publicado em 5 nov')
ETAPA3_PARCIAL = ('PDF', 'Classificação parcial para a etapa III', D.format('11sOHDB379ju-saru4lGoQCE-x1jn9FXE'), 'Publicado em 18 nov')
ETAPA3 = ('PDF', 'Classificados para a etapa III', D.format('1Nu_TtC6_jIYoUa5BQstSc8a1-k820q_O'), 'Publicado em 21 nov')
CRONO = ('PDF', 'Cronograma das entrevistas', D.format('1TlF7UZHPzhiNo928nf74LARxsVHfxY7P'), 'Publicado em 26 nov')
RESULTADOS = ('PASTA', 'Pasta com todos os resultados', PASTA.format('1NMPMFAiJAM5Z_6vyyL79C3wZKyULX27d'), 'Atualizada a cada divulgação')

# Etapas no formato passo a passo. inicio/fim em horario de Cuiaba (-04:00); o navegador marca o estado.
ETAPAS = [
    {'id': 'estudar', 'titulo': 'Conheça o PET e estude', 'quando': 'Antes da inscrição', 'inicio': '2026-09-24T00:00:00-04:00', 'fim': '2026-10-16T23:59:00-04:00',
     'texto': 'A prova objetiva cobra o Manual de Orientações Básicas e a legislação do programa. A entrevista pergunta o que o PET Medicina fez em 2026 e como você entraria nessas atividades.',
     'itens': [], 'arquivos': [MOB, ESTUDO, CENAPET, MEC_MANUAL, MEC_LEIS], 'extra': ('Conheça os projetos do PET', '/projetos/', 'Os 12 projetos do PET Medicina, o que cada um faz e como você entraria neles')},
    {'id': 'inscricao', 'titulo': 'Faça a inscrição', 'quando': '12 a 16 de outubro', 'inicio': '2026-10-12T00:00:00-04:00', 'fim': '2026-10-19T23:59:00-04:00',
     'texto': 'Pelo formulário do edital, com estes documentos:',
     'itens': ['Documento de identidade e CPF', 'Histórico escolar atualizado (no 1º semestre, o comprovante de matrícula)', 'Currículo Lattes atualizado', 'Anexo I e Anexo II preenchidos'],
     'arquivos': [ANEXO1, ANEXO2, INSCR, INSCR_POS], 'datas': [('17 out, 18h', 'Inscrições deferidas e indeferidas'), ('18 out', 'Recurso contra indeferimento'), ('19 out, 18h', 'Resultado final das inscrições')]},
    {'id': 'objetiva', 'titulo': 'Etapa I · Prova objetiva', 'quando': '5 de novembro, 18h30 às 19h30', 'inicio': '2026-11-05T18:30:00-04:00', 'fim': '2026-11-09T23:59:00-04:00',
     'texto': '20 questões de quatro alternativas, 0,5 ponto cada. Passam para a etapa II os 20 primeiros com pelo menos 7 pontos (e os empatados na 20ª posição).',
     'itens': [], 'arquivos': [GABARITO, ETAPA2_NOTAS, ETAPA2], 'datas': [('5 nov, 21h', 'Classificação preliminar'), ('6 nov', 'Recurso, por e-mail'), ('9 nov, 18h', 'Classificação definitiva')]},
    {'id': 'projeto', 'titulo': 'Etapa II · Projeto de extensão', 'quando': 'Entrega até 5 de novembro, 23h59', 'inicio': '2026-11-05T00:00:00-04:00', 'fim': '2026-11-21T23:59:00-04:00',
     'texto': 'Um projeto de extensão escrito, enviado por e-mail para ' + EDICAO['email'] + ', nas normas do Anexo III. Passam para a etapa III os 15 melhores na soma das etapas I e II.',
     'itens': [], 'arquivos': [ANEXO3, ANEXO4, ETAPA3_PARCIAL, ETAPA3], 'datas': [('18 nov, 18h', 'Classificação preliminar'), ('19 nov', 'Recurso, por e-mail'), ('21 nov, 18h', 'Classificados para a entrevista')]},
    {'id': 'entrevista', 'titulo': 'Etapa III · Entrevista', 'quando': '28 de novembro, a partir das 13h30', 'inicio': '2026-11-26T18:00:00-04:00', 'fim': '2026-11-28T23:59:00-04:00',
     'texto': 'Sala 54 da Faculdade de Medicina (CCBSI), campus Cuiabá. O horário de cada candidato está na ata do cronograma, publicada em 26 de novembro. Tolerância de 3 minutos. São 15 minutos ao todo:',
     'itens': ['3 minutos para preparar a apresentação', '6 minutos para apresentar o projeto de extensão', '6 minutos de arguição',
               'Sem pendrive? Envie a apresentação para petmedicina.ufmt@gmail.com até 23h59 da véspera'],
     'arquivos': [CRONO]},
    {'id': 'resultado', 'titulo': 'Resultado', 'quando': '29 de novembro a 5 de dezembro', 'inicio': '2026-11-29T00:00:00-04:00', 'fim': '2026-12-05T23:59:00-04:00',
     'texto': 'Os 3 primeiros viram bolsistas e os 4 seguintes ficam classificados, com validade de 6 meses. Tudo sai no Instagram do PET e entra na pasta de resultados.',
     'itens': [], 'arquivos': [RESULTADOS], 'datas': [('29 nov, 20h', 'Classificação preliminar da entrevista'), ('30 nov', 'Recurso, por e-mail'), ('3 dez, 18h', 'Aprovados na seleção'),
                                                    ('4 dez', 'Recurso contra o resultado'), ('5 dez, 18h', 'Resultado final')]},
]

NOTA = [('Etapa I', 'Prova objetiva', 2), ('Etapa II', 'Projeto de extensão', 3), ('Etapa III', 'Entrevista', 5)]

ANTERIORES = [
    ('2024', [('SITE', 'Edital retificado', 'https://cms.ufmt.br/files/publication/473/E03a041cec4e74ff5a6063172d09a58d46a8f7cb0.pdf', 'ufmt.br'),
              ('PASTA', 'Edital e materiais de estudo', PASTA.format('13l-dqmScZ1-IHKu5KGWOxlUBra434PZv'), 'Drive do PET'),
              ('PDF', 'Classificados para a etapa II', D.format('1Hd7Gepiae0K3ZVI-Y67uLZxA8azfYJhc'), 'Drive do PET'),
              ('PDF', 'Classificados para a etapa III', D.format('1YWP_naYgbWnKzHjDoFBMRU-BVbaXBlrX'), 'Drive do PET'),
              ('PDF', 'Resultado final', D.format('1_vbdD9tH_H8iCJurJiB-_MPRiU3_5AXw'), 'Drive do PET')]),
    ('2023', [('PDF', 'Edital', D.format('1Vh8N93FxyGOuTfqU8rCWQQy2dKOp9dOO'), 'Drive do PET'),
              ('SITE', 'Resultado dos recursos de inscrição', 'https://petmedicina.com/ps-2023-resultado-da-analise-dos-recursos-contra-indeferimento-divulgados/', 'petmedicina.com')]),
    ('2022', [('PDF', 'Anexo 1 · Redação', D.format('11Srq7DLS6mGeadf-0tRUX7dz9qSqawN6'), 'Drive do PET')]),
]

PERGUNTAS = [
    ('Em que semestre preciso estar?', 'No 1º, 2º, 3º ou 4º semestre de Medicina na data da seleção.'),
    ('O PET paga bolsa?', 'Sim. O edital 014/2026 prevê bolsa mensal de R$ 700,00 para os 3 aprovados, cadastrados no SIGPET quando os petianos atuais entram no internato.'),
    ('Quanto tempo o PET ocupa?', '20 horas por semana, com reunião do grupo toda quinta-feira a partir das 18h.'),
    ('Onde saem os resultados?', 'No Instagram @petmedicina.ufmt e na pasta de resultados do Drive. O resultado final das inscrições também sai na página de editais da UFMT.'),
    ('Como peço revisão de um resultado?', 'Cada etapa tem um dia de recurso, sempre até 23h59. Nas etapas I, II e III e no resultado final, o recurso vai para ' + EDICAO['email'] + '.'),
    ('Perdi este processo. Quando abre o próximo?', 'O PET abre seleção quando há vagas, em geral uma vez por ano. Acompanhe o Instagram do PET e volte a esta página.'),
]

E = html.escape


def seta(url):
    return '→' if url.startswith('/') else '↗'


def arquivo(a, grupo=''):
    tipo, titulo, url, det = a
    alvo = '' if url.startswith('/') else " target='_blank' rel='noopener noreferrer'"
    g = f" data-grupo='{grupo}'" if grupo else ''
    return (f"<li{g}><a class='sp-arq' href='{E(url)}'{alvo}><span class='sp-tipo sp-tipo-{tipo.lower()}'>{tipo}</span>"
            f"<span class='sp-arq-txt'><strong>{E(titulo)}</strong><small>{E(det)}</small></span><span class='sp-arq-seta' aria-hidden='true'>{seta(url)}</span></a></li>")


def etapa(n, e):
    itens = ''.join(f'<li>{E(i)}</li>' for i in e['itens'])
    itens = f"<ul class='cx-lista'>{itens}</ul>" if itens else ''
    datas = ''.join(f"<li><b>{E(d)}</b><span>{E(t)}</span></li>" for d, t in e.get('datas', []))
    datas = f"<details class='sp-datas'><summary>Todas as datas desta etapa</summary><ol>{datas}</ol></details>" if datas else ''
    arqs = ''.join(arquivo(a) for a in e['arquivos'])
    extra = (f"<a class='sp-destaque' href='{e['extra'][1]}'><span class='sp-destaque-txt'><strong>{E(e['extra'][0])}</strong><small>{E(e['extra'][2])}</small></span>"
             f"<span class='sp-destaque-seta' aria-hidden='true'>→</span></a>") if e.get('extra') else ''
    return (f"<li class='sp-passo' id='etapa-{e['id']}' data-inicio='{e['inicio']}' data-fim='{e['fim']}'>"
            f"<span class='sp-num' aria-hidden='true'>{n}</span><div class='sp-passo-corpo'>"
            f"<div class='sp-passo-topo'><h3>{E(e['titulo'])}</h3><span class='sp-estado' data-estado></span></div>"
            f"<p class='sp-quando'>{E(e['quando'])}</p><p>{E(e['texto'])}</p>{itens}"
            f"<ul class='sp-arqs' aria-label='Arquivos: {E(e['titulo'])}'>{arqs}</ul>{datas}{extra}</div></li>")


fatos = ''.join(f"<li><b>{E(a)}</b><span>{E(b)}</span></li>" for a, b in FATOS)
req = ''.join(f'<li>{E(r)}</li>' for r in REQUISITOS)
passos = ''.join(etapa(i + 1, e) for i, e in enumerate(ETAPAS))
nota = ''.join(f"<li><span class='sp-peso-barra sp-peso-{p}' aria-hidden='true'></span><b>{p * 10}%</b><span>{E(a)} · {E(b)} <small>peso {p}</small></span></li>" for a, b, p in NOTA)

grupos = [('edital', 'Edital e anexos', [EDITAL, ANEXO1, ANEXO2, ANEXO3, ANEXO4]),
          ('estudo', 'Material de estudo', [MOB, ESTUDO, CENAPET, MEC_MANUAL, MEC_LEIS]),
          ('resultados', 'Resultados publicados', [CRONO, ETAPA3, ETAPA3_PARCIAL, ETAPA2, ETAPA2_NOTAS, GABARITO, INSCR_POS, INSCR, RESULTADOS])]
filtros = "<button type='button' class='sp-filtro' aria-pressed='true' data-filtro=''>Todos</button>" + ''.join(
    f"<button type='button' class='sp-filtro' aria-pressed='false' data-filtro='{g}'>{E(n)} <span>{len(l)}</span></button>" for g, n, l in grupos)
docs = ''.join(f"<section class='sp-doc-grupo' data-grupo='{g}' aria-labelledby='sp-g-{g}'><h3 id='sp-g-{g}'>{E(n)}</h3><ul class='sp-arqs'>{''.join(arquivo(a) for a in l)}</ul></section>" for g, n, l in grupos)
antes = ''.join(f"<details class='sp-ano'><summary><b>{a}</b><span>{len(l)} {'arquivo' if len(l) == 1 else 'arquivos'}</span></summary><ul class='sp-arqs'>{''.join(arquivo(x) for x in l)}</ul></details>" for a, l in ANTERIORES)
faq = ''.join(f"<details class='sp-faq'><summary>{E(q)}</summary><p>{E(r)}</p></details>" for q, r in PERGUNTAS)

CORPO = f"""<div class='wrap sp-hero'>
<div class='sp-hero-txt'><span class='eyebrow'>{E(EDICAO['nome']).upper()} · {E(EDICAO['edital'])}</span><h1>Seja um Petiano.</h1>
<p class='intro-description'>Tudo do processo seletivo do PET Medicina UFMT em um lugar só: quem pode entrar, cada etapa com o arquivo certo e os resultados já publicados.</p>
<ul class='sp-fatos'>{fatos}</ul>
<div class='sp-acoes'><a class='button' href='{EDICAO['edital_url']}' target='_blank' rel='noopener noreferrer'>Ler o edital <span aria-hidden='true'>↗</span></a><a class='button secondary' href='#documentos'>Todos os arquivos <span aria-hidden='true'>↓</span></a></div></div>
<aside class='sp-agora' aria-labelledby='sp-agora-t' data-agora><span class='eyebrow'>AGORA NO PROCESSO</span><h2 id='sp-agora-t' data-agora-titulo>Etapa III · Entrevista</h2>
<p class='sp-agora-quando' data-agora-quando>28 de novembro, a partir das 13h30</p><p data-agora-texto>Sala 54 da Faculdade de Medicina (CCBSI), no horário de cada candidato na ata.</p>
<a class='button' href='#etapa-entrevista' data-agora-link>Ver esta etapa <span aria-hidden='true'>↓</span></a>
<ol class='sp-linha' aria-label='Andamento das etapas'>{''.join(f"<li data-linha='{e['id']}'><span>{E(e['titulo'].split(' · ')[-1])}</span></li>" for e in ETAPAS)}</ol></aside>
</div>
<div class='wrap sp'>
<section class='sp-sec' aria-labelledby='sp-req'><h2 id='sp-req'>Quem pode se inscrever</h2><ul class='sp-req'>{req}</ul></section>
<section class='sp-sec' aria-labelledby='sp-passos'><h2 id='sp-passos'>Passo a passo</h2><p class='sp-sub'>Da preparação ao resultado final, com os arquivos de cada etapa logo abaixo dela.</p><ol class='sp-passos'>{passos}</ol></section>
<section class='sp-sec sp-nota' aria-labelledby='sp-nota-t'><div><h2 id='sp-nota-t'>Como a nota final é calculada</h2><p>Cada etapa vale de 0 a 10. A nota final é a média ponderada: a entrevista pesa metade.</p>
<p class='sp-formula'>Nota final = (E1 × 2 + E2 × 3 + E3 × 5) ÷ 10</p><p class='sp-sub'>Empate: primeiro quem tem 60 anos ou mais, depois quem está no semestre mais avançado, depois quem é mais velho.</p></div><ul class='sp-pesos'>{nota}</ul><form class='sp-calc' data-calc novalidate><div class='sp-calc-topo'><h3>Teste a sua</h3><p>Digite suas notas de 0 a 10 e veja a nota final. Nada é enviado ou guardado.</p></div><div class='sp-calc-campos'><label><span>Etapa I · prova <small>peso 2</small></span><input type='number' inputmode='decimal' min='0' max='10' step='0.1' name='e1' placeholder='0 a 10'></label><label><span>Etapa II · projeto <small>peso 3</small></span><input type='number' inputmode='decimal' min='0' max='10' step='0.1' name='e2' placeholder='0 a 10'></label><label><span>Etapa III · entrevista <small>peso 5</small></span><input type='number' inputmode='decimal' min='0' max='10' step='0.1' name='e3' placeholder='0 a 10'></label><div class='sp-calc-res' aria-live='polite'><span>Nota final</span><output name='nf' data-calc-nota>–</output><small data-calc-aviso>Preencha as três notas.</small></div></div></form></section>
<section class='sp-sec' id='documentos' aria-labelledby='sp-docs'><h2 id='sp-docs'>Todos os arquivos</h2><p class='sp-sub'>Cada item abre direto o arquivo no Drive do PET.</p>
<div class='sp-filtros' role='group' aria-label='Filtrar arquivos'>{filtros}</div><div class='sp-docs'>{docs}</div></section>
<section class='sp-sec' aria-labelledby='sp-antes'><h2 id='sp-antes'>Edições anteriores</h2><p class='sp-sub'>Editais e resultados de outros anos, para entender como a seleção costuma ser.</p><div class='sp-anos'>{antes}</div></section>
<section class='sp-sec' aria-labelledby='sp-faq-t'><h2 id='sp-faq-t'>Perguntas frequentes</h2><div class='sp-faqs'>{faq}</div></section>
<section class='cx-sec cx-dica' aria-labelledby='sp-duvida'><div><span class='eyebrow'>DÚVIDAS SOBRE A SELEÇÃO</span><h2 id='sp-duvida'>Fale com a comissão do PET</h2><p>Dúvidas sobre o edital vão direto para a comissão de seleção, pelo e-mail <b>{EDICAO['email']}</b>. As publicações oficiais saem no Instagram do PET.</p></div>
<div class='sp-acoes'><a class='button' href='mailto:{EDICAO['email']}'>Mandar e-mail <span aria-hidden='true'>↗</span></a><a class='button secondary' href='https://www.instagram.com/petmedicina.ufmt/' target='_blank' rel='noopener noreferrer'>Instagram do PET <span aria-hidden='true'>↗</span></a></div></section>
<p class='cx-nota'>O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT. Em caso de diferença, vale o edital publicado pela UFMT e pelo PET.</p>
</div>"""

with open(os.path.join(RAIZ, 'participar', 'index.html'), encoding='utf-8', newline='') as f:
    base = re.sub(r"\?v=[0-9a-f]{10}", '', f.read())


def troca(padrao, novo, texto):
    saida, n = re.subn(padrao, lambda m: novo, texto, count=1, flags=re.S)
    assert n == 1, 'molde mudou: ' + padrao
    return saida


h = base
h = troca(r"<title>.*?</title>", f"<title>{TITULO} · PET Conecta</title>", h)
h = troca(r"<meta name='description' content='[^']*'>", f"<meta name='description' content='{DESC}'>", h)
h = troca(r"<link rel='canonical' href='[^']*'>", f"<link rel='canonical' href='{URL}'>", h)
h = troca(r"<meta property='og:title' content='[^']*'>", f"<meta property='og:title' content='{TITULO} · PET Conecta'>", h)
h = troca(r"<meta property='og:description' content='[^']*'>", f"<meta property='og:description' content='{DESC}'>", h)
h = troca(r"<meta property='og:url' content='[^']*'>", f"<meta property='og:url' content='{URL}'>", h)
h = troca(r"<meta property='og:image:alt' content='[^']*'>", f"<meta property='og:image:alt' content='{TITULO} · PET Conecta'>", h)
h = troca(r"(<script src='/site.js' defer></script>)", r"<script src='/site.js' defer></script><script src='/seja-petiano.js' defer></script>", h)
h = troca(r"<main id='conteudo'[^>]*>.*?</main>", "<main id='conteudo'>" + CORPO.replace('\n', '') + "</main>", h)
os.makedirs(os.path.join(RAIZ, 'seja-petiano'), exist_ok=True)
with open(os.path.join(RAIZ, 'seja-petiano', 'index.html'), 'w', encoding='utf-8', newline='') as f:
    f.write(h)
print('gerada /seja-petiano/')
