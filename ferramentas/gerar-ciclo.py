#!/usr/bin/env python3
"""Gera as paginas do ciclo de alcance e as paginas das secoes a partir de comunidade/index.html:
   /atendimento/  /leve-o-pet/  /acao/acuidade-visual/  /voce-perguntou/  /alcance/
   /imprimir/ (papel e cartaz com QR code)
Edite os textos aqui e rode:  python3 ferramentas/gerar-ciclo.py
Precisa do pacote qrcode:  pip install qrcode
"""
import os, re
import qrcode, qrcode.image.svg

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://pet-conecta.vercel.app'
SETA = "<span aria-hidden='true'>→</span>"


def qr(url, rotulo):
    """QR code em SVG, desenhado no HTML (sem script nem imagem externa), fundo branco nos tres temas."""
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=2,
                      error_correction=qrcode.constants.ERROR_CORRECT_M)
    texto = img.to_string(encoding='unicode')
    caixa = re.search(r'viewBox="0 0 (\d+) \d+"', texto).group(1)
    d = re.search(r' d="([^"]+)"', texto).group(1)
    return (f"<svg class='cx-qr' viewBox='0 0 {caixa} {caixa}' role='img' aria-label='QR code: {rotulo}'>"
            f"<rect width='{caixa}' height='{caixa}' fill='white'/><path fill='black' d='{d}'/></svg>")


URL_PAPEL = SITE + '/acao/acuidade-visual/?c=papel-visao'
URL_CARTAZ = SITE + '/?c=cartaz'

ATENDIMENTO = f"""<div class='wrap page-intro'><span class='eyebrow'>ATENDIMENTO</span><h1>Participe de uma ação, tire uma dúvida ou chame o PET.</h1><p class='intro-description'>Tudo o que a comunidade pode buscar junto aos estudantes de Medicina da UFMT. É gratuito.</p></div>
<div class='wrap cx'>
<section class='ap-guia' aria-labelledby='at-t'><h2 id='at-t'>O que você precisa?</h2><div class='ap-guia-grid'>
<a href='/agenda/'><strong>Ver as próximas ações</strong><span>Datas e locais das ações abertas à comunidade.</span></a>
<a href='/projetos/trote-solidario/'><strong>Doar sangue ou medula</strong><span>Campanha com o MT Hemocentro: quem pode doar e quando.</span></a>
<a href='/acao/acuidade-visual/'><strong>Meu filho fez o teste de visão</strong><span>O que o papel quer dizer e o que fazer agora.</span></a>
<a href='/comunidade/?tipo=duvida'><strong>Tirar uma dúvida de saúde</strong><span>A pergunta não é publicada e a resposta chega pelo seu contato.</span></a>
<a href='/leve-o-pet/'><strong>Levar o PET até você</strong><span>Escolas, unidades de saúde e grupos de bairro pedem uma ação.</span></a>
<a href='/qr/'><strong>Veio por um QR code ou link?</strong><span>O que cada papel, cartaz ou link do PET traz.</span></a>
<a href='/encaminhado/'><strong>Fui encaminhado, e agora?</strong><span>O caminho do papel do PET até a consulta pelo SUS.</span></a>
<a href='/doar/'><strong>Doar sangue ou medula</strong><span>Veja se pode doar hoje e como agendar no MT Hemocentro.</span></a>
</div></section>
<section class='cx-sec cx-dica' aria-labelledby='pv-papel'><div><span class='eyebrow'>DEPOIS DE UMA AÇÃO</span><h2 id='pv-papel'>Veio por um QR code ou link?</h2><p>Veja o que cada papel, cartaz ou link do PET traz, como ler o QR code com o celular e o que fazer se ele não abrir.</p></div><a class='button secondary' href='/qr/'>Entender o QR code <span aria-hidden='true'>→</span></a></section>
<section class='cx-sec' aria-labelledby='pv-ciclo'><h2 id='pv-ciclo'>Como o PET chega até você</h2><p>Cada ação tem um antes, um durante e um depois. O site liga os três.</p><ol class='cx-ciclo'>
<li><b>Antes</b><strong>A comunidade chama</strong><span>Escolas, unidades de saúde e grupos de bairro pedem uma ação. Qualquer pessoa vota nos temas.</span><a class='text-link' href='/leve-o-pet/'>Pedir uma ação →</a></li>
<li><b>Durante</b><strong>A ação tem a sua página</strong><span>O papel entregue no dia traz um QR code. A orientação continua disponível em casa.</span><a class='text-link' href='/acao/acuidade-visual/'>Ver um exemplo →</a></li>
<li><b>Depois</b><strong>O PET volta para contar</strong><span>As famílias dizem, sem se identificar, se conseguiram o atendimento. O PET publica o que respondeu e onde esteve.</span><a class='text-link' href='/alcance/'>Onde o PET já esteve →</a></li>
</ol></section>
<p class='cx-nota'>Quem somos: estudantes de Medicina da UFMT, em Cuiabá. <a class='text-link' href='/o-pet/'>Conhecer o PET →</a> O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT.</p>
</div>"""

