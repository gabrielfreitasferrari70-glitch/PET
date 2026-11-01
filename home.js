(function(){'use strict';var P=window.PET;if(!P){return;}
var MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],CAT=P.CAT_TEMA,votados=P.votados,plural=P.plural;
function partes(iso){var d=new Date(iso),f=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Cuiaba',day:'2-digit',month:'numeric'}).formatToParts(d),o={};f.forEach(function(p){o[p.type]=p.value;});return {dia:o.day,mes:MES[(+o.month)-1]};}
var ev=document.getElementById('home-datas');
if(ev){P.get('pet_eventos','select=titulo,inicio,fim,local,dia_inteiro&publicado=eq.true&fim=gte.'+encodeURIComponent(new Date().toISOString())+'&order=inicio.asc&limit=3').then(function(rows){
 if(!rows.length){ev.innerHTML=`<li class='empty-state'>Nenhuma data marcada agora. Assine a agenda para saber quando sair a próxima.</li>`;return;}
 ev.innerHTML=rows.map(function(r){var a=partes(r.inicio),b=partes(new Date(new Date(r.fim).getTime()-60000).toISOString()),varios=!(a.dia===b.dia&&a.mes===b.mes),agora=new Date(r.inicio)<=new Date();
  return `<li><a href='/agenda/'><span class='hd-data'><b>${P.esc(a.dia)}</b><small>${P.esc(a.mes)}</small></span><span class='hd-txt'><strong>${P.esc(r.titulo)}</strong><small>${agora?"<span class='selo-agora'>Acontecendo agora</span>":''}${varios?'até '+P.esc(b.dia+' de '+b.mes)+' · ':''}${P.esc(r.local||'Local a confirmar')}</small></span></a></li>`;}).join('');})
 .catch(function(){ev.innerHTML=`<li class='empty-state'>Não foi possível carregar as datas agora. <a class='text-link' href='/agenda/'>Abrir a agenda</a></li>`;});}
var tl=document.getElementById('home-temas');
function temaTopo(){var alvo=document.getElementById('hm-tema-topo'),it=document.querySelector('#home-temas .tema-item');if(!alvo||!it){return;}var p=it.querySelector('p'),c=it.querySelector('.voto-n'),n=c?parseInt(c.getAttribute('data-n'),10)||0:0;if(!p||n<1){alvo.hidden=true;return;}var s=document.createElement('strong');s.textContent=p.textContent.replace(/^\s*\d+\s*/,'').trim();var a=document.createElement('a');a.className='text-link';a.href='/comunidade/?tipo=tema';a.textContent='Votar ou sugerir →';alvo.textContent='';alvo.append('Tema mais votado agora ('+plural(n)+'): ',s,'. ',a);alvo.hidden=false;}
if(tl){P.get('pet_sugestoes','select=id,tema,categoria,votos&status=eq.aprovada&order=votos.desc,criado_em.asc&limit=3').then(function(rows){var v=votados();
 if(!rows.length){tl.innerHTML=`<li class='empty-state'>Nenhum tema ainda. Sugira o primeiro.</li>`;return;}
 var soma=rows.reduce(function(a,r){return a+r.votos;},0);tl.innerHTML=rows.map(function(r,i){var ja=v.indexOf(r.id)>=0;return `<li class='tema-item'><div><p>${soma>=20?`<span class='pos'>${i+1}</span>`:''}${P.esc(r.tema)}</p><span class='chip'>${P.esc(CAT[r.categoria]||'Outro tema')}</span></div><div class='voto-col'><button type='button' class='voto' data-voto='${P.esc(r.id)}' aria-pressed='${ja}'${ja?' disabled':''} aria-label='${ja?'Você votou em':'Eu também quero saber sobre'}: ${P.esc(r.tema)}. ${plural(r.votos)}'>${ja?'Votado':'Eu também'}</button><span class='voto-n' data-n='${r.votos}'>${plural(r.votos)}</span></div></li>`;}).join('');temaTopo();})
 .catch(function(){tl.innerHTML=`<li class='empty-state'>Não foi possível carregar os temas agora.</li>`;});
 tl.addEventListener('click',function(e){var b=e.target.closest('[data-voto]');if(!b||b.disabled){return;}var id=b.getAttribute('data-voto');b.disabled=true;
  P.votar(id).then(function(n){P.marcaVoto(id);b.setAttribute('aria-pressed','true');b.textContent='Votado';var c=b.parentNode.querySelector('.voto-n');c.setAttribute('data-n',n);c.textContent=plural(n);temaTopo();})
  .catch(function(err){if(err&&err.message&&err.message.indexOf('Voce ja')===0){P.marcaVoto(id);b.setAttribute('aria-pressed','true');return;}b.disabled=false;});});}
})();
/* Carrossel da abertura */
(function(){var c=document.querySelector('.hm-car');if(!c){return;}
var sl=[].slice.call(c.querySelectorAll('.hm-slide')),pt=[].slice.call(c.querySelectorAll('[data-ir]')),pausa=c.querySelector('[data-car="pausa"]'),i=0,t=null,parado=window.matchMedia('(prefers-reduced-motion: reduce)').matches,manual=false;
function vai(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){var on=k===i;s.hidden=!on;s.classList.toggle('is-on',on);s.querySelectorAll('a').forEach(function(a){a.tabIndex=on?0:-1;});});pt.forEach(function(p,k){if(k===i){p.setAttribute('aria-current','true');}else{p.removeAttribute('aria-current');}});}
function para(){clearInterval(t);t=null;}
function roda(){para();if(!parado&&!manual){t=setInterval(function(){vai(i+1);},6000);}}
function estado(){pausa.textContent=manual?'▶':'Ⅱ';pausa.setAttribute('aria-label',manual?'Retomar troca automática':'Pausar troca automática');}
c.addEventListener('click',function(e){var b=e.target.closest('button');if(!b){return;}
 if(b.hasAttribute('data-ir')){vai(+b.getAttribute('data-ir'));roda();}
 else if(b.getAttribute('data-car')==='ant'){vai(i-1);roda();}
 else if(b.getAttribute('data-car')==='prox'){vai(i+1);roda();}
 else if(b.getAttribute('data-car')==='pausa'){manual=!manual;estado();roda();}});
c.addEventListener('mouseenter',para);c.addEventListener('mouseleave',roda);
c.addEventListener('focusin',para);c.addEventListener('focusout',function(e){if(!c.contains(e.relatedTarget)){roda();}});
if(parado){manual=true;estado();}roda();})();
