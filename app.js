(function(){
  var D=window.PET_DATA||{projetos:[],eventos:[],acoes:[],edicoes:[],instagram:{}};
  var $=function(s,r){return (r||document).querySelector(s)};
  var AC='A confirmar pelo PET';

  function h(tag,props,kids){
    var e=document.createElement(tag);
    Object.keys(props||{}).forEach(function(k){
      if(k==='text')e.textContent=props[k];
      else if(k==='class')e.className=props[k];
      else e.setAttribute(k,props[k]);
    });
    (kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==='string'?document.createTextNode(c):c)});
    return e;
  }
  function fmtData(iso){
    if(!iso)return '';
    var p=iso.split('-');
    var d=new Date(+p[0],+p[1]-1,+p[2]);
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  }
  function projetoPorId(id){return D.projetos.filter(function(p){return p.id===id})[0]}

  /* ================= PROJETOS ================= */
  var temas=['Todos'];
  D.projetos.forEach(function(p){if(temas.indexOf(p.tema)<0)temas.push(p.tema)});
  var temaAtual='Todos',busca='';
  var fWrap=$('#filters'),lista=$('#projetos-lista'),vazio=$('#vazio'),campo=$('#busca');

  temas.forEach(function(t){
    var b=h('button',{type:'button',class:'chip','aria-pressed':t==='Todos',text:t});
    b.addEventListener('click',function(){temaAtual=t;renderProjetos()});
    fWrap.appendChild(b);
  });
  campo.addEventListener('input',function(){busca=campo.value.trim().toLowerCase();renderProjetos()});

  function renderProjetos(){
    Array.prototype.forEach.call(fWrap.children,function(b){b.setAttribute('aria-pressed',b.textContent===temaAtual)});
    lista.innerHTML='';
    var itens=D.projetos.filter(function(p){
      var okTema=temaAtual==='Todos'||p.tema===temaAtual;
      var texto=(p.titulo+' '+p.resumo+' '+p.tema).toLowerCase();
      return okTema&&(!busca||texto.indexOf(busca)>=0);
    });
    vazio.hidden=itens.length>0;
    itens.forEach(function(p){
      var c=h('button',{type:'button',class:'pcard'},[
        h('span',{class:'cat',text:p.tema}),
        h('h3',{text:p.titulo}),
        h('p',{text:p.resumo}),
        h('span',{class:'go',text:'Ver como funciona e como participar →'})
      ]);
      c.addEventListener('click',function(){abrirProjeto(p,true)});
      lista.appendChild(c);
    });
  }

  /* ================= MODAL DO PROJETO ================= */
  var modal=$('#modal'),ultimoFoco=null;
  function linha(dl,rotulo,valor){
    dl.appendChild(h('dt',{text:rotulo}));
    var dd=h('dd',{text:valor||AC});
    if(!valor)dd.className='pendente';
    dl.appendChild(dd);
  }
  function abrirProjeto(p,atualizaHash){
    ultimoFoco=document.activeElement;
    $('#m-cat').textContent=p.tema.toUpperCase();
    $('#m-titulo').textContent=p.titulo;
    $('#m-desc').textContent=p.resumo;
    var dl=$('#m-info');dl.innerHTML='';
    linha(dl,'Objetivo',p.objetivo);
    linha(dl,'Para quem é',p.publico);
    linha(dl,'Quando acontece',p.quando);
    linha(dl,'Como participar',p.comoParticipar);

    var det=$('#m-detalhes');det.innerHTML='';
    if(p.comoFunciona&&p.comoFunciona.length){
      det.appendChild(h('h4',{text:'Como funciona'}));
      var ul=h('ul',{});
      p.comoFunciona.forEach(function(t){ul.appendChild(h('li',{text:t}))});
      det.appendChild(ul);
    }
    var res=$('#m-resultados');res.innerHTML='';
    if(p.resultados&&p.resultados.length){
      res.appendChild(h('h4',{text:'Resultados documentados'}));
      var g=h('div',{class:'mini-stats'});
      p.resultados.forEach(function(r){
        g.appendChild(h('div',{},[h('b',{text:r.valor}),h('span',{text:r.rotulo+' · '+r.periodo})]));
      });
      res.appendChild(g);
    }
    var fo=$('#m-fontes');fo.innerHTML='';
    if(p.fontes&&p.fontes.length){
      fo.appendChild(document.createTextNode('Fontes: '));
      p.fontes.forEach(function(f,i){
        if(i)fo.appendChild(document.createTextNode(' · '));
        fo.appendChild(h('a',{href:f.url,target:'_blank',rel:'noopener',text:f.texto}));
      });
    }
    $('#m-ig').href=p.instagram||(D.instagram&&D.instagram.url)||'#';
    $('#m-share').onclick=function(){compartilhar(p)};
    $('#m-share-msg').textContent='';
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    $('#m-fechar').focus();
    if(atualizaHash)history.replaceState(null,'','#projeto='+p.id);
  }
  function fechar(){
    modal.classList.remove('open');
    document.body.style.overflow='';
    if(location.hash.indexOf('#projeto=')===0)history.replaceState(null,'',location.pathname+location.search+'#projetos');
    if(ultimoFoco&&ultimoFoco.focus)ultimoFoco.focus();
  }
  function compartilhar(p){
    var url=location.origin+location.pathname+'#projeto='+p.id;
    var msg=$('#m-share-msg');
    if(navigator.share){
      navigator.share({title:p.titulo+' · PET Conecta',text:p.resumo,url:url}).catch(function(){});
    }else if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){msg.textContent='Link copiado.'},function(){msg.textContent=url});
    }else{msg.textContent=url}
  }
  $('#m-fechar').addEventListener('click',fechar);
  $('#m-cta').addEventListener('click',fechar);
  modal.addEventListener('click',function(e){if(e.target===modal)fechar()});
  document.addEventListener('keydown',function(e){
    if(!modal.classList.contains('open'))return;
    if(e.key==='Escape'){fechar();return}
    if(e.key==='Tab'){
      var f=modal.querySelectorAll('a[href],button');
      if(!f.length)return;
      var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  });
  function abrirDoHash(){
    var m=location.hash.match(/^#projeto=(.+)$/);
    if(!m)return;
    var p=projetoPorId(decodeURIComponent(m[1]));
    if(p)abrirProjeto(p,false);
  }
  window.addEventListener('hashchange',abrirDoHash);

  /* ================= AGENDA ================= */
  function ics(ev){
    function dt(d,hr){return d.replace(/-/g,'')+'T'+(hr||'09:00').replace(':','')+'00'}
    function esc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
    var linhas=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PET Conecta//PT','BEGIN:VEVENT',
      'UID:'+ev.data+'-'+esc(ev.titulo).replace(/\s/g,'')+'@pet-conecta',
      'DTSTART:'+dt(ev.data,ev.hora),
      'DTEND:'+dt(ev.data,ev.fim||ev.hora||'10:00'),
      'SUMMARY:'+esc(ev.titulo),
      'LOCATION:'+esc(ev.local),
      'DESCRIPTION:'+esc((ev.descricao||'')+(ev.inscricao?' Inscrição: '+ev.inscricao:'')),
      'END:VEVENT','END:VCALENDAR'];
    var blob=new Blob([linhas.join('\r\n')],{type:'text/calendar;charset=utf-8'});
    var a=h('a',{href:URL.createObjectURL(blob),download:ev.titulo.replace(/\W+/g,'-').toLowerCase()+'.ics'});
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }
  var statusRotulo={'confirmado':'CONFIRMADO','inscricoes-abertas':'INSCRIÇÕES ABERTAS','encerrado':'ENCERRADO'};
  var agendaLista=$('#agenda-lista'),agendaExemplos=$('#agenda-exemplos');
  if(D.eventos&&D.eventos.length){
    agendaExemplos.hidden=true;
    var hoje=new Date();hoje.setHours(0,0,0,0);
    var ordenados=D.eventos.slice().sort(function(a,b){return a.data<b.data?-1:1});
    ordenados.forEach(function(ev){
      var passou=new Date(ev.data+'T23:59:00')<hoje||ev.status==='encerrado';
      var p=ev.projeto?projetoPorId(ev.projeto):null;
      var card=h('article',{class:'card evento'+(passou?' passou':'')},[
        h('span',{class:'badge',text:statusRotulo[ev.status]||'CONFIRMADO'}),
        h('h3',{text:ev.titulo}),
        h('p',{class:'quando',text:fmtData(ev.data)+(ev.hora?' · '+ev.hora:'')+(ev.local?' · '+ev.local:'')}),
        ev.descricao?h('p',{text:ev.descricao}):null
      ]);
      var acoes=h('div',{class:'ev-acoes'});
      if(ev.inscricao&&!passou)acoes.appendChild(h('a',{class:'btn accent',href:ev.inscricao,target:'_blank',rel:'noopener',text:'Inscrever-se ↗'}));
      if(!passou){var b=h('button',{type:'button',class:'btn ghost',text:'Adicionar ao calendário'});b.addEventListener('click',function(){ics(ev)});acoes.appendChild(b)}
      if(p){var v=h('button',{type:'button',class:'btn ghost',text:'Sobre o projeto'});v.addEventListener('click',function(){abrirProjeto(p,true)});acoes.appendChild(v)}
      card.appendChild(acoes);
      card.dataset.passou=passou?'1':'0';
      agendaLista.appendChild(card);
    });
    $('#agenda-toggle').hidden=false;
  }else{
    $('#agenda-vazio').hidden=false;
  }
  var mostrarPassados=false;
  $('#agenda-toggle').addEventListener('click',function(){
    mostrarPassados=!mostrarPassados;
    this.textContent=mostrarPassados?'Ocultar atividades passadas':'Ver atividades passadas';
    agendaLista.classList.toggle('ver-passados',mostrarPassados);
  });

  /* ================= AÇÕES REALIZADAS ================= */
  var acoesLista=$('#acoes-lista');
  if(D.acoes&&D.acoes.length){
    $('#acoes-vazio').hidden=true;
    D.acoes.slice().sort(function(a,b){return a.data<b.data?1:-1}).forEach(function(a){
      var p=a.projeto?projetoPorId(a.projeto):null;
      var kids=[];
      if(a.imagem)kids.push(h('img',{src:a.imagem,alt:a.titulo,loading:'lazy',class:'foto'}));
      if(a.video)kids.push(h('video',{src:a.video,controls:'',preload:'none',class:'foto'}));
      kids.push(h('span',{class:'badge',text:(a.acervo?'ACERVO · ':'')+(p?p.titulo+' · ':'')+(a.periodo||fmtData(a.data))}));
      kids.push(h('h3',{text:a.titulo}));
      if(a.resumo)kids.push(h('p',{text:a.resumo}));
      if(a.resultado)kids.push(h('p',{class:'resultado',text:'Resultado: '+a.resultado}));
      var lk=a.link||a.instagram;
      if(lk)kids.push(h('a',{class:'more',href:lk,target:'_blank',rel:'noopener',text:a.linkTexto||'Ver a publicação no Instagram ↗'}));
      acoesLista.appendChild(h('article',{class:'card acao'},kids));
    });
  }

  /* ================= JORNAL ================= */
  var edLista=$('#edicoes-lista');
  if(D.edicoes&&D.edicoes.length){
    $('#edicoes-vazio').hidden=true;
    D.edicoes.forEach(function(e){
      edLista.appendChild(h('li',{},[
        h('strong',{text:e.titulo}),
        document.createTextNode(e.periodo?' — '+e.periodo:''),
        e.pdf?h('a',{href:e.pdf,target:'_blank',rel:'noopener',text:' Ler ↗'}):null,
        e.resumo?h('span',{class:'ed-resumo',text:e.resumo}):null
      ]));
    });
  }

  /* ================= IMPACTO (vem dos projetos) ================= */
  var stats=$('#stats');
  D.projetos.forEach(function(p){
    (p.resultados||[]).forEach(function(r){
      stats.appendChild(h('div',{class:'stat'},[
        h('b',{text:r.valor}),h('span',{text:r.rotulo}),
        h('small',{text:p.titulo+' · '+r.periodo})
      ]));
    });
  });

  /* ================= MENU / NAVEGAÇÃO ================= */
  var menu=$('#menu'),nav=$('#nav');
  menu.addEventListener('click',function(){
    var ab=nav.classList.toggle('open');menu.setAttribute('aria-expanded',ab);
  });
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
  var links=Array.prototype.slice.call(nav.querySelectorAll('a'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting)links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)});
      });
    },{rootMargin:'-40% 0px -55% 0px'});
    links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
  }

  /* ================= SUGESTÕES ================= */
  var escolhidos=[];
  document.querySelectorAll('#temas .chip').forEach(function(c){
    c.addEventListener('click',function(){
      var on=c.getAttribute('aria-pressed')!=='true';
      c.setAttribute('aria-pressed',on);
      var t=c.textContent,i=escolhidos.indexOf(t);
      if(on&&i<0)escolhidos.push(t);
      if(!on&&i>=0)escolhidos.splice(i,1);
    });
  });
  $('#form').addEventListener('submit',function(e){
    e.preventDefault();
    $('#msg').textContent='Isto é só uma demonstração: nada foi enviado. Para sugerir de verdade, use o botão "Enviar pelo Instagram" ao lado.';
  });
  var dm=$('#dm');
  dm.addEventListener('click',function(e){
    var txt=($('#sug').value||'').trim();
    var corpo=(escolhidos.length?'Tenho interesse em: '+escolhidos.join(', ')+'. ':'')+txt;
    if(corpo&&navigator.clipboard){navigator.clipboard.writeText(corpo).then(function(){$('#msg').textContent='Sua sugestão foi copiada. Cole na conversa que vai abrir no Instagram.'},function(){})}
  });

  renderProjetos();
  abrirDoHash();
})();