LEVE = f"""<div class='wrap sp-hero'>
<div class='sp-hero-txt'><span class='eyebrow'>LEVE O PET ATÉ VOCÊ · ESCOLAS, UNIDADES E BAIRROS</span><h1>Leve o PET até você.</h1>
<p class='intro-description'>Escolas, unidades de saúde, associações e lideranças de bairro podem pedir uma ação de saúde do PET. Veja o que o PET leva, como funciona do pedido ao dia da ação e faça o pedido em três minutos.</p>
<ul class='sp-fatos'><li><b>5 ações</b><span>que o PET já realizou</span></li><li><b>3 min</b><span>para fazer o pedido</span></li><li><b>Gratuito</b><span>para a comunidade</span></li><li><b>Privado</b><span>o pedido não é publicado</span></li></ul>
<div class='sp-acoes'><a class='button' href='#pedido'>Fazer o pedido <span aria-hidden='true'>↓</span></a><a class='button secondary' href='#catalogo'>Ver o que o PET leva <span aria-hidden='true'>↓</span></a></div></div>
<aside class='sp-agora' aria-labelledby='lv-como-t'><span class='eyebrow'>COMO FUNCIONA</span><h2 id='lv-como-t'>Do pedido à ação</h2><p class='sp-agora-quando'>A resposta chega pelo seu contato</p><p>O PET avalia cada pedido conforme a agenda e a equipe. Depois da ação, os resultados gerais aparecem no site, sem nomes.</p>
<a class='button' href='#pedido'>Fazer o pedido <span aria-hidden='true'>↓</span></a><ol class='sp-linha' aria-label='Etapas'><li><span>Escolha a ação</span></li><li><span>Faça o pedido</span></li><li><span>O PET avalia</span></li><li><span>Combinem os detalhes</span></li><li><span>O dia da ação</span></li><li><span>Depois</span></li></ol></aside>
</div>
<div class='wrap sp'>
<section class='sp-sec' id='catalogo' aria-labelledby='lv-cat-t'><h2 id='lv-cat-t'>O que o PET pode levar</h2><p class='sp-sub'>Ações que o PET já realizou, com o projeto de cada uma. Escolha uma e o pedido já vem preenchido.</p><ul class='lv-cat'><li class='lv-item'><div class='lv-topo'><span class='lv-status lv-ativo'>Ativo em 2026</span><span class='lv-pub'>Escolas · crianças</span></div><h3>Teste de visão para crianças</h3><p>Triagem visual das crianças na escola. Quem precisa recebe um papel de encaminhamento para o oftalmologista, e o projeto disponibiliza óculos quando indicados.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Teste de visão para crianças'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/projetos/acuidade-visual/'>Acuidade Visual →</a></div></li><li class='lv-item'><div class='lv-topo'><span class='lv-status lv-ativo'>Ativo em 2026</span><span class='lv-pub'>Jovens e adultos</span></div><h3>Doação de sangue e cadastro de medula</h3><p>Conversa sobre doação de sangue e de medula, com mitos e dúvidas, e mobilização para coletas com o MT Hemocentro.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Doação de sangue e cadastro de medula'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/doar/'>Trote Solidário e Cadastro do Bem →</a></div></li><li class='lv-item'><div class='lv-topo'><span class='lv-status'>Último registro: 2023</span><span class='lv-pub'>Escolas · adolescentes</span></div><h3>Saúde menstrual</h3><p>Ação educativa sobre saúde menstrual. O PET avalia se consegue retomar o tema na época do pedido.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Saúde menstrual'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/projetos/menstruacao/'>MenstruAção →</a></div></li><li class='lv-item'><div class='lv-topo'><span class='lv-status'>Último registro: 2023</span><span class='lv-pub'>Escolas · adolescentes</span></div><h3>Puberdade e prevenção para adolescentes</h3><p>Conversa sobre corpo, prevenção e comportamentos de risco. O PET avalia se consegue retomar o tema na época do pedido.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Puberdade e prevenção para adolescentes'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/projetos/papo-cabeca/'>Papo Cabeça →</a></div></li><li class='lv-item'><div class='lv-topo'><span class='lv-status lv-ativo'>Em andamento em 2026</span><span class='lv-pub'>Centros de convivência · pessoas idosas</span></div><h3>Sexualidade e prevenção para pessoas idosas</h3><p>Palestras sobre sexualidade e prevenção de infecções sexualmente transmissíveis para pessoas idosas.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Sexualidade e prevenção para pessoas idosas'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/projetos/saude-sexual/'>Saúde Sexual →</a></div></li><li class='lv-item'><div class='lv-topo'><span class='lv-status'>Sob avaliação</span><span class='lv-pub'>Qualquer público</span></div><h3>Outro tema de saúde</h3><p>Tem uma necessidade que não está na lista? Descreva no pedido: o PET avalia se tem como atender.</p><div class='lv-acoes'><button type='button' class='button' data-pedir='Outro tema de saúde'>Pedir esta ação <span aria-hidden='true'>↓</span></button><a class='text-link' href='/projetos/'>A combinar →</a></div></li></ul></section>
<section class='sp-sec' aria-labelledby='lv-passos-t'><h2 id='lv-passos-t'>Passo a passo</h2><p class='sp-sub'>O que acontece depois que você pede.</p><ol class='sp-passos'><li class='sp-passo'><span class='sp-num' aria-hidden='true'>1</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>Escolha a ação</h3></div><p>Acima, na lista do que o PET leva. Se não encontrar, peça "outro tema".</p></div></li><li class='sp-passo'><span class='sp-num' aria-hidden='true'>2</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>Faça o pedido</h3></div><p>Leva uns três minutos. O pedido chega ao responsável e não é publicado.</p></div></li><li class='sp-passo'><span class='sp-num' aria-hidden='true'>3</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>O PET avalia</h3></div><p>A ação depende da agenda e da equipe do PET. A resposta chega pelo telefone ou e-mail que você informar.</p></div></li><li class='sp-passo'><span class='sp-num' aria-hidden='true'>4</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>Combinem os detalhes</h3></div><p>Data, horário, espaço, número de pessoas e o que mais for preciso para aquele tipo de ação.</p></div></li><li class='sp-passo'><span class='sp-num' aria-hidden='true'>5</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>O dia da ação</h3></div><p>Os estudantes do PET vão até o local. Quando há encaminhamento, cada família recebe um papel explicando o próximo passo.</p></div></li><li class='sp-passo'><span class='sp-num' aria-hidden='true'>6</span><div class='sp-passo-corpo'><div class='sp-passo-topo'><h3>Depois</h3></div><p>As famílias encontram o caminho até a consulta no site, e os resultados gerais, sem nomes, aparecem em Onde o PET já esteve.</p></div></li></ol></section>
<section class='sp-sec sp-nota en-levar' aria-labelledby='lv-prep-t'><div><h2 id='lv-prep-t'>Para preparar o pedido</h2><p>Não é obrigatório ter tudo, mas ajuda o PET a avaliar e a combinar a ação mais rápido.</p></div><ul class='en-check'><li><label><input type='checkbox'> <span>Um espaço para a ação (sala, pátio ou auditório)</span></label></li><li><label><input type='checkbox'> <span>Uma pessoa da instituição que acompanhe no dia</span></label></li><li><label><input type='checkbox'> <span>Uma ideia de quantas pessoas vão participar</span></label></li><li><label><input type='checkbox'> <span>Dois ou três períodos possíveis</span></label></li><li><label><input type='checkbox'> <span>Se for com crianças ou adolescentes, a escola avisa as famílias como de costume</span></label></li></ul></section>
<section class='sp-sec' id='pedido' aria-labelledby='lp-t'><h2 id='lp-t'>Fazer o pedido</h2><p class='cx-aviso'>O pedido não garante a ação: ela depende da agenda e da equipe do PET. Não escreva dados de saúde de pessoas identificáveis.</p>
<div class='com-form cx-form' role='group' aria-labelledby='lp-t'>
<div class='fale-duplo'><label for='lp-tipo'>Tipo de instituição<select id='lp-tipo'><option>Escola</option><option>Unidade de saúde</option><option>Associação ou grupo de bairro</option><option>Igreja ou entidade</option><option>Outro</option></select></label><label for='lp-inst'>Nome da instituição<input class='com-busca' id='lp-inst' type='text' maxlength='120' autocomplete='organization' required></label></div>
<label for='lp-bairro'>Bairro e cidade<input class='com-busca' id='lp-bairro' type='text' maxlength='120' placeholder='Ex.: CPA III, Cuiabá' required></label>
<label for='lp-acao'>Ação desejada<select id='lp-acao'><option>Teste de visão para crianças</option><option>Doação de sangue e cadastro de medula</option><option>Saúde menstrual</option><option>Puberdade e prevenção para adolescentes</option><option>Sexualidade e prevenção para pessoas idosas</option><option>Outro tema de saúde</option></select></label>
<fieldset><legend>Público</legend><div class='int-chips'><label><input type='checkbox' name='lp-publico' value='crianças'> Crianças</label><label><input type='checkbox' name='lp-publico' value='adolescentes'> Adolescentes</label><label><input type='checkbox' name='lp-publico' value='adultos'> Adultos</label><label><input type='checkbox' name='lp-publico' value='pessoas idosas'> Pessoas idosas</label></div></fieldset>
<div class='fale-duplo'><label for='lp-qtd'>Quantas pessoas, mais ou menos (opcional)<input class='com-busca' id='lp-qtd' type='number' inputmode='numeric' min='1' max='5000'></label><label for='lp-quando'>Melhor período (opcional)<input class='com-busca' id='lp-quando' type='text' maxlength='120' placeholder='Ex.: março, pela manhã'></label></div>
<div class='fale-duplo'><label for='lp-nome'>Seu nome e função<input class='com-busca' id='lp-nome' type='text' maxlength='110' autocomplete='name' placeholder='Ex.: Maria, coordenadora' required></label><label for='lp-contato'>Telefone ou e-mail para retorno<input class='com-busca' id='lp-contato' type='text' maxlength='96' required></label></div>
<label for='lp-obs'>Algo mais que o PET deve saber (opcional)<textarea id='lp-obs' maxlength='600' placeholder='Ex.: temos uma sala disponível às terças'></textarea></label>
<div class='hp' aria-hidden='true'><label>Não preencha<input id='lp-hp' type='text' tabindex='-1' autocomplete='off'></label></div>
<button type='button' class='button' id='lp-enviar'>Enviar o pedido {SETA}</button>
<p class='com-msg' id='lp-msg' role='status'></p><pre class='cx-previa' id='lp-previa' hidden></pre>
</div>
<p class='cx-nota'><a class='text-link' href='/privacidade/#comunidade'>Como tratamos os envios →</a></p></section>
<section class='sp-sec ap-guia dr-pet' aria-labelledby='lv-onde-t'><h2 id='lv-onde-t'>Onde o PET já esteve</h2><div class='ap-guia-grid'><a href='/alcance/'><strong>Locais e resultados</strong><span>Escolas, unidades e espaços onde o PET já fez ações, com os resultados publicados.</span></a><a href='/encaminhado/'><strong>Depois da ação</strong><span>O caminho que as famílias encaminhadas seguem até a consulta pelo SUS.</span></a><a href='/projetos/'><strong>Todos os projetos</strong><span>O que cada projeto do PET faz, para quem e desde quando.</span></a></div></section>
<section class='sp-sec' aria-labelledby='lv-faq-t'><h2 id='lv-faq-t'>Perguntas frequentes</h2><div class='sp-faqs'><details class='sp-faq'><summary>Quem pode pedir?</summary><p>Quem responde por um grupo de pessoas: direção ou coordenação de escola, equipe de unidade de saúde, associação, liderança de bairro, igreja ou entidade.</p></details><details class='sp-faq'><summary>O pedido garante a ação?</summary><p>Não. O PET avalia cada pedido conforme a agenda e a equipe disponível, e responde pelo contato informado.</p></details><details class='sp-faq'><summary>Com quanta antecedência devo pedir?</summary><p>Quanto antes, melhor: assim dá tempo de combinar data, espaço e equipe com calma.</p></details><details class='sp-faq'><summary>As ações têm custo?</summary><p>As ações de extensão do PET são gratuitas para a comunidade atendida.</p></details><details class='sp-faq'><summary>Posso pedir para fora de Cuiabá?</summary><p>Pode pedir. As ações registradas até agora aconteceram em Cuiabá; o PET avalia a viabilidade de cada local.</p></details><details class='sp-faq'><summary>O que acontece com os dados do pedido?</summary><p>O pedido chega só ao responsável e por e-mail, não é publicado e não deve trazer dados de saúde de pessoas identificáveis.</p></details></div></section>
<p class='cx-nota'>O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT.</p>
</div>"""

