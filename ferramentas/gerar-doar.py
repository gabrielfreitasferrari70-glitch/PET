#!/usr/bin/env python3
"""Gera /doar/ (Seja um doador): doacao de sangue e cadastro de medula em Cuiaba, no mesmo formato de /seja-petiano/.
Regras: Portaria GM/MS 11.685/2026 (em vigor desde 30/09/2026), resumida pelo Ministerio da Saude (Agencia Gov, 12/08/2026),
intervalos do folder do Ministerio da Saude e requisitos de medula do INCA/REDOME. Local e agendamento: MT Hemocentro (SES-MT).
O teste "Posso doar hoje?" roda so no navegador (doar.js), nao envia nem guarda nada.
Rode antes de aplicar-navegacao.py:  python3 ferramentas/gerar-doar.py
"""
import html, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
URL = SITE + '/doar/'
TITULO = 'Seja um doador'
DESC = 'Doar sangue e se cadastrar como doador de medula em Cuiabá: quem pode, teste Posso doar hoje?, passo a passo, onde doar e as regras novas de 2026.'
E = html.escape

AGENDAR = 'https://portal.mt.gov.br/app/catalog/secretaria-de-estado-de-saude/agendar-doacao-de-sangue'
REDOME = 'https://redome.inca.gov.br/'
MAPA = 'https://www.google.com/maps/search/?api=1&query=MT+Hemocentro+Rua+13+de+Junho+1055+Cuiab%C3%A1'

FATOS = [('16 a 69', 'anos para doar sangue'), ('50 kg', 'ou mais'), ('450 ml', 'por doação'), ('Até 4', 'vidas por doação')]

REQUISITOS = [
    'Ter de 16 a 69 anos. De 16 a 17 anos, com autorização do responsável. A primeira doação precisa ser antes dos 60 anos.',
    'Pesar 50 kg ou mais e estar bem de saúde no dia.',
    'Estar descansado (pelo menos 6 horas de sono) e alimentado. Não doe em jejum; evite comida gordurosa nas 3 horas antes.',
    'Levar documento oficial com foto. O documento digital também vale.',
    'Respeitar o intervalo: homens a cada 60 dias (até 4 vezes em 12 meses), mulheres a cada 90 dias (até 3 vezes).',
    'Quem já doa com frequência pode continuar depois dos 70 anos, com avaliação médica no hemocentro (regra nova de 2026).',
]

# Passo a passo da doacao de sangue
PASSOS = [
    ('Agende', 'Antes de ir', 'Pelo sistema de agendamento do Governo de Mato Grosso: nome, CPF, RG e e-mail, depois o dia e o horário. A confirmação chega por e-mail com uma senha, que serve para cancelar.',
     [], [('SITE', 'Agendar a doação no MT Hemocentro', AGENDAR, 'portal.mt.gov.br · Governo de MT')]),
    ('Prepare-se', 'Na véspera e no dia', 'Durma bem, coma normalmente e beba água. Leve o documento com foto.',
     ['Não vá em jejum', 'Nada de comida gordurosa nas 3 horas antes', 'Nada de bebida alcoólica nas 12 horas antes', 'Não fume nas 2 horas antes'], []),
    ('Cadastro e triagem', 'No hemocentro', 'Você faz um cadastro rápido. Depois, um profissional de saúde mede a pressão, faz um teste rápido de anemia e uma entrevista reservada sobre a sua saúde. Responda com sinceridade: é isso que protege você e quem vai receber o sangue.',
     [], []),
    ('A doação', 'Rápida e segura', 'São coletados até 450 ml, com material descartável, usado uma vez só. O processo todo, do cadastro ao lanche, leva em torno de 40 minutos.',
     [], []),
    ('Depois de doar', 'No resto do dia', 'Você recebe um lanche e um atestado de doação, que justifica a ausência no trabalho ou na aula. Quem não pôde doar recebe um comprovante de comparecimento.',
     ['Beba bastante líquido', 'Mantenha o curativo por 4 horas', 'Não carregue peso com o braço da coleta', 'Sem exercício intenso por 24 horas e sem álcool por 12 horas'], []),
]

