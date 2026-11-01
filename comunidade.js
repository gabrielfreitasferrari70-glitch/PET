(function(){'use strict';var P=window.PET;if(!P){return;}
var ALIAS='0c6a077896ce402455ad91693ad6b897',VK='pet-conecta-votos',soma=0,ntemas=0;
var CAT={infancia:'Saúde da criança','saude-sexual':'Saúde sexual','saude-mental':'Saúde mental',inclusao:'Inclusão',outro:'Outro tema'};
var TIPOS={
 duvida:{nome:'Dúvida de saúde',titulo:'Sua dúvida',rotulo:'Qual é a sua dúvida?',ph:'Ex.: quem pode doar sangue?',assunto:true,min:10,max:1000,subj:'nova dúvida de saúde',nomeRot:'Seu nome (opcional)',contRot:'Telefone ou e-mail para resposta (opcional)',contObr:false,ok:'Dúvida enviada! Se você deixou um contato, a resposta chega por lá.'},
 tema:{nome:'Sugestão de tema',titulo:'Sugerir um tema',rotulo:'Sobre o que você gostaria de entender melhor?',ph:'Ex.: como saber se meu filho precisa de óculos',assunto:true,min:5,max:280,subj:'novo tema sugerido',nomeRot:'Seu nome (opcional)',contRot:'Telefone ou e-mail (opcional)',contObr:false,ok:'Recebido! Se fizer sentido, o tema entra na votação ao lado.'},
 mensagem:{nome:'Mensagem',titulo:'Sua mensagem',rotulo:'O que você quer dizer ao PET?',ph:'Ex.: participei do Trote Solidário e queria agradecer…',assunto:false,min:5,max:1500,subj:'nova mensagem',nomeRot:'Seu nome (opcional)',contRot:'Telefone ou e-mail (opcional)',contObr:false,ok:'Mensagem enviada. Obrigado por escrever!'},
 parceria:{nome:'Proposta de parceria',titulo:'Sua proposta',rotulo:'Conte a demanda ou a ideia',ph:'Ex.: somos uma escola do bairro e gostaríamos de uma ação sobre saúde visual com os alunos…',assunto:false,min:20,max:1500,subj:'nova proposta de parceria',nomeRot:'Seu nome e instituição',contRot:'Telefone ou e-mail para retorno (obrigatório)',contObr:true,ok:'Proposta enviada! A resposta chega pelo contato que você informou.'}
};
function $(id){return document.getElementById(id);}
function post(path,body){return fetch(P.BASE+path,{method:'POST',headers:{apikey:P.KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null;}catch(e){}if(!r.ok){throw new Error((j&&j.message)||('Erro '+r.status));}return j;});});}
function enviar(d){return fetch('https://formsubmit.co/ajax/'+ALIAS,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},referrerPolicy:'strict-origin-when-cross-origin',body:JSON.stringify(d)}).then(function(r){return r.json().catch(function(){return {};}).then(function(j){if(!r.ok||String(j.success)!=='true'){throw new Error(j.message||('Erro '+r.status));}return j;});});}
var atual='duvida',t=$('fale-texto'),cnt=$('fale-cnt'),msg=$('fale-msg'),btn=$('fale-enviar');
function msgEstado(c,txt){msg.className='com-msg'+(c?' '+c:'');msg.textContent=txt;}
function tipo(k){if(!TIPOS[k]){k='duvida';}atual=k;var o=TIPOS[k];
 document.querySelectorAll('[data-tipo]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-tipo')===k?'true':'false');});
 $('fale-titulo').textContent=o.titulo;$('fale-rotulo').textContent=o.rotulo;t.placeholder=o.ph;t.maxLength=o.max;
 if(t.value.length>o.max){t.value=t.value.slice(0,o.max);}cnt.textContent=t.value.length+'/'+o.max;
 $('fale-assunto').hidden=!o.assunto;$('fale-nome-rot').textContent=o.nomeRot;$('fale-cont-rot').textContent=o.contRot;
 $('fale-contato').required=o.contObr;$('fale-aviso-saude').hidden=k!=='duvida';msgEstado('','');}