ACAO = f"""<div class='wrap page-intro'><span class='eyebrow'>DEPOIS DA AÇÃO · ACUIDADE VISUAL</span><h1>Seu filho fez o teste de visão na escola. E agora?</h1><p class='intro-description'>O teste feito pelo PET é uma triagem: ele mostra quem precisa de uma consulta completa. Não é um diagnóstico. Escolha abaixo o que o papel que você recebeu diz.</p></div>
<div class='wrap cx'>
<div class='fale-tipos' role='group' aria-label='O que o papel diz'><button type='button' class='fale-tipo' data-papel='consulta' aria-pressed='true'><strong>O papel pede consulta</strong><span>A criança foi encaminhada ao oftalmologista.</span></button><button type='button' class='fale-tipo' data-papel='bem' aria-pressed='false'><strong>O papel diz que está tudo bem</strong><span>O teste não apontou alteração.</span></button></div>
<div data-painel='consulta'>
<div class='cx-painel'><h3>O que isso quer dizer</h3><p>Quer dizer que a criança enxergou as letras menores com mais dificuldade do que o esperado, em um ou nos dois olhos. Não quer dizer que ela tem uma doença grave. Na maioria das vezes, a causa é um erro de refração, como miopia, hipermetropia ou astigmatismo, que se corrige com óculos. Só a consulta com o oftalmologista confirma.</p></div>
<div class='cx-painel'><h3>O que fazer agora</h3><ol class='pj-passos'><li><b>1</b><span>Guarde o papel da triagem. Ele é o encaminhamento.</span></li><li><b>2</b><span>Siga a orientação escrita no papel para marcar a consulta. Outra porta de entrada é a Unidade Básica de Saúde do seu bairro: leve o papel e peça o encaminhamento para o oftalmologista.</span></li><li><b>3</b><span>No dia, leve o papel, um documento da criança, o cartão do SUS e os óculos, se ela já usa.</span></li><li><b>4</b><span>Se o médico indicar óculos, a criança deve usar como ele orientar. Quando há indicação, o projeto disponibiliza os óculos.</span></li></ol><a class='text-link' href='/encaminhado/'>Passo a passo completo até a consulta pelo SUS →</a></div>
<div class='cx-painel' id='retorno'><h3>Conte ao PET como foi</h3><p>São uma ou duas perguntas. A resposta é anônima: não pedimos nome, telefone nem o nome da escola. Ela mostra ao PET se as famílias estão conseguindo a consulta.</p>
<div id='ac-retorno'><div id='ac-passo1'><p class='cx-perg'>A criança já passou pela consulta com o oftalmologista?</p><div class='cx-ops' id='ac-ops1'></div></div><div id='ac-passo2' hidden><p class='cx-perg' id='ac-perg2'></p><div class='cx-ops' id='ac-ops2'></div></div><div id='ac-fim' hidden><p id='ac-fim-txt' role='status'></p></div></div>
<p>Ainda não deu tempo? <button type='button' class='fale-link' id='ac-lembrar'>Guardar um lembrete para daqui a 30 dias</button></p><p class='cx-nota' id='ac-lembrar-msg' role='status'></p></div>
</div>
<div data-painel='bem' id='tudo-bem' hidden>
<div class='cx-painel'><h3>O que isso quer dizer</h3><p>No dia do teste, a criança enxergou as letras dentro do esperado para a triagem. É uma boa notícia, mas a triagem é um teste rápido e não encontra todos os problemas de visão. Continue observando os sinais abaixo.</p></div>
</div>
<section class='cx-sec' id='sinais' aria-labelledby='sinais-t'><h2 id='sinais-t'>Sinais para observar em casa e na escola</h2><p>Muitas crianças não reclamam, porque acham que todo mundo enxerga do mesmo jeito. Se notar algum destes sinais, procure avaliação, mesmo com o teste normal.</p><div class='cx-duas'><ul class='cx-lista'><li>Dificuldade para enxergar a lousa ou copiar a lição.</li><li>Chegar muito perto de livros, cadernos e telas.</li><li>Dores de cabeça frequentes.</li></ul><ul class='cx-lista'><li>Apertar os olhos para ver de longe.</li><li>Olhos vermelhos ou coçando com frequência.</li><li>Um olho desviado para dentro ou para fora.</li></ul></div><p class='cx-nota'>Fontes: cartilha Saúde Ocular na Infância, do Conselho Brasileiro de Oftalmologia e da Sociedade Brasileira de Oftalmologia Pediátrica, noticiada pela <a class='text-link' href='https://agenciabrasil.ebc.com.br/saude/noticia/2025-08/cartilha-sobre-saude-ocular-na-infancia-orienta-pais-e-professores' target='_blank' rel='noopener noreferrer'>Agência Brasil ↗</a>; material do Programa Saúde na Escola sobre saúde ocular, do <a class='text-link' href='https://www.nescon.medicina.ufmg.br/biblioteca/imagem/REA-Programa-saude-na-escola-saude-ocular.pdf' target='_blank' rel='noopener noreferrer'>Nescon/UFMG ↗</a>.</p></section>
<section class='cx-sec' aria-labelledby='duv-t'><h2 id='duv-t'>Ficou com dúvida?</h2><p>Pergunte ao PET. A mensagem não é publicada. Este conteúdo é educativo e não substitui a consulta. Dor forte, pancada no olho ou perda súbita da visão são urgências: procure atendimento na hora.</p><div class='part-acoes'><a class='button' href='/comunidade/?tipo=duvida'>Perguntar ao PET {SETA}</a><a class='button secondary' href='/projetos/acuidade-visual/'>Conhecer o projeto {SETA}</a></div><p class='cx-nota'>O funcionamento do projeto vem da proposta registrada pelo PET no <a class='text-link' href='https://siex.ufmt.br/Projeto/Detalhes?projetoUID=16626' target='_blank' rel='noopener noreferrer'>SIEx da UFMT ↗</a>. O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT. <a class='text-link' href='/privacidade/#contagem'>Como o retorno anônimo é guardado →</a></p></section>
</div>"""