# Regras novas de 2026 (Portaria GM/MS 11.685/2026)
NOVAS = [
    ('Tatuagem, maquiagem definitiva e procedimentos estéticos', '7 dias, se feitos em local que segue as normas de segurança. Se não der para confirmar, 4 meses.', 'Antes: 6 a 12 meses'),
    ('Piercing na boca ou na região genital', '4 meses depois da retirada.', 'Antes: impedia por mais tempo'),
    ('Endoscopia ou colonoscopia', '4 meses.', 'Antes: 6 meses'),
    ('Viagem para área de malária ou mata', '30 dias.', 'Antes: até 12 meses'),
    ('Doadores com 70 anos ou mais', 'Podem continuar doando se já doam com frequência e passam na avaliação médica.', 'Antes: limite de 69 anos'),
]

MEDULA_REQ = ['Ter de 18 a 35 anos para se cadastrar. Quem se cadastra fica no registro até os 60 anos.', 'Estar bem de saúde, sem doença infecciosa transmissível pelo sangue.', 'Levar documento oficial com foto.']
MEDULA_PASSOS = [
    ('Cadastro', 'No hemocentro, você preenche uma ficha e tira uma pequena amostra de sangue. Ela serve para descobrir o seu tipo de HLA, que vai para o REDOME, o registro nacional de doadores.'),
    ('Mantenha os dados em dia', 'Se mudar de telefone ou de endereço, atualize no site ou no aplicativo do REDOME. Muita gente compatível nunca é encontrada por estar com o contato desatualizado.'),
    ('Se for compatível', 'O REDOME entra em contato, repete os exames e explica tudo. A doação pode ser pela veia do braço (aférese) ou por punção no osso da bacia, com anestesia. A medula do doador se recompõe em cerca de 15 dias.'),
]

PERGUNTAS = [
    ('Doar sangue dói?', 'Só a picada da agulha, como num exame de sangue. Uma equipe de saúde acompanha a coleta o tempo todo.'),
    ('Doar sangue engorda, emagrece ou afina o sangue?', 'Não. O corpo repõe o volume doado sozinho, e doar não muda o peso nem cria dependência: ninguém fica obrigado a doar sempre.'),
    ('Tenho tatuagem. Posso doar?', 'Sim. Com as regras de 2026, a espera é de 7 dias se a tatuagem foi feita em estúdio regularizado, e de 4 meses quando não dá para confirmar. Tatuagens antigas não impedem.'),
    ('Tomo remédio todo dia. Posso doar?', 'Depende do remédio. Remédios comuns de pressão, por exemplo, em geral não impedem. Leve o nome do remédio: a triagem decide na hora.'),
    ('Preciso faltar ao trabalho ou à aula?', 'O hemocentro entrega um atestado de doação para justificar a ausência. Agendando, você escolhe o horário que for melhor.'),
    ('Por que perguntam sobre a minha vida pessoal?', 'Algumas infecções recentes ainda não aparecem nos exames. A entrevista é reservada e serve para proteger quem vai receber o sangue.'),
    ('Fui considerado inapto. E agora?', 'Muitas vezes o impedimento é temporário. O hemocentro informa quando você pode voltar e entrega um comprovante de comparecimento.'),
]