document.querySelectorAll('[data-tipo]').forEach(function(b){b.addEventListener('click',function(){tipo(b.getAttribute('data-tipo'));if(window.matchMedia('(max-width:760px)').matches||b.classList.contains('fale-link')){$('fale-form').scrollIntoView({behavior:'smooth',block:'start'});}t.focus({preventScroll:true});});});
if(t){t.addEventListener('input',function(){cnt.textContent=t.value.length+'/'+TIPOS[atual].max;});
 btn.addEventListener('click',function(){var o=TIPOS[atual],v=t.value.trim(),nome=$('fale-nome').value.trim(),cont=$('fale-contato').value.trim();msgEstado('','');
  if($('fale-hp').value){msgEstado('ok',o.ok);return;}
  if(v.length<o.min){msgEstado('erro','Escreva pelo menos '+o.min+' caracteres.');t.focus();return;}
  if(o.contObr&&cont.length<6){msgEstado('erro','Informe um telefone ou e-mail para o PET responder.');$('fale-contato').focus();return;}
  var cat=$('fale-cat').value,d={_subject:'PET Conecta: '+o.subj+(o.assunto?' · '+(CAT[cat]||'Outro tema'):''),_template:'table',_captcha:'false',Tipo:o.nome};
  if(o.assunto){d.Assunto=CAT[cat]||'Outro tema';}
  d.Mensagem=v;d.Nome=nome||'(não informado)';d.Contato=cont||'(não informado)';d.Enviado_em=new Date().toLocaleString('pt-BR',{timeZone:'America/Cuiaba'});
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cont)){d._replyto=cont;}
  btn.disabled=true;msgEstado('','Enviando…');
  enviar(d).then(function(){t.value='';$('fale-nome').value='';$('fale-contato').value='';cnt.textContent='0/'+o.max;msgEstado('ok',o.ok);})
  .catch(function(){msgEstado('erro','Não foi possível enviar agora. Tente novamente em instantes.');})
  .then(function(){btn.disabled=false;});});
 var q=new URLSearchParams(location.search).get('tipo')||location.hash.replace('#','');tipo(TIPOS[q]?q:'duvida');}
function votados(){try{var v=JSON.parse(localStorage.getItem(VK)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
function marca(id){try{var v=votados();v.push(id);localStorage.setItem(VK,JSON.stringify(v));}catch(e){}}
var lista=$('temas-lista'),total=$('temas-total'),tmsg=$('temas-msg');
function plural(n){return n+(n===1?' voto':' votos');}
function mostraTotal(){total.textContent=plural(soma)+' em '+ntemas+' temas';}
function botao(r,ja){return `<button type='button' class='voto' data-voto='${P.esc(r.id)}' data-tema='${P.esc(r.tema)}' aria-pressed='${ja?'true':'false'}'${ja?' disabled':''} aria-label='${ja?'Você votou em':'Eu também quero saber sobre'}: ${P.esc(r.tema)}. ${plural(r.votos)}'>${ja?'Votado':'Eu também'} <b>${r.votos}</b></button>`;}
function temas(){if(!lista){return;}P.get('pet_sugestoes','select=id,tema,categoria,votos,origem&status=eq.aprovada&order=votos.desc,criado_em.asc').then(function(rows){var v=votados();
 if(!rows.length){lista.innerHTML=`<li class='empty-state'>Nenhum tema na votação ainda. Sugira o primeiro.</li>`;total.textContent='';return;}
 lista.innerHTML=rows.map(function(r,i){return `<li class='tema-item'><div><p><span class='pos'>${i+1}</span>${P.esc(r.tema)}</p><span class='chip'>${P.esc(CAT[r.categoria]||'Outro tema')}</span></div>${botao(r,v.indexOf(r.id)>=0)}</li>`;}).join('');
 soma=rows.reduce(function(a,r){return a+r.votos;},0);ntemas=rows.length;mostraTotal();})
 .catch(function(){lista.innerHTML=`<li class='empty-state'>Não foi possível carregar os temas agora. Tente novamente em instantes.</li>`;});}
if(lista){lista.addEventListener('click',function(e){var b=e.target.closest('[data-voto]');if(!b||b.disabled){return;}var id=b.getAttribute('data-voto');b.disabled=true;tmsg.className='com-msg';tmsg.textContent='';
 post('/rest/v1/rpc/pet_votar_tema',{p_id:id}).then(function(n){marca(id);soma++;mostraTotal();b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Você votou em: '+b.getAttribute('data-tema')+'. '+plural(n));b.innerHTML='Votado <b>'+n+'</b>';tmsg.className='com-msg ok';tmsg.textContent='Voto registrado. Obrigado!';})
 .catch(function(err){if(err.message.indexOf('Voce ja')===0){marca(id);b.setAttribute('aria-pressed','true');tmsg.className='com-msg ok';tmsg.textContent='Você já votou neste tema. Obrigado!';return;}b.disabled=false;tmsg.className='com-msg erro';tmsg.textContent=err.message.indexOf('Muitos')===0?err.message:'Não foi possível registrar o voto agora.';});});}
temas();})();