PERGUNTOU = f"""<div class='wrap page-intro'><span class='eyebrow'>VOCÊ PERGUNTOU, O PET RESPONDEU</span><h1>O que a comunidade pediu e o que voltou para ela.</h1><p class='intro-description'>Dúvidas que servem para mais gente e temas votados que viraram conteúdo. Nenhuma resposta traz o nome de quem perguntou.</p></div>
<div class='wrap cx'>
<ul class='cx-pr' id='vp-lista' aria-live='polite'><li class='empty-state'>Carregando respostas…</li></ul>
<section class='cx-sec' aria-labelledby='vp-mais'><h2 id='vp-mais'>Quer ver a sua pergunta aqui?</h2><p>Mande sua dúvida ou vote em um tema. As respostas são educativas e não substituem atendimento profissional.</p><div class='part-acoes'><a class='button' href='/comunidade/?tipo=duvida'>Mandar uma dúvida {SETA}</a><a class='button secondary' href='/comunidade/#temas'>Votar em um tema {SETA}</a></div></section>
</div>"""

ALCANCE = f"""<div class='wrap page-intro'><span class='eyebrow'>ONDE O PET JÁ ESTEVE</span><h1>Os lugares, as pessoas e o que aconteceu depois.</h1><p class='intro-description'>Só entram aqui números e locais que o próprio PET publicou. Cada um leva à página que traz a fonte.</p></div>
<div class='wrap cx'>
<section aria-labelledby='al-n-t'><h2 class='sr-only' id='al-n-t'>Resultados publicados</h2><ul class='cx-nums' id='al-numeros' aria-live='polite'><li class='empty-state'>Carregando números…</li></ul></section>
<section class='cx-sec' aria-labelledby='al-l-t'><h2 id='al-l-t'>Locais e públicos</h2><p>Onde as ações aconteceram, segundo os registros públicos do grupo.</p><ul class='cx-locais' id='al-locais'></ul></section>
<section class='cx-sec' aria-labelledby='al-d-t'><h2 id='al-d-t'>O que aconteceu depois</h2><p>Depois do teste de visão, as famílias contam, sem se identificar, se conseguiram a consulta. O total aparece aqui.</p><div id='al-depois'></div></section>
<section class='cx-sec' aria-labelledby='al-p-t'><h2 id='al-p-t'>Quer o PET no seu bairro?</h2><p>Escolas, unidades de saúde e grupos de bairro podem pedir uma ação.</p><div class='part-acoes'><a class='button' href='/leve-o-pet/'>Pedir uma ação {SETA}</a></div></section>
</div>"""


