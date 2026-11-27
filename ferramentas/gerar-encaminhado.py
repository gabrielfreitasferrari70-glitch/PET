#!/usr/bin/env python3
"""Gera /encaminhado/ (Fui encaminhado, e agora?): o caminho da familia depois de uma triagem do PET ate a consulta pelo SUS em Cuiaba.
Mesmo formato de /seja-petiano/ e /doar/. O progresso e a lista do que levar ficam so neste aparelho (localStorage);
o retorno "em que etapa voce esta" e anonimo e vai para a contagem do site (petMedir), como na pagina da acao.
Fontes: servicos do Governo de MT (SISREG, Transparencia da Regulacao), Ministerio da Saude (Meu SUS Digital, Ouvidoria 136).
Rode antes de aplicar-navegacao.py:  python3 ferramentas/gerar-encaminhado.py
"""
import html, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
URL = SITE + '/encaminhado/'
TITULO = 'Fui encaminhado, e agora?'
DESC = 'Recebeu um papel do PET pedindo consulta? O caminho até o especialista pelo SUS em Cuiabá: o que levar, a UBS, a regulação, como acompanhar e o que fazer se demorar.'
E = html.escape

REGULACAO = 'https://portaltransparenciaregulacaomt.saude.mt.gov.br'
MEUSUS = 'https://meususdigital.saude.gov.br/'

# (id, titulo, quando, texto, itens, arquivos)
PASSOS = [
    ('papel', 'Leia e guarde o papel', 'No mesmo dia', 'O papel do PET mostra o resultado de uma triagem: um teste rápido que separa quem precisa de uma avaliação completa. Não é um diagnóstico. Guarde: ele explica à unidade de saúde por que você está pedindo a consulta.',
     [], [('PÁGINA', 'O papel é do teste de visão na escola?', '/acao/acuidade-visual/', 'Veja o que o resultado quer dizer'), ('PÁGINA', 'Projeto Acuidade Visual', '/projetos/acuidade-visual/', 'Como o PET faz a triagem nas escolas')]),
    ('ubs', 'Vá à unidade de saúde do seu bairro', 'Nos próximos dias', 'A porta de entrada para o especialista pelo SUS é a Unidade Básica de Saúde (UBS) perto de casa. Leve o papel e os documentos da lista abaixo e peça uma consulta por causa do encaminhamento.',
     ['Não sabe qual é a sua UBS? O aplicativo Meu SUS Digital mostra a mais próxima', 'Se ainda não tem cartão do SUS, a própria UBS faz o cadastro'],
     [('APP', 'Meu SUS Digital', MEUSUS, 'Cartão do SUS, UBS mais próxima e consultas agendadas')]),
    ('pedido', 'Consulta na UBS e pedido do especialista', 'Na UBS', 'O médico ou o enfermeiro da UBS avalia e, se for preciso, pede a consulta com o especialista pelo sistema de regulação do SUS (SISREG). Antes de sair, confira duas coisas:',
     ['Se o seu telefone e o endereço estão certos no cadastro: é por eles que avisam a data', 'Se o pedido foi feito e para qual especialidade'], []),
    ('espera', 'Acompanhe o agendamento', 'De algumas semanas a alguns meses', 'A central de regulação marca conforme a prioridade de cada caso, e a UBS avisa o local, o dia e a hora. Enquanto espera, você mesmo pode acompanhar:',
     ['No portal de Transparência da Regulação de MT, com o CPF ou o número do cartão do SUS', 'No Meu SUS Digital, que mostra as consultas já agendadas', 'Na própria UBS, perguntando pela situação do pedido'],
     [('SITE', 'Consultar a lista de espera (SISREG)', REGULACAO, 'Transparência da Regulação · Governo de MT')]),
    ('consulta', 'A consulta com o especialista', 'No dia marcado', 'Chegue com antecedência e leve tudo da lista. Anote o que o especialista orientar e, se ele pedir, volte à UBS com o resultado para continuar o cuidado perto de casa.',
     ['Se não puder ir, avise a UBS o quanto antes: assim a vaga passa para outra pessoa e você pede um novo horário'], []),
]

LEVAR = [('papel', 'O papel do PET (o encaminhamento da triagem)'), ('doc', 'Documento com foto (da criança, se for para ela, e do responsável)'),
         ('sus', 'Cartão do SUS ou CPF'), ('end', 'Comprovante de endereço'), ('exames', 'Exames, receitas ou laudos anteriores, se tiver'), ('oculos', 'Óculos ou aparelho que já usa, se for o caso')]

