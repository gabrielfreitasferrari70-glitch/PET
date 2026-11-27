// Seja um doador: teste "Posso doar hoje?". Calcula no navegador, com as regras da Portaria GM/MS 11.685/2026. Nao envia nem guarda nada.
(function () {
  'use strict';
  var f = document.querySelector('[data-doar]');
  if (!f) return;
  var DIA = 864e5;
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var mes = function (d, n) { var x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
  var dia = function (d, n) { return new Date(d.getTime() + n * DIA); };
  var data = function (nome) { var v = f.elements[nome] && f.elements[nome].value; if (!v) return null; var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var marcado = function (nome) { var c = f.querySelector('input[name="' + nome + '"]:checked'); return c ? c.value : ''; };
  var fmt = function (d) { return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); };

  // Mostra a pergunta extra (data) so quando a resposta e sim
  Array.prototype.forEach.call(f.querySelectorAll('[data-se]'), function (bloco) {
    var nome = bloco.getAttribute('data-se');
    var atualiza = function () { bloco.hidden = marcado(nome) !== 'sim'; };
    Array.prototype.forEach.call(f.querySelectorAll('input[name="' + nome + '"]'), function (r) { r.addEventListener('change', atualiza); });
    atualiza();
  });

  var res = f.querySelector('[data-doar-res]'), titulo = f.querySelector('[data-doar-titulo]'), lista = f.querySelector('[data-doar-lista]');

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nao = [], espera = [], aviso = [], hojeNao = [];  // nao: impede; espera: [data, motivo]; aviso: consultar o hemocentro
    var idade = parseFloat(f.elements.idade.value), peso = parseFloat(String(f.elements.peso.value).replace(',', '.'));
    var ultima = data('ultima');

    if (!isFinite(idade) || !isFinite(peso)) {
      res.hidden = false; res.dataset.estado = 'falta'; titulo.textContent = 'Preencha a idade e o peso.'; lista.innerHTML = ''; f.elements[isFinite(idade) ? 'peso' : 'idade'].focus(); return;
    }
    if (idade < 16) nao.push('A doação de sangue começa aos 16 anos. Você pode ajudar chamando adultos para doar.');
    else if (idade < 18) aviso.push('De 16 a 17 anos, leve a autorização assinada pelo responsável e o documento dele. Confirme o modelo com o hemocentro.');
    else if (idade >= 60 && idade < 70 && !ultima) nao.push('Quem tem de 60 a 69 anos só pode doar se fez a primeira doação antes dos 60.');
    else if (idade >= 70) aviso.push('A partir dos 70 anos, só quem já doa com frequência pode continuar, depois de avaliação médica no hemocentro.');
    if (peso < 50) nao.push('É preciso pesar 50 kg ou mais.');

    if (ultima) {
      var intervalo = marcado('sexo') === 'f' ? 90 : 60;
      espera.push([dia(ultima, intervalo), 'Intervalo de ' + intervalo + ' dias desde a última doação']);
    }
    if (marcado('gripe') === 'sim') hojeNao.push('Espere melhorar totalmente e terminar o remédio. A triagem confirma quando você pode doar.');
    if (marcado('gravidez') === 'sim') hojeNao.push('Gravidez, pós-parto e amamentação impedem a doação por um tempo. O hemocentro informa o prazo para o seu caso.');
    if (marcado('tatuagem') === 'sim') {
      var dt = data('tatuagem_data') || hoje, seguro = marcado('tatuagem_local') === 'sim';
      espera.push([seguro ? dia(dt, 7) : mes(dt, 4), seguro ? 'Tatuagem ou procedimento em local regularizado (espera de 7 dias; leve o comprovante, se tiver)' : 'Tatuagem ou procedimento sem como confirmar o local (espera de 4 meses)']);
    }
    if (marcado('piercing') === 'sim') {
      var dp = data('piercing_data');
      if (dp) espera.push([mes(dp, 4), 'Piercing na boca ou na região genital (4 meses depois da retirada)']);
      else nao.push('Com piercing na boca ou na região genital, é preciso retirar e esperar 4 meses.');
    }
    if (marcado('endoscopia') === 'sim') espera.push([mes(data('endoscopia_data') || hoje, 4), 'Endoscopia ou colonoscopia (espera de 4 meses)']);
    if (marcado('malaria') === 'sim') espera.push([dia(data('malaria_data') || hoje, 30), 'Área de malária ou mata (30 dias depois da volta)']);
    if (marcado('hoje') === 'sim') espera.push([dia(hoje, 1), 'Álcool nas últimas 12 horas ou pouco sono (deixe para outro dia, descansado)']);

    var futuras = espera.filter(function (e) { return e[0] > hoje; });
    var itens = [];
    nao.forEach(function (t) { itens.push(t); });
    futuras.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (e) { itens.push(e[1] + ': a partir de ' + fmt(e[0]) + '.'); });
    hojeNao.forEach(function (t) { itens.push(t); });
    aviso.forEach(function (t) { itens.push(t); });

    if (nao.length) { res.dataset.estado = 'nao'; titulo.textContent = 'Por enquanto, você não pode doar sangue.'; }
    else if (futuras.length) {
      var ultimaData = futuras.reduce(function (m, e) { return e[0] > m ? e[0] : m; }, hoje);
      res.dataset.estado = 'espera'; titulo.textContent = hojeNao.length ? 'Hoje ainda não. Veja abaixo quando voltar.' : 'Você poderá doar a partir de ' + fmt(ultimaData) + '.';
    } else if (hojeNao.length) { res.dataset.estado = 'espera'; titulo.textContent = 'Hoje ainda não. Veja abaixo quando voltar.';
    } else if (aviso.length) { res.dataset.estado = 'aviso'; titulo.textContent = 'Talvez você possa doar: confira com o hemocentro.'; }
    else { res.dataset.estado = 'sim'; titulo.textContent = 'Pelo que você respondeu, pode doar. A triagem confirma no dia.'; itens.push('Agende pelo site do Governo de MT e leve um documento com foto.'); }

    lista.innerHTML = '';
    itens.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; lista.appendChild(li); });
    res.hidden = false;
    res.setAttribute('tabindex', '-1'); res.focus({ preventScroll: false });
  });
})();