IMPRIMIR = f"""<div class='wrap page-intro'><span class='eyebrow'>MATERIAL PARA IMPRIMIR</span><h1>Papel e cartaz com QR code para as ações do PET.</h1><p class='intro-description'>Cada QR code leva direto à página certa e traz um código próprio. Assim o painel mostra quantas pessoas chegaram por cada papel e por cada cartaz, sem identificar ninguém.</p></div>
<div class='wrap cx'>
<section class='cx-sec' aria-labelledby='im-papel-t'><h2 id='im-papel-t'>Papel da ação: teste de visão</h2><p>Meia folha A4, entregue à família depois da triagem. A equipe marca o resultado e escreve onde marcar a consulta.</p>
<div class='cx-folha' id='folha-papel'>
<div class='cx-folha-topo'><span>PET Medicina UFMT · estudantes de Medicina</span><span>Triagem, não é diagnóstico</span></div>
<h3>Teste de visão na escola</h3>
<div class='cx-folha-linhas'><span>Nome da criança:</span><span>Turma:</span><span>Data:</span></div>
<ul class='cx-folha-marcas'><li>Está tudo bem no teste de hoje.</li><li>Precisa de consulta com o oftalmologista.</li></ul>
<p class='cx-folha-onde'>Onde marcar a consulta:</p>
<div class='cx-folha-qr'>{qr(URL_PAPEL, 'página do teste de visão')}<div><strong>Aponte a câmera do celular para o quadrado.</strong><p>Você vai ver o que o resultado quer dizer, o que fazer agora e como contar ao PET se conseguiu a consulta.</p><p>Ou digite: <b>pet-conecta.vercel.app/visao</b></p></div></div>
</div>
<div class='cx-imp-acoes'><button type='button' class='button' data-imprimir='folha-papel'>Imprimir o papel {SETA}</button></div></section>
<section class='cx-sec' aria-labelledby='im-cartaz-t'><h2 id='im-cartaz-t'>Cartaz: escola, unidade de saúde ou hemocentro</h2><p>Folha A4 para deixar no mural. Leva à página inicial do site, que abre com o que a comunidade pode fazer.</p>
<div class='cx-folha cx-folha-cartaz' id='folha-cartaz'>
<div class='cx-folha-topo'><span>PET Medicina UFMT</span><span>Gratuito</span></div>
<h3>Não é da área da saúde? Os estudantes de Medicina da UFMT têm uma página para você.</h3>
<ul class='cx-lista'><li>Veja as vacinas e os exames para a sua idade.</li><li>Tire uma dúvida de saúde.</li><li>Saiba das próximas ações perto de você.</li><li>Escolha o próximo tema que vamos explicar.</li></ul>
<div class='cx-folha-qr'>{qr(URL_CARTAZ, 'página inicial do PET Conecta')}<div><strong>Aponte a câmera do celular para o quadrado.</strong><p>Ou digite: <b>pet-conecta.vercel.app/voce</b></p></div></div>
<p class='cx-folha-pe'>Proposta independente feita por estudantes, sem vínculo oficial com o PET Medicina UFMT.</p>
</div>
<div class='cx-imp-acoes'><button type='button' class='button' data-imprimir='folha-cartaz'>Imprimir o cartaz {SETA}</button></div></section>
<section class='cx-sec' aria-labelledby='im-links-t'><h2 id='im-links-t'>Links para o Instagram do PET</h2><p>Use estes endereços no lugar do link do site. Cada um mostra no painel de onde a pessoa veio.</p>
<ul class='cx-links'><li><strong>Link da bio</strong><code>{SITE}/?de=instagram&amp;c=bio</code></li><li><strong>Stories e posts</strong><code>{SITE}/?de=instagram&amp;c=stories</code></li><li><strong>Post sobre o teste de visão</strong><code>{SITE}/acao/acuidade-visual/?de=instagram&amp;c=post-visao</code></li></ul>
<p class='cx-nota'>Para uma ação nova, troque a palavra depois de <code>c=</code> por um nome curto, só com letras minúsculas, números e hífen.</p></section>
</div>"""