DEMORA = [
    ('Volte à UBS e pergunte pela situação do pedido', 'Peça para conferir se o pedido está no sistema, com que prioridade e se o seu telefone está certo.'),
    ('Consulte a lista de espera', 'No portal de Transparência da Regulação de MT, com o CPF ou o cartão do SUS, você vê se o pedido está aguardando, agendado ou se precisa de algo.'),
    ('Registre na Ouvidoria do SUS', 'Se o pedido sumiu, foi negado sem explicação ou a espera passou muito do normal, ligue 136 (Disque Saúde). A ligação é gratuita.'),
    ('Se piorar, não espere', 'Dor forte, piora rápida ou um sintoma novo e grave não esperam a fila: procure a UPA ou ligue 192 (SAMU).'),
]

PERGUNTAS = [
    ('Preciso pagar alguma coisa?', 'Não. A consulta na UBS, o pedido pela regulação e a consulta com o especialista pelo SUS são gratuitos.'),
    ('O PET marca a consulta para mim?', 'Não. O PET faz a triagem e orienta. Quem marca é a rede do SUS, a partir da UBS. Se tiver dúvida no caminho, pergunte ao PET.'),
    ('Quanto tempo demora?', 'Depende da especialidade e da prioridade do caso, definida pela central de regulação. Por isso vale acompanhar pelo portal e manter o telefone atualizado na UBS.'),
    ('Posso ir direto a um hospital ou ao especialista?', 'Para casos sem urgência, o caminho pelo SUS começa na UBS, que faz o pedido. Em urgência, procure a UPA ou ligue 192.'),
    ('Mudei de telefone. E agora?', 'Avise a UBS para atualizar o cadastro. É pelo telefone que avisam a data da consulta.'),
    ('Minhas respostas nesta página vão para algum lugar?', 'O progresso e a lista do que levar ficam só no seu aparelho. A pergunta "em que etapa você está?" é anônima: não pedimos nome, telefone nem escola, e ela só ajuda o PET a saber se as famílias estão conseguindo a consulta.'),
]

FONTES = [
    ('Governo de MT · Consultar lista de espera do SISREG', 'https://portal.mt.gov.br/catalog/consultar-lista-de-espera-do-sistema-de-regulacao-sisreg'),
    ('Governo de MT · Consulta especializada começa na UBS, via regulação', 'https://portal.mt.gov.br/app/catalog/secretaria-de-estado-de-saude/realizar-consulta-medica-especializada-em-ist-hiv-aids-e-hepatites-virais'),
    ('Ministério da Saúde · Meu SUS Digital', MEUSUS),
    ('Ministério da Saúde · Ouvidoria-Geral do SUS (136)', 'https://www.gov.br/saude/pt-br/canais-de-atendimento/ouvsus'),
]


def projeto(img, alt, rotulo, titulo, texto, url, botao):
    """Cartao que liga esta pagina ao projeto do PET (ou a outra pagina) que explica o mesmo assunto."""
    return (f"<li><a class='lg-proj' href='{url}'><img src='{img}' alt='{E(alt)}' width='1600' height='900' loading='lazy' decoding='async'>"
            f"<span class='lg-proj-txt'><span class='lg-rotulo'>{E(rotulo)}</span><strong>{E(titulo)}</strong><span>{E(texto)}</span><span class='lg-ver'>{E(botao)} <span aria-hidden='true'>→</span></span></span></a></li>")


def seta(url):
    return '→' if url.startswith('/') or url.startswith('#') else '↗'


def arquivo(a):
    tipo, titulo, url, det = a
    alvo = '' if url.startswith('/') else " target='_blank' rel='noopener noreferrer'"
    classe = 'site' if tipo in ('APP', 'PÁGINA') else tipo.lower()
    return (f"<li><a class='sp-arq' href='{E(url)}'{alvo}><span class='sp-tipo sp-tipo-{classe}'>{tipo}</span>"
            f"<span class='sp-arq-txt'><strong>{E(titulo)}</strong><small>{E(det)}</small></span><span class='sp-arq-seta' aria-hidden='true'>{seta(url)}</span></a></li>")


