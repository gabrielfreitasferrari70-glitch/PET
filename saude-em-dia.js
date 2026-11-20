/* Minha Saúde em Dia: lista pessoal de vacinas, exames e formas de ajudar.
   Tudo roda neste navegador. Nada é enviado nem guardado.
   Regras conferidas em 19/11/2026. Revisar a cada atualização do Calendário Nacional de Vacinação. */
(function () {
  var form = document.getElementById('sd-form');
  if (!form) return;
  var saida = document.getElementById('sd-resultado');
  var erro = document.getElementById('sd-erro');
  var gestBox = document.getElementById('sd-gestante-box');
  var gestInput = document.getElementById('sd-gestante');

  var F = {
    cnv: 'Calendário Nacional de Vacinação 2026, Ministério da Saúde',
    hpv: 'Ministério da Saúde: resgate do HPV prorrogado até 31/12/2026',
    pneumo: 'Ministério da Saúde: Pneumo 20 para idosos (2026)',
    colo: 'INCA: rastreamento do câncer do colo do útero com teste DNA-HPV',
    mama: 'Ministério da Saúde, Nota Técnica nº 626/2025',
    dm: 'Ministério da Saúde, PCDT do Diabete Melito Tipo 2 (Portaria SCTIE/MS nº 13/2026)',
    sangue: 'Ministério da Saúde, Portaria GM/MS nº 11.685/2026 (regras de doação de sangue)',
    redome: 'INCA/REDOME: cadastro de doadores de medula óssea',
    orelha: 'Lei Federal nº 12.303/2010 (Teste da Orelhinha)'
  };

  var hoje = new Date();
  var FIM_RESGATE_HPV = new Date(2027, 0, 1) - 1;

  function item(tipo, titulo, texto, fonte, link) {
    return { tipo: tipo, titulo: titulo, texto: texto, fonte: fonte, link: link };
  }

  function montar(idade, sexo, gestante) {
    var vac = [], exa = [], doa = [], pet = [];
    var fem = sexo === 'f';

    if (gestante) {
      vac.push(item('Vacina', 'dTpa (difteria, tétano e coqueluche)', 'Uma dose a partir da 20ª semana, em cada gestação. Os anticorpos passam para o bebê e o protegem nos primeiros meses.', F.cnv));
      vac.push(item('Vacina', 'VSR (vírus sincicial respiratório)', 'Dose única em cada gestação, a partir da 28ª semana. Protege o bebê contra o VSR, principal causa de bronquiolite nos primeiros meses.', F.cnv));
      vac.push(item('Vacina', 'Influenza (gripe)', 'Uma dose por temporada, em cada gestação.', F.cnv));
      vac.push(item('Vacina', 'Covid-19', 'Uma dose em cada gestação, em qualquer fase, com pelo menos 6 meses desde a última dose.', F.cnv));
      vac.push(item('Vacina', 'Hepatite B', 'Se o esquema de 3 doses não está completo, complete durante o pré-natal.', F.cnv));
      vac.push(item('Vacina', 'Vacinas que esperam o parto', 'Tríplice viral, varicela e dengue (feitas com vírus vivo atenuado) e a vacina de HPV não são aplicadas na gravidez. Se alguma estiver atrasada, a UBS orienta tomar depois do parto. A de febre amarela só é aplicada em situações excepcionais, com avaliação médica.', F.cnv));
      exa.push(item('Exame', 'Pré-natal em dia', 'Os exames da gestação, como o de glicemia para diabetes gestacional, são pedidos nas consultas do pré-natal. Leve sempre a Caderneta da Gestante.', 'Ministério da Saúde, Caderneta da Gestante'));
      if (idade >= 16) doa.push(item('Doação', 'Doar sangue fica para depois', 'A gravidez é um impedimento temporário para doar sangue. Depois do parto e da amamentação, o hemocentro informa quando você pode voltar.', F.sangue));
    }
    var g = gestante;

    if (idade < 9) {
      vac.push(item('Vacina', 'Caderneta da Criança em dia', 'Até os 9 anos há muitas vacinas, em idades bem definidas. Leve a caderneta à UBS para conferir se nenhuma dose ficou para trás.', F.cnv));
      if (idade < 1) exa.push(item('Exame', 'Teste da Orelhinha', 'Obrigatório e gratuito para todos os recém-nascidos, feito na maternidade. Se não foi feito, peça na UBS.', F.orelha, { href: '/aprender/saude-auditiva/', txt: 'Entenda o teste com o PET' }));
    }
    if (!g && idade >= 9 && idade <= 14) vac.push(item('Vacina', 'HPV', 'Dose única para meninas e meninos de 9 a 14 anos. Protege contra cânceres causados pelo HPV.', F.cnv));
    if (!g && idade >= 15 && idade <= 19 && hoje <= FIM_RESGATE_HPV) vac.push(item('Vacina', 'HPV (resgate)', 'Se você nunca tomou, pode receber uma dose pelo SUS até 31 de dezembro de 2026.', F.hpv));
    if (!g && idade >= 10 && idade <= 14) vac.push(item('Vacina', 'Dengue', 'Duas doses, com 3 meses de intervalo, para quem tem de 10 a 14 anos.', F.cnv));
    if (!g && idade >= 11 && idade <= 14) vac.push(item('Vacina', 'Meningocócica ACWY', 'Uma dose aos 11 anos (ou até os 14, se ainda não tomou), contra meningites.', F.cnv));
    if (!g && idade >= 14) vac.push(item('Vacina', 'Dupla adulto (dT)', idade === 14 ? 'Reforço aos 14 anos. Depois disso, um reforço a cada 10 anos.' : 'Um reforço a cada 10 anos contra difteria e tétano. Se não lembra da última dose, confira na UBS.', F.cnv));
    if (!g && idade >= 7) vac.push(item('Vacina', 'Hepatite B', 'Três doses ao longo da vida. Se o esquema não está completo, dá para completar em qualquer idade.', F.cnv));
    if (!g && idade >= 9 && idade <= 59) vac.push(item('Vacina', 'Febre amarela', 'Confira se já tem a dose registrada na caderneta. Se não tiver, a UBS orienta.', F.cnv));
    if (!g && idade >= 10 && idade <= 29) vac.push(item('Vacina', 'Tríplice viral (sarampo, caxumba e rubéola)', 'Até os 29 anos, são duas doses. Se faltou alguma, complete.', F.cnv));
    if (!g && idade >= 30 && idade <= 59) vac.push(item('Vacina', 'Tríplice viral (sarampo, caxumba e rubéola)', 'De 30 a 59 anos, uma dose. Se não tem registro, procure a UBS.', F.cnv));
    if (!g && idade >= 20 && idade <= 59) vac.push(item('Vacina', 'Gripe e covid-19 (grupos prioritários)', 'Indicadas para quem tem doença crônica, trabalha na saúde ou faz parte de outros grupos prioritários. Pergunte na UBS se é o seu caso.', F.cnv));
    if (idade >= 60) {
      vac.push(item('Vacina', 'Influenza (gripe)', 'Uma dose todo ano, em cada campanha.', F.cnv));
      vac.push(item('Vacina', 'Covid-19', 'Uma dose a cada 6 meses.', F.cnv));
      vac.push(item('Vacina', 'Pneumocócica 20-valente', idade >= 85 ? 'Indicada para todas as pessoas a partir de 85 anos: uma dose.' : 'Indicada para pessoas de 60 a 84 anos acamadas ou que vivem em instituições de longa permanência.', idade >= 85 ? F.pneumo : F.cnv));
    }

    if (fem && idade >= 25 && idade <= 64) exa.push(item('Exame', 'Prevenção do câncer do colo do útero', 'Teste DNA-HPV a cada 5 anos, de 25 a 64 anos. Onde o teste ainda não chegou, continua valendo o preventivo (Papanicolau).', F.colo));
    if (!g && fem && idade >= 50 && idade <= 74) exa.push(item('Exame', 'Mamografia', 'A cada 2 anos, dos 50 aos 74 anos, mesmo sem sintomas.', F.mama));
    if (!g && fem && ((idade >= 40 && idade <= 49) || idade > 74)) exa.push(item('Exame', 'Mamografia (se você quiser)', 'O SUS faz o exame mesmo sem sintomas. Converse com o profissional da UBS sobre riscos e benefícios no seu caso.', F.mama));
    if (!g && idade >= 35) exa.push(item('Exame', 'Glicemia de jejum (diabetes)', 'A partir dos 35 anos, todos devem fazer o exame de sangue para diabetes. Se der normal, repita a cada 3 anos.', F.dm));
    if (!g && idade >= 18 && idade < 35) exa.push(item('Exame', 'Glicemia de jejum (diabetes), se houver risco', 'Antes dos 35 anos, o exame é indicado para quem tem sobrepeso ou obesidade e mais algum fator de risco, como diabetes na família ou pressão alta. Pergunte na UBS.', F.dm));
    if (idade >= 4 && idade <= 14) exa.push(item('Exame', 'Teste de visão', 'Criança muitas vezes não percebe que enxerga mal. Um teste simples na escola ou na UBS descobre cedo.', 'PET Medicina UFMT, projeto Acuidade Visual', { href: '/projetos/acuidade-visual/', txt: 'Conheça o Acuidade Visual' }));

    if (!g && idade >= 16 && idade <= 17) doa.push(item('Doação', 'Doar sangue', 'Com 16 ou 17 anos você já pode doar, com autorização dos responsáveis, se pesar 50 kg ou mais. Uma doação pode ajudar até quatro pessoas.', F.sangue, { href: '/projetos/trote-solidario/', txt: 'Veja o Trote Solidário' }));
    if (!g && idade >= 18 && idade <= 60) doa.push(item('Doação', 'Doar sangue', 'Quem pesa 50 kg ou mais e está bem de saúde pode doar no hemocentro. A primeira doação precisa acontecer até os 60 anos. Uma doação pode ajudar até quatro pessoas.', F.sangue, { href: '/projetos/trote-solidario/', txt: 'Veja o Trote Solidário' }));
    if (!g && idade >= 61) doa.push(item('Doação', 'Doar sangue (se você já é doador)', 'Quem já doava pode continuar, inclusive depois dos 70 anos, se for considerado apto na avaliação do hemocentro. A primeira doação, porém, precisa acontecer até os 60 anos.', F.sangue));
    if (!g && idade >= 18 && idade <= 35) doa.push(item('Doação', 'Cadastro de doador de medula óssea', 'Entre 18 e 35 anos você pode se cadastrar. É só uma coleta pequena de sangue, e o cadastro vale até os 60 anos.', F.redome, { href: '/projetos/cadastro-do-bem/', txt: 'Veja o Cadastro do Bem' }));

    if (idade >= 14) pet.push(item('PET', 'Saber agir numa emergência', 'Numa parada cardíaca, ligue 192 e comece logo as compressões no centro do peito: isso mais que dobra a chance de sobrevivência. O PET também oferece um curso de atendimento pré-hospitalar para estudantes e profissionais da saúde.', 'Hasselqvist-Ax et al., New England Journal of Medicine, 2015', { href: '/projetos/curso-aph/', txt: 'Conheça o Curso de APH' }));

    return [
      { nome: 'Vacinas para conferir', itens: vac },
      { nome: 'Exames indicados', itens: exa },
      { nome: 'Você pode ajudar', itens: doa },
      { nome: 'Do PET para você', itens: pet }
    ];
  }

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function desenhar(idade, sexo, gestante) {
    var grupos = montar(idade, sexo, gestante);
    var total = grupos.reduce(function (s, g) { return s + g.itens.length; }, 0);
    saida.textContent = '';

    var head = el('div', 'int-result-head');
    var tit = el('div');
    tit.appendChild(el('span', 'eyebrow', 'Sua lista'));
    var h2 = el('h2', null, (idade === 0 ? 'Menos de 1 ano' : idade + (idade === 1 ? ' ano' : ' anos')) + (gestante ? ', gestante' : ''));
    h2.tabIndex = -1;
    tit.appendChild(h2);
    tit.appendChild(el('p', null, total + ' itens para conferir na UBS. Imprima ou salve em PDF e leve com a caderneta de vacinação.'));
    head.appendChild(tit);
    var acoes = el('div', 'int-acoes');
    var imp = el('button', 'button', 'Imprimir / PDF');
    imp.type = 'button';
    imp.addEventListener('click', function () { if (window.petMedir) window.petMedir('lista_impressa'); window.print(); });
    var novo = el('button', 'button secondary', 'Refazer');
    novo.type = 'button';
    novo.addEventListener('click', function () { form.reset(); atualizarGestante(); var campo = document.getElementById('sd-idade'); focar(campo); mostrar(form, 'start'); });
    acoes.appendChild(imp);
    acoes.appendChild(novo);
    head.appendChild(acoes);
    saida.appendChild(head);

    grupos.forEach(function (g) {
      if (!g.itens.length) return;
      var sec = el('section', 'int-grupo');
      sec.appendChild(el('h3', null, g.nome));
      g.itens.forEach(function (it) {
        var art = el('article', 'int-item');
        art.appendChild(el('span', 'int-tag', it.tipo));
        art.appendChild(el('h4', null, it.titulo));
        var p = el('p', null, it.texto + ' ');
        if (it.link) {
          var a = el('a', null, it.link.txt + ' →');
          a.href = it.link.href;
          p.appendChild(a);
        }
        art.appendChild(p);
        art.appendChild(el('p', 'meta int-fonte', 'Fonte: ' + it.fonte));
        sec.appendChild(art);
      });
      saida.appendChild(sec);
    });

    var perg = el('section', 'int-perguntas');
    perg.appendChild(el('h3', 'eyebrow', 'Leve estas perguntas para a UBS'));
    var ol = el('ol');
    ['Minha caderneta de vacinação está completa para a minha idade?',
     'Faço parte de algum grupo prioritário para gripe ou covid-19?',
     'Algum exame da lista é indicado para mim agora, considerando minha história e a da minha família?'].forEach(function (t) { ol.appendChild(el('li', null, t)); });
    perg.appendChild(ol);
    saida.appendChild(perg);

    saida.appendChild(el('p', 'int-aviso', 'Esta lista é educativa e segue as recomendações gerais do SUS para a idade e o sexo informados. Ela não substitui a consulta: doenças crônicas, gravidez, histórico familiar e outras condições podem mudar o que é indicado para você. Conteúdo conferido em novembro de 2026.'));
    focar(h2);
    mostrar(saida, 'start');
  }

  // Foco sem pulo: a página só rola quando o que importa ficou fora da tela, e o mínimo necessário.
  var suave = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  function focar(alvo) { if (!alvo) return; try { alvo.focus({ preventScroll: true }); } catch (e) { alvo.focus(); } }
  function mostrar(alvo, bloco) {
    if (!alvo || !alvo.getBoundingClientRect) return;
    var r = alvo.getBoundingClientRect(), topo = 90, base = window.innerHeight - 70;
    if (r.top >= topo && r.bottom <= base) return;
    if (bloco === 'start' && r.top >= topo && r.top <= window.innerHeight * 0.5) return;
    alvo.scrollIntoView({ block: bloco || 'nearest', behavior: suave });
  }

  function atualizarGestante() {
    var sexo = form.querySelector('input[name=sexo]:checked');
    // Depende só do sexo: assim nada se move enquanto a pessoa digita a idade.
    var mostra = sexo && sexo.value === 'f';
    gestBox.hidden = !mostra;
    if (!mostra) gestInput.checked = false;
  }

  form.addEventListener('change', atualizarGestante);
  saida.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (a && window.petMedir) window.petMedir('lista_clique', { alvo: a.getAttribute('href') });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    erro.hidden = true;
    var idade = parseInt(document.getElementById('sd-idade').value, 10);
    var sexo = form.querySelector('input[name=sexo]:checked');
    if (isNaN(idade) || idade < 0 || idade > 120) { erro.textContent = 'Digite uma idade entre 0 e 120 anos.'; erro.hidden = false; return; }
    if (!sexo) { erro.textContent = 'Escolha uma das opções de sexo.'; erro.hidden = false; return; }
    desenhar(idade, sexo.value, gestInput.checked && idade >= 10 && idade <= 55);
    if (window.petMedir) {
      var gest = gestInput.checked && idade >= 10 && idade <= 55;
      var base = Math.min(85, Math.floor(idade / 5) * 5);
      window.petMedir('lista_gerada', { faixa: base >= 85 ? '85+' : base + '-' + (base + 4), sexo: sexo.value, gestante: sexo.value === 'f' ? gest : undefined, valor: saida.querySelectorAll('.int-item').length, tentativa: window.petVez ? window.petVez('lista') : 1 });
      if (window.petAvaliar) window.petAvaliar(saida, 'lista');
    }
  });
})();