QR = f"""<div class='wrap page-intro'><span class='eyebrow'>ATENDIMENTO · QR CODE E LINKS</span><h1>Veio por um QR code ou link do PET?</h1><p class='intro-description'>Os papéis, os cartazes e os links do PET levam direto à página certa. Veja de onde você veio, o que encontra lá e o que fazer se não abrir.</p></div>
<div class='wrap cx'>
<section class='ap-guia' aria-labelledby='qr-de'><h2 id='qr-de'>De onde você veio?</h2><div class='ap-guia-grid'>
<a href='/acao/acuidade-visual/'><strong>Papel do teste de visão</strong><span>Entregue na escola depois da triagem. Abre a página que explica o resultado, o que fazer agora e como contar ao PET se a criança conseguiu a consulta.</span></a>
<a href='/'><strong>Cartaz na escola, na unidade de saúde ou no hemocentro</strong><span>Abre a página inicial, com o que a comunidade pode fazer: cuidar da saúde, falar com o PET e participar das ações.</span></a>
<a href='/'><strong>Link do Instagram do PET</strong><span>Na bio ou nos stories. Abre a página inicial ou a página da ação divulgada no post.</span></a>
<a href='/comunidade/'><strong>Resposta do PET por e-mail</strong><span>Se você mandou uma dúvida, a resposta chega no contato que deixou. Pode mandar outra quando quiser.</span></a>
</div></section>
<section class='cx-sec' aria-labelledby='qr-como'><h2 id='qr-como'>Como ler um QR code</h2><p>O QR code é o quadrado de pontinhos impresso no papel ou no cartaz.</p>
<ol class='pj-passos cx-passos'><li><b>1</b><span>Abra a câmera do celular, a mesma de tirar foto.</span></li><li><b>2</b><span>Aponte para o quadrado e espere um ou dois segundos, sem tirar foto.</span></li><li><b>3</b><span>Toque no aviso ou no link que aparecer na tela. A página do PET abre no navegador.</span></li></ol>
<div class='cx-painel'><h3>Não abriu?</h3><ul class='cx-lista'><li>Chegue um pouco mais perto ou mais longe, com o quadrado inteiro na tela e boa luz.</li><li>Em alguns celulares Android, a leitura fica no Google Lens ou num botão da própria câmera.</li><li>Ou digite o endereço curto impresso embaixo do quadrado: <b>pet-conecta.vercel.app/visao</b> no papel do teste de visão e <b>pet-conecta.vercel.app/voce</b> no cartaz.</li></ul></div></section>
<section class='cx-sec' aria-labelledby='qr-dados'><h2 id='qr-dados'>Seus dados</h2><p>Abrir uma página pelo QR code não identifica você. O site só conta quantas pessoas chegaram por cada papel, cartaz ou link, sem nome, telefone ou localização. Isso mostra ao PET quais ações estão chegando à comunidade.</p><p class='cx-nota'><a class='text-link' href='/privacidade/#contagem'>Como a contagem funciona →</a></p></section>
<section class='cx-sec cx-dica' aria-labelledby='qr-ajuda'><div><span class='eyebrow'>AINDA COM DÚVIDA?</span><h2 id='qr-ajuda'>Não achou o que procurava?</h2><p>Mande sua pergunta para os estudantes do PET. Ela não é publicada e a resposta chega pelo contato que você deixar.</p></div><a class='button' href='/comunidade/?tipo=duvida'>Tirar uma dúvida <span aria-hidden='true'>→</span></a></section>
<p class='cx-nota'>O PET Conecta é uma proposta independente, sem vínculo oficial com o PET Medicina UFMT.</p>
</div>"""