def passo(n, p):
    pid, titulo, quando, texto, itens, arqs = p
    li = ''.join(f'<li>{E(i)}</li>' for i in itens)
    li = f"<ul class='cx-lista'>{li}</ul>" if li else ''
    ar = f"<ul class='sp-arqs'>{''.join(arquivo(a) for a in arqs)}</ul>" if arqs else ''
    return (f"<li class='sp-passo' id='etapa-{pid}' data-etapa='{pid}'><span class='sp-num' aria-hidden='true'>{n}</span><div class='sp-passo-corpo'>"
            f"<div class='sp-passo-topo'><h3>{E(titulo)}</h3><span class='sp-estado' data-estado></span></div><p class='sp-quando'>{E(quando)}</p><p>{E(texto)}</p>{li}{ar}"
            f"<button type='button' class='en-feito' data-feito='{pid}' aria-pressed='false'><span aria-hidden='true'>✓</span> <span data-feito-txt>Marcar como feito</span></button></div></li>")


passos = ''.join(passo(i + 1, p) for i, p in enumerate(PASSOS))
linha = ''.join(f"<li data-linha='{p[0]}'><span>{E(p[1])}</span></li>" for p in PASSOS)
levar = ''.join(f"<li><label><input type='checkbox' data-levar='{k}'> <span>{E(t)}</span></label></li>" for k, t in LEVAR)
demora = ''.join(f"<li class='sp-passo'><span class='sp-num' aria-hidden='true'>{i + 1}</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>{E(t)}</h3></div><p>{E(x)}</p></div></li>" for i, (t, x) in enumerate(DEMORA))
faq = ''.join(f"<details class='sp-faq'><summary>{E(q)}</summary><p>{E(r)}</p></details>" for q, r in PERGUNTAS)
fontes = ''.join(arquivo(('SITE', t, u, u.split('/')[2].replace('www.', ''))) for t, u in FONTES)
RET = [('papel', 'Recebi o papel, ainda não fui à UBS'), ('ubs', 'Fui à UBS, o pedido foi feito'), ('espera', 'Estou esperando a data'), ('consulta', 'Já passei pelo especialista'), ('travou', 'Travei: não sei o que fazer')]
ret = ''.join(f"<button type='button' class='cx-op' data-ret='{k}'>{E(t)}</button>" for k, t in RET)

