(function(){
  // Catálogo só com iniciativas documentadas nas fontes citadas no site.
  var PROJETOS=[
    {id:'cadastro',cat:'Educação em saúde',titulo:'Cadastro do Bem',
     desc:'Ação de conscientização sobre a importância de ser doador de medula óssea.',
     info:{'Resultados documentados (2024)':'41 ações, 1.880 pessoas alcançadas e 27 novos cadastros, segundo a Mostra de Extensão.','Como participar':'Consulte os canais oficiais do PET Medicina.'}},
    {id:'aph',cat:'Educação em saúde',titulo:'Curso de Atendimento Pré-Hospitalar (APH)',
     desc:'Curso de primeiros socorros e atendimento pré-hospitalar, com a X edição registrada para 2026.',
     info:{'Previsão (2026)':'Público estimado de 45 pessoas, conforme o registro do SIEx/UFMT.','Como participar':'Inscrições só pelo link oficial, quando o PET publicar.'}},
    {id:'cedo',cat:'Humanização',titulo:'Começando Cedo',
     desc:'Atividades de humanização, com capacitação de voluntários e ações autorizadas do projeto.',
     info:{'Como participar':'Consulte os canais oficiais do PET Medicina.'}},
    {id:'anamnese',cat:'Comunicação',titulo:'Jornal Anamnese',
     desc:'Jornal produzido pelo PET Medicina, com acervo histórico disponível online.',
     info:{'Acervo':'petmedicinaufmt.wordpress.com','Proposta':'Edição digital bimestral com arquivo permanente.'}}
  ];
  var CATS=['Todos','Educação em saúde','Humanização','Comunicação','Cultura'];
  var atual='Todos';
  var $=function(s){return document.querySelector(s)};

  var filtros=$('#filters'),lista=$('#projetos-lista'),vazio=$('#vazio');
  CATS.forEach(function(c){
    var b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=c;
    b.setAttribute('aria-pressed',c===atual);
    b.addEventListener('click',function(){atual=c;render()});
    filtros.appendChild(b);
  });

  function render(){
    Array.prototype.forEach.call(filtros.children,function(b){b.setAttribute('aria-pressed',b.textContent===atual)});
    lista.innerHTML='';
    var itens=PROJETOS.filter(function(p){return atual==='Todos'||p.cat===atual});
    vazio.hidden=itens.length>0;
    itens.forEach(function(p){
      var b=document.createElement('button');
      b.type='button';b.className='pcard';
      b.innerHTML='<span class="cat"></span><h3></h3><p></p><span class="go">Conheça o projeto →</span>';
      b.querySelector('.cat').textContent=p.cat;
      b.querySelector('h3').textContent=p.titulo;
      b.querySelector('p').textContent=p.desc;
      b.addEventListener('click',function(){abrir(p)});
      lista.appendChild(b);
    });
  }

  var modal=$('#modal'),ultimo=null;
  function abrir(p){
    ultimo=document.activeElement;
    $('#m-cat').textContent=p.cat.toUpperCase();
    $('#m-titulo').textContent=p.titulo;
    $('#m-desc').textContent=p.desc;
    var dl=$('#m-info');dl.innerHTML='';
    Object.keys(p.info).forEach(function(k){
      var dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=k;dd.textContent=p.info[k];dl.appendChild(dt);dl.appendChild(dd);
    });
    modal.classList.add('open');$('#m-fechar').focus();
  }
  function fechar(){modal.classList.remove('open');if(ultimo)ultimo.focus()}
  $('#m-fechar').addEventListener('click',fechar);
  $('#m-cta').addEventListener('click',fechar);
  modal.addEventListener('click',function(e){if(e.target===modal)fechar()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))fechar()});

  // menu mobile
  var menu=$('#menu'),nav=$('#nav');
  menu.addEventListener('click',function(){
    var aberto=nav.classList.toggle('open');
    menu.setAttribute('aria-expanded',aberto);
  });
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});

  // item ativo no menu ao rolar
  var links=Array.prototype.slice.call(nav.querySelectorAll('a'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)});
        }
      });
    },{rootMargin:'-40% 0px -55% 0px'});
    links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
  }

  // formulário de demonstração: não envia nada
  document.querySelectorAll('#temas .chip').forEach(function(c){
    c.addEventListener('click',function(){c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')!=='true')});
  });
  $('#form').addEventListener('submit',function(e){
    e.preventDefault();
    $('#msg').textContent='Obrigado! Isto é só uma demonstração: nada foi enviado nem guardado.';
  });

  render();
})();