PAGINAS = [
    ('atendimento', 'Atendimento', 'Participe de uma ação de saúde, tire uma dúvida ou peça o PET na sua escola ou no seu bairro.', ATENDIMENTO),
    ('qr', 'Veio por um QR code ou link?', 'O que cada papel, cartaz ou link do PET traz, como ler o QR code com o celular e o que fazer se ele não abrir.', QR),
    ('leve-o-pet', 'Leve o PET até você', 'Escolas, unidades de saúde e grupos de bairro podem pedir uma ação de saúde do PET.', LEVE),
    ('acao/acuidade-visual', 'Depois do teste de visão na escola', 'Entenda o papel da triagem de visão, saiba o que fazer se ele pede consulta e conte ao PET como foi.', ACAO),
    ('voce-perguntou', 'Você perguntou, o PET respondeu', 'Dúvidas respondidas e temas votados pela comunidade que viraram conteúdo.', PERGUNTOU),
    ('imprimir', 'Material para imprimir', 'Papel da ação e cartaz com QR code para levar às escolas, unidades de saúde e hemocentros.', IMPRIMIR),
    ('alcance', 'Onde o PET já esteve', 'Locais, públicos e resultados publicados das ações do PET, e o que aconteceu depois.', ALCANCE),
]

with open(os.path.join(RAIZ, 'comunidade', 'index.html'), encoding='utf-8', newline='') as f:
    base = f.read()