CORPO = f"""<div class='wrap sp-hero'>
<div class='sp-hero-txt'><span class='eyebrow'>DEPOIS DE UMA AÇÃO DO PET · CONSULTA PELO SUS</span><h1>Fui encaminhado. E agora?</h1>
<p class='intro-description'>Recebeu um papel do PET pedindo uma consulta? Aqui está o caminho inteiro até o especialista pelo SUS em Cuiabá: o que levar, onde ir, como acompanhar e o que fazer se demorar.</p>
<ul class='sp-fatos'><li><b>5 etapas</b><span>do papel à consulta</span></li><li><b>Gratuito</b><span>pelo SUS</span></li><li><b>UBS</b><span>é a porta de entrada</span></li><li><b>136</b><span>Ouvidoria do SUS</span></li></ul>
<div class='sp-acoes'><a class='button' href='#etapa-papel'>Começar pelo passo 1 <span aria-hidden='true'>↓</span></a><a class='button secondary' href='#levar'>O que levar <span aria-hidden='true'>↓</span></a></div></div>
<aside class='sp-agora' aria-labelledby='en-caminho-t' data-caminho><span class='eyebrow'>SEU CAMINHO</span><h2 id='en-caminho-t' data-caminho-titulo>Passo 1 · Leia e guarde o papel</h2>
<p class='sp-agora-quando' data-caminho-conta>Nenhuma etapa marcada ainda</p><div class='en-barra' aria-hidden='true'><span data-caminho-barra></span></div>
<p>Marque cada etapa como feita conforme avança. Fica salvo só neste aparelho, para você voltar depois.</p>
<a class='button' href='#etapa-papel' data-caminho-link>Ir para esta etapa <span aria-hidden='true'>↓</span></a>
<ol class='sp-linha' aria-label='Etapas'>{linha}</ol></aside>
</div>
<div class='wrap sp'>
<section class='sp-sec lg-sec' aria-labelledby='en-origem'><h2 id='en-origem'>De onde veio o seu papel</h2><p class='sp-sub'>Hoje o encaminhamento do PET vem do teste de visão nas escolas. Veja o que o resultado quer dizer e conheça o projeto; depois siga o caminho abaixo.</p><ul class='lg-projs'>{projeto('/assets/capas/papel-triagem.svg', 'Ilustração de um papel de triagem com QR code e um sinal de confirmado', 'Depois da ação', 'O que o papel do teste de visão quer dizer', 'Consulta pedida ou tudo bem: o significado de cada resultado, os sinais para observar e o retorno anônimo ao PET.', '/acao/acuidade-visual/', 'Entender o resultado')}{projeto('/assets/capas/acuidade-visual.svg', 'Ilustração do Acuidade Visual: óculos sobre uma lousa, com letras de tabela de leitura nas lentes', 'Projeto do PET · ativo em 2026', 'Acuidade Visual', 'Triagem visual de crianças nas escolas, com encaminhamento ao oftalmologista e óculos quando indicados.', '/projetos/acuidade-visual/', 'Ver o projeto')}</ul></section>
<section class='sp-sec sp-nota en-levar' id='levar' aria-labelledby='en-levar-t'><div><h2 id='en-levar-t'>O que levar</h2><p>Separe antes de sair. Vale para a UBS e para a consulta com o especialista.</p><p class='sp-sub' data-levar-conta>0 de {len(LEVAR)} separados</p></div>
<ul class='en-check'>{levar}</ul></section>
<section class='sp-sec' aria-labelledby='en-passos'><h2 id='en-passos'>Passo a passo</h2><p class='sp-sub'>Do papel do PET à consulta com o especialista. Marque o que já fez.</p><ol class='sp-passos'>{passos}</ol></section>
<section class='sp-sec' aria-labelledby='en-demora'><h2 id='en-demora'>Está demorando ou travou?</h2><p class='sp-sub'>Nessa ordem.</p><ol class='sp-passos'>{demora}</ol>
<div class='sp-acoes'><a class='button' href='tel:136'>Ligar 136 · Disque Saúde <span aria-hidden='true'>↗</span></a><a class='button secondary' href='#' data-lembrete>Lembrete para daqui a 30 dias <span aria-hidden='true'>↓</span></a></div><p class='sp-sub en-lembrete-aviso' data-lembrete-aviso></p></section>
<section class='sp-sec cx-dica en-ret' id='retorno' aria-labelledby='en-ret-t'><div><span class='eyebrow'>CONTE AO PET</span><h2 id='en-ret-t'>Em que etapa você está?</h2><p>É anônimo: não pedimos nome, telefone nem escola. Mostra ao PET se as famílias estão conseguindo a consulta e onde o caminho trava.</p>
<div class='cx-ops en-ops' data-ret-ops>{ret}</div><p class='en-ret-fim' data-ret-fim aria-live='polite'></p></div></section>
<section class='sp-sec' aria-labelledby='en-faq'><h2 id='en-faq'>Perguntas frequentes</h2><div class='sp-faqs'>{faq}</div></section>
<section class='sp-sec' aria-labelledby='en-fontes'><h2 id='en-fontes'>Fontes</h2><p class='sp-sub'>Serviços do Governo de Mato Grosso e do Ministério da Saúde. Conferido em novembro de 2026.</p><ul class='sp-arqs'>{fontes}</ul></section>
<section class='cx-sec cx-dica' aria-labelledby='en-duvida'><div><span class='eyebrow'>FICOU COM DÚVIDA?</span><h2 id='en-duvida'>Pergunte aos estudantes do PET</h2><p>Sua pergunta não é publicada e a resposta chega pelo contato que você deixar.</p></div><a class='button' href='/comunidade/?tipo=duvida'>Tirar uma dúvida <span aria-hidden='true'>→</span></a></section>
<p class='cx-nota'>O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT nem com a Secretaria de Saúde. Este conteúdo orienta o caminho e não substitui a avaliação de um profissional.</p>
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
h = troca(r"<script src='/site.js' defer></script>", "<script src='/site.js' defer></script><script src='/encaminhado.js' defer></script>", h)
h = troca(r"<main id='conteudo'[^>]*>.*?</main>", "<main id='conteudo'>" + CORPO.replace('\n', '') + "</main>", h)
os.makedirs(os.path.join(RAIZ, 'encaminhado'), exist_ok=True)
with open(os.path.join(RAIZ, 'encaminhado', 'index.html'), 'w', encoding='utf-8', newline='') as f:
    f.write(h)
print('gerada /encaminhado/')
