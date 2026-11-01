(function(){'use strict';
var raiz=document.getElementById('rd-raiz'),P=window.PET;if(!raiz||!P){return;}
var TEMAS=['Comunicação','Cultura','Educação em saúde','Humanização','Integração','Solidariedade'];
function json(u){return fetch(u).then(function(r){if(!r.ok){throw new Error();}return r.json();});}
function ancora(t){return P.norm(t).replace(/\s+/g,'-');}
Promise.all([json('/projetos-dados.json'),json('/redes-dados.json')]).then(function(v){var D=v[0],R=v[1],nav=[],h='';
 TEMAS.forEach(function(t){var b='';
  Object.keys(D).forEach(function(s){if(D[s].tema!==t){return;}var l=P.listasRedes(R[s]||{},'h4');if(l){b+='<div class="rd-projeto"><h3><a href="/projetos/'+P.esc(s)+'/">'+P.esc(D[s].nome)+' <span aria-hidden="true">→</span></a></h3>'+l+'</div>';}});
  if(b){nav.push('<a href="#'+ancora(t)+'">'+P.esc(t)+'</a>');h+='<section id="'+ancora(t)+'" class="pj-sec rd-tema"><h2>'+P.esc(t)+'</h2>'+b+'</section>';}});
 if(!h){throw new Error();}
 raiz.innerHTML='<nav class="pj-nav" aria-label="Temas">'+nav.join('')+'</nav>'+h;
 if(location.hash){var el=document.getElementById(location.hash.slice(1));if(el){el.scrollIntoView();}}
}).catch(function(){raiz.innerHTML='<p class="empty-state">Não foi possível carregar os posts e vídeos agora. Veja o <a class="text-link" href="https://www.instagram.com/petmedicina.ufmt/" target="_blank" rel="noopener noreferrer">Instagram</a> e o <a class="text-link" href="https://www.youtube.com/@petmedicina-ufmt3590" target="_blank" rel="noopener noreferrer">YouTube</a> do PET.</p>';});
})();