base = re.sub(r"\?v=[0-9a-f]{10}", '', base)  # versionar.py recoloca as versoes depois


def troca(padrao, novo, texto):
    saida, n = re.subn(padrao, lambda m: novo, texto, count=1, flags=re.S)
    assert n == 1, 'molde mudou: ' + padrao
    return saida


for caminho, titulo, desc, corpo in PAGINAS:
    url = f'{SITE}/{caminho}/'
    h = base
    h = troca(r"<title>.*?</title>", f"<title>{titulo} · PET Conecta</title>", h)
    h = troca(r"<meta name='description' content='[^']*'>", f"<meta name='description' content='{desc}'>", h)
    h = troca(r"<link rel='canonical' href='[^']*'>", f"<link rel='canonical' href='{url}'>", h)
    h = troca(r"<meta property='og:title' content='[^']*'>", f"<meta property='og:title' content='{titulo} · PET Conecta'>", h)
    h = troca(r"<meta property='og:description' content='[^']*'>", f"<meta property='og:description' content='{desc}'>", h)
    h = troca(r"<meta property='og:url' content='[^']*'>", f"<meta property='og:url' content='{url}'>", h)
    h = troca(r"<script src='/pet-dados.js' defer></script><script src='/comunidade.js' defer></script>", "<script src='/ciclo.js' defer></script>", h)
    h = h.replace(" aria-current='page' data-v2=''", " data-v2=''").replace("class='menu-destaque active' aria-current='page'", "class='menu-destaque'")
    h = troca(r"<main id='conteudo'[^>]*>.*?</main>", "<main id='conteudo'>" + corpo.replace('\n', '') + "</main>", h)
    destino = os.path.join(RAIZ, caminho, 'index.html')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, 'w', encoding='utf-8', newline='') as f:
        f.write(h)
    print('gerada /' + caminho + '/')