FONTES = [
    ('Ministério da Saúde · Novas regras para doação de sangue (Agência Gov, 12/08/2026)', 'https://agenciagov.ebc.com.br/noticias/202608/com-novas-regras-pessoas-com-mais-de-70-anos-poderao-continuar-a-doar-sangue'),
    ('Ministério da Saúde · Folder da campanha de doação de sangue', 'https://www.gov.br/saude/pt-br/campanhas-da-saude/2024/doacao-de-sangue/acesse-as-pecas/folder-campanha-de-doacao-de-sangue-31-7x23cm.pdf'),
    ('Governo de Mato Grosso · Agendar doação de sangue', AGENDAR),
    ('INCA · Idade para cadastro de doadores de medula', 'https://www.gov.br/inca/pt-br/assuntos/noticias/2021/ministerio-da-saude-altera-idade-limite-para-cadastro-de-doadores-de-medula'),
    ('INCA · Folder doação de medula óssea (2024)', 'https://ninho.inca.gov.br/jspui/bitstream/123456789/16933/1/inca_medula_folder_2024.pdf'),
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
    return (f"<li><a class='sp-arq' href='{E(url)}'{alvo}><span class='sp-tipo sp-tipo-{tipo.lower()}'>{tipo}</span>"
            f"<span class='sp-arq-txt'><strong>{E(titulo)}</strong><small>{E(det)}</small></span><span class='sp-arq-seta' aria-hidden='true'>{seta(url)}</span></a></li>")


def passo(n, p):
    titulo, quando, texto, itens, arqs = p
    li = ''.join(f'<li>{E(i)}</li>' for i in itens)
    li = f"<ul class='cx-lista'>{li}</ul>" if li else ''
    ar = f"<ul class='sp-arqs'>{''.join(arquivo(a) for a in arqs)}</ul>" if arqs else ''
    return (f"<li class='sp-passo'><span class='sp-num' aria-hidden='true'>{n}</span><div class='sp-passo-corpo'>"
            f"<div class='sp-passo-topo'><h3>{E(titulo)}</h3></div><p class='sp-quando'>{E(quando)}</p><p>{E(texto)}</p>{li}{ar}</div></li>")


SIM_NAO = lambda nome: (f"<span class='dr-op'><label><input type='radio' name='{nome}' value='nao' checked> Não</label>"
                        f"<label><input type='radio' name='{nome}' value='sim'> Sim</label></span>")

TESTE = f"""<form class='sp-calc dr-teste' data-doar novalidate>
<div class='sp-calc-topo'><h3>Posso doar hoje?</h3><p>Responda e veja se pode doar ou a partir de quando. Nada é enviado ou guardado.</p></div>
<div class='dr-campos'>
<label class='dr-campo'><span>Sua idade</span><input type='number' inputmode='numeric' min='0' max='120' name='idade' placeholder='anos'></label>
<label class='dr-campo'><span>Seu peso</span><input type='number' inputmode='decimal' min='0' max='300' name='peso' placeholder='kg'></label>
<fieldset class='dr-campo'><legend>Para o intervalo entre doações</legend><span class='dr-op'><label><input type='radio' name='sexo' value='m' checked> Homem</label><label><input type='radio' name='sexo' value='f'> Mulher</label></span></fieldset>
<label class='dr-campo'><span>Última doação de sangue <small>(deixe vazio se nunca doou)</small></span><input type='date' name='ultima'></label>
</div>
<div class='dr-perguntas'>
<fieldset class='dr-q'><legend>Está com gripe, resfriado ou febre, ou tomando antibiótico?</legend>{SIM_NAO('gripe')}</fieldset>
<fieldset class='dr-q'><legend>Está grávida, teve bebê há menos de um ano ou está amamentando?</legend>{SIM_NAO('gravidez')}</fieldset>
<fieldset class='dr-q'><legend>Fez tatuagem, maquiagem definitiva ou procedimento estético (botox, preenchimento) nos últimos 4 meses?</legend>{SIM_NAO('tatuagem')}
<div class='dr-extra' data-se='tatuagem' hidden><label class='dr-campo'><span>Data do procedimento</span><input type='date' name='tatuagem_data'></label>
<fieldset><legend>Foi em local regularizado, com alvará sanitário?</legend><span class='dr-op'><label><input type='radio' name='tatuagem_local' value='sim' checked> Sim</label><label><input type='radio' name='tatuagem_local' value='nao'> Não sei</label></span></fieldset></div></fieldset>
<fieldset class='dr-q'><legend>Tirou piercing da boca ou da região genital nos últimos 4 meses, ou ainda usa?</legend>{SIM_NAO('piercing')}
<div class='dr-extra' data-se='piercing' hidden><label class='dr-campo'><span>Data da retirada <small>(vazio se ainda usa)</small></span><input type='date' name='piercing_data'></label></div></fieldset>
<fieldset class='dr-q'><legend>Fez endoscopia ou colonoscopia nos últimos 4 meses?</legend>{SIM_NAO('endoscopia')}
<div class='dr-extra' data-se='endoscopia' hidden><label class='dr-campo'><span>Data do exame</span><input type='date' name='endoscopia_data'></label></div></fieldset>
<fieldset class='dr-q'><legend>Viajou para área de malária ou ficou em mata nos últimos 30 dias?</legend>{SIM_NAO('malaria')}
<div class='dr-extra' data-se='malaria' hidden><label class='dr-campo'><span>Data da volta</span><input type='date' name='malaria_data'></label></div></fieldset>
<fieldset class='dr-q'><legend>Bebeu álcool nas últimas 12 horas ou dormiu menos de 6 horas?</legend>{SIM_NAO('hoje')}</fieldset>
</div>
<button type='submit' class='button'>Ver resultado <span aria-hidden='true'>→</span></button>
<div class='dr-res' data-doar-res aria-live='polite' hidden><p class='dr-res-titulo' data-doar-titulo></p><ul class='cx-lista' data-doar-lista></ul>
<p class='dr-res-nota'>Este teste não substitui a triagem. Quem decide se você pode doar é o profissional do hemocentro, que também avalia remédios, cirurgias, vacinas e outras situações.</p></div>
</form>"""

fatos = ''.join(f"<li><b>{E(a)}</b><span>{E(b)}</span></li>" for a, b in FATOS)
req = ''.join(f'<li>{E(r)}</li>' for r in REQUISITOS)
passos = ''.join(passo(i + 1, p) for i, p in enumerate(PASSOS))
novas = ''.join(f"<li><strong>{E(a)}</strong><span>{E(b)}</span><small>{E(c)}</small></li>" for a, b, c in NOVAS)
mreq = ''.join(f'<li>{E(r)}</li>' for r in MEDULA_REQ)
mpassos = ''.join(f"<li class='sp-passo'><span class='sp-num' aria-hidden='true'>{i + 1}</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>{E(t)}</h3></div><p>{E(x)}</p></div></li>" for i, (t, x) in enumerate(MEDULA_PASSOS))
faq = ''.join(f"<details class='sp-faq'><summary>{E(q)}</summary><p>{E(r)}</p></details>" for q, r in PERGUNTAS)
fontes = ''.join(arquivo(('SITE', t, u, u.split('/')[2].replace('www.', ''))) for t, u in FONTES)

CORPO = f"""<div class='wrap sp-hero'>
<div class='sp-hero-txt'><span class='eyebrow'>DOAÇÃO DE SANGUE E MEDULA · CUIABÁ</span><h1>Seja um doador.</h1>
<p class='intro-description'>Uma doação de sangue pode ajudar até quatro pessoas. Veja se você pode doar hoje, como é cada etapa e onde doar em Cuiabá, com as regras novas que valem desde 30 de setembro de 2026.</p>
<ul class='sp-fatos'>{fatos}</ul>
<div class='sp-acoes'><a class='button' href='#teste'>Posso doar hoje? <span aria-hidden='true'>↓</span></a><a class='button secondary' href='{AGENDAR}' target='_blank' rel='noopener noreferrer'>Agendar a doação <span aria-hidden='true'>↗</span></a></div></div>
<aside class='sp-agora' aria-labelledby='dr-onde'><span class='eyebrow'>ONDE DOAR EM CUIABÁ</span><h2 id='dr-onde'>MT Hemocentro</h2>
<p class='sp-agora-quando'>Rua 13 de Junho, 1055 · Centro Sul</p><p>Único banco de sangue público de Mato Grosso. Coleta de segunda a sexta, a partir das 7h30, sem fechar no almoço. Confirme o horário ao agendar.</p>
<div class='dr-onde-acoes'><a class='button' href='{AGENDAR}' target='_blank' rel='noopener noreferrer'>Agendar <span aria-hidden='true'>↗</span></a><a class='button secondary' href='{MAPA}' target='_blank' rel='noopener noreferrer'>Ver no mapa <span aria-hidden='true'>↗</span></a></div>
<p class='dr-tel'>Telefone: <a class='text-link' href='tel:+556536230044'>(65) 3623-0044</a></p></aside>
</div>
<div class='wrap sp'>
<section class='sp-sec' aria-labelledby='dr-req'><h2 id='dr-req'>Quem pode doar sangue</h2><ul class='sp-req'>{req}</ul></section>
<section class='sp-sec lg-sec' aria-labelledby='dr-pet'><h2 id='dr-pet'>Os projetos do PET sobre doação</h2><p class='sp-sub'>Esta página é a parte prática. Nos projetos você vê como o PET leva essa causa adiante, com os resultados de cada edição.</p><ul class='lg-projs'>{projeto('/assets/capas/trote-solidario.svg', 'Ilustração do Trote Solidário: gota de sangue com uma cruz, entre corações', 'Projeto do PET · ativo em 2026', 'Trote Solidário', 'Campanha de doação de sangue e cadastro de medula com o MT Hemocentro. A 6ª edição somou 87 bolsas de sangue e 20 novos cadastros de medula.', '/projetos/trote-solidario/', 'Ver o projeto')}{projeto('/assets/capas/cadastro-do-bem.svg', 'Ilustração do Cadastro do Bem: mão segurando uma gota com a fita do DNA', 'Projeto do PET · registro de 2024', 'Cadastro do Bem', 'Conversa sobre doação de medula em escolas e cursinhos, com mitos e dúvidas. Em 2024, foram 41 ações e 1.880 pessoas alcançadas.', '/projetos/cadastro-do-bem/', 'Ver o projeto')}</ul><p class='lg-mais'>Quando o PET anunciar uma nova coleta, ela aparece na <a class='text-link' href='/agenda/'>agenda →</a></p></section>
<section class='sp-sec sp-nota dr-teste-sec' id='teste' aria-labelledby='dr-teste-t'><div><h2 id='dr-teste-t'>Teste antes de sair de casa</h2><p>Em um minuto você descobre se algo impede a doação hoje e, se impedir, a partir de que dia pode doar.</p></div>
<ul class='dr-novas-mini'><li>Considera as regras novas de 2026</li><li>Calcula a data em que você pode voltar</li><li>Funciona sem internet depois de aberto</li></ul>{TESTE}</section>
<section class='sp-sec' aria-labelledby='dr-passos'><h2 id='dr-passos'>Passo a passo da doação</h2><p class='sp-sub'>Do agendamento ao lanche, sem surpresa.</p><ol class='sp-passos'>{passos}</ol></section>
<section class='sp-sec' aria-labelledby='dr-novas'><h2 id='dr-novas'>O que mudou em 2026</h2><p class='sp-sub'>A Portaria GM/MS 11.685/2026 entrou em vigor em 30 de setembro e encurtou várias esperas. Se você foi recusado antes, pode ser que já possa doar.</p><ul class='dr-novas'>{novas}</ul></section>
<section class='sp-sec' id='medula' aria-labelledby='dr-medula'><h2 id='dr-medula'>Doador de medula óssea</h2><p class='sp-sub'>Para muitas pessoas com leucemia e outras doenças do sangue, o transplante de medula é o tratamento. A chance de achar alguém compatível fora da família é pequena, por isso cada cadastro conta.</p>
<div class='dr-medula'><div><h3>Quem pode se cadastrar</h3><ul class='cx-lista'>{mreq}</ul><ul class='sp-arqs'>{arquivo(('SITE', 'Atualizar o cadastro no REDOME', REDOME, 'redome.inca.gov.br · INCA'))}</ul></div><ol class='sp-passos'>{mpassos}</ol></div></section>

<section class='sp-sec' aria-labelledby='dr-faq'><h2 id='dr-faq'>Perguntas frequentes</h2><div class='sp-faqs'>{faq}</div></section>
<section class='sp-sec' aria-labelledby='dr-fontes'><h2 id='dr-fontes'>Fontes</h2><p class='sp-sub'>Regras do Ministério da Saúde e do INCA; local e agendamento do Governo de Mato Grosso. Conferido em novembro de 2026.</p><ul class='sp-arqs'>{fontes}</ul></section>
<section class='cx-sec cx-dica' aria-labelledby='dr-duvida'><div><span class='eyebrow'>FICOU COM DÚVIDA?</span><h2 id='dr-duvida'>Pergunte aos estudantes do PET</h2><p>Sua pergunta não é publicada e a resposta chega pelo contato que você deixar. Para casos de saúde específicos, a palavra final é da triagem do hemocentro.</p></div><a class='button' href='/comunidade/?tipo=duvida'>Tirar uma dúvida <span aria-hidden='true'>→</span></a></section>
<p class='cx-nota'>O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT nem com o MT Hemocentro. As regras podem mudar: na dúvida, vale a orientação do hemocentro.</p>
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
h = troca(r"<script src='/site.js' defer></script>", "<script src='/site.js' defer></script><script src='/doar.js' defer></script>", h)
h = troca(r"<main id='conteudo'[^>]*>.*?</main>", "<main id='conteudo'>" + CORPO.replace('\n', '') + "</main>", h)
os.makedirs(os.path.join(RAIZ, 'doar'), exist_ok=True)
with open(os.path.join(RAIZ, 'doar', 'index.html'), 'w', encoding='utf-8', newline='') as f:
    f.write(h)
print('gerada /doar/')
