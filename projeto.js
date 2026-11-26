(function(){'use strict';
var raiz=document.getElementById('pj-raiz'),P=window.PET;if(!raiz||!P){return;}
// Paginas geradas por ferramentas/gerar-projetos.py ja vem completas no HTML.
if(raiz.hasAttribute('data-gerado')){return;}
var esc=P.esc,ext=P.la,seta=P.seta;
function url(u){return P.safeUrl(u)||'#';}
var slug=location.pathname.split('/').filter(Boolean).pop();
function blocoRedes(r){var l=P.listasRedes(r,'h3');return l?'<section id="redes" class="pj-sec"><h2>Nas redes</h2>'+l+'</section>':'';}
function blocoSaiba(s){
 if(!s){return '';}
 var h='<section id="saiba" class="pj-sec pj-saiba"><h2>Saiba mais</h2>';
 if(s.porque&&s.porque.length){h+='<h3>Por que este projeto existe</h3>'+s.porque.map(function(t){return '<p>'+esc(t)+'</p>';}).join('');}
 if(s.objetivos&&s.objetivos.length){h+='<h3>Objetivos</h3><ul class="pj-obj">'+s.objetivos.map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul>';}
 if(s.etapas&&s.etapas.length){h+='<h3>Passo a passo, em detalhe</h3><ol class="pj-etapas">'+s.etapas.map(function(e){return '<li><strong>'+esc(e[0])+'</strong><span>'+esc(e[1])+'</span></li>';}).join('')+'</ol>';}
 if(s.termos&&s.termos.length){h+='<h3>Palavras que ajudam a entender</h3><dl class="pj-termos">'+s.termos.map(function(t){return '<div><dt>'+esc(t[0])+'</dt><dd>'+esc(t[1])+'</dd></div>';}).join('')+'</dl>';}
 if(s.edicoes&&s.edicoes.length){h+='<h3>Edição por edição</h3><div class="pj-eds">'+s.edicoes.map(function(e){return '<details class="pj-det"><summary><span class="pj-det-ano">'+esc(e[0])+'</span><span class="pj-det-tit">'+esc(e[1])+'</span></summary><p>'+esc(e[2])+'</p><a class="text-link" href="'+esc(url(e[3]))+'"'+ext(e[3])+'>Ver proposta no SIEx '+seta(e[3])+'</a></details>';}).join('')+'</div>';}
 return h+'<p class="hm-nota">Texto escrito a partir das propostas e dos relatórios que o próprio PET registrou no SIEx, o sistema de extensão da UFMT. Os números são os que o grupo relatou.</p></section>';
}
function falhou(){raiz.innerHTML='<header class="pj-cab"><h1>Projeto não encontrado</h1><p class="pj-lead">Veja a lista completa de projetos.</p></header><p><a class="button" href="/projetos/">Ver os projetos</a></p>';}
var redesPedido=fetch('/redes-dados.json').then(function(r){return r.ok?r.json():{};}).catch(function(){return {};});
fetch('/projetos-dados.json').then(function(r){if(!r.ok){throw new Error();}return r.json();}).then(function(D){return redesPedido.then(function(R){
 var p=D[slug];if(!p){falhou();return;}
 var redes=blocoRedes(R[slug]||{});
 var nav=[['oque','O que é'],['quem','Para quem'],['como','Como funciona']];
 if(p.saiba){nav.push(['saiba','Saiba mais']);}nav.push(['anos','Ano a ano']);
 if(p.mats){nav.push(['mat','Materiais']);}if(redes){nav.push(['redes','Nas redes']);}nav.push(['part','Como participar']);
 var h='';
 h+='<header class="pj-cab"><span class="eyebrow">'+esc(p.tema.toUpperCase())+'</span><h1>'+esc(p.nome)+'</h1><p class="pj-lead">'+esc(p.resumo)+'</p><p class="pj-status"><span class="chip">'+esc(p.status)+'</span></p></header>';
 if(p.capa){h+='<figure class="pj-capa"><img src="'+esc(url(p.capa.src))+'" alt="'+esc(p.capa.alt)+'" width="1600" height="900" loading="eager" decoding="async"></figure>';}
 h+='<nav class="pj-nav" aria-label="Nesta página">'+nav.map(function(n){return '<a href="#'+n[0]+'">'+n[1]+'</a>';}).join('')+'</nav>';
 h+='<section id="oque" class="pj-sec"><h2>O que é</h2><p>'+esc(p.oque)+'</p></section>';
 h+='<section id="quem" class="pj-sec"><h2>Para quem</h2><p>'+esc(p.quem)+'</p></section>';
 h+='<section id="como" class="pj-sec"><h2>Como funciona</h2><ol class="pj-passos">'+p.passos.map(function(t,i){return '<li><b>'+(i+1)+'</b><span>'+esc(t)+'</span></li>';}).join('')+'</ol>';
 if(p.nums){h+='<ul class="pj-nums" aria-label="Resultados documentados">'+p.nums.map(function(n){return '<li><strong>'+esc(n[0])+'</strong><span>'+esc(n[1])+'</span><small>'+esc(n[2])+'</small></li>';}).join('')+'</ul>';}
 h+='</section>';
 h+=blocoSaiba(p.saiba);
 h+='<section id="anos" class="pj-sec"><h2>Ano a ano</h2><ol class="pj-hist">'+p.hist.map(function(r){return '<li><span class="pj-ano">'+esc(r[0])+'</span><div><h3>'+esc(r[1])+'</h3><p>'+esc(r[2])+'</p><a class="text-link" href="'+esc(url(r[3]))+'"'+ext(r[3])+'>Ver registro '+seta(r[3])+'</a></div></li>';}).join('')+'</ol>'+(p.nd?'<p class="pj-nd">'+esc(p.nd)+'</p>':'')+'</section>';
 if(p.mats){h+='<section id="mat" class="pj-sec"><h2>Materiais</h2><ul class="pj-mats">'+p.mats.map(function(m){return '<li><a href="'+esc(url(m[1]))+'">'+esc(m[0])+' <span aria-hidden="true">→</span></a></li>';}).join('')+'</ul></section>';}
 h+=redes;
 var pl=p.partlink;
 h+='<section id="part" class="pj-sec pj-part"><h2>Como participar</h2><p>'+esc(p.part)+'</p><div class="part-acoes">'+(pl?'<a class="button" href="'+esc(url(pl[0]))+'">'+esc(pl[1])+' <span aria-hidden="true">'+seta(pl[0])+'</span></a>':'')+'<a class="button'+(pl?' secondary':'')+'" href="/comunidade/?tipo=duvida">Perguntar ao PET <span aria-hidden="true">→</span></a></div></section>';
 h+='<section class="pj-sec pj-fontes"><h2>Fontes</h2><ul>'+p.fontes.map(function(f){return '<li><a class="text-link" href="'+esc(url(f[1]))+'"'+ext(f[1])+'>'+esc(f[0])+' '+seta(f[1])+'</a></li>';}).join('')+'</ul><p class="hm-nota">Informações tiradas do perfil público do PET e de páginas oficiais. Onde não há registro, a página diz isso. Para confirmar datas e vagas, use os canais oficiais.</p></section>';
 h+='<section class="pj-sec pj-acompanhe" id="acompanhe"><h2>Acompanhe</h2><p>Os registros mais recentes do PET saem no Instagram e no YouTube oficiais do grupo.</p><p><a class="text-link" href="https://www.instagram.com/petmedicina.ufmt/" target="_blank" rel="noopener noreferrer">Abrir o Instagram do PET ↗</a> · <a class="text-link" href="https://www.youtube.com/@petmedicina-ufmt3590" target="_blank" rel="noopener noreferrer">Abrir o canal no YouTube ↗</a></p><p><a class="text-link" href="/redes/">Ver os posts e vídeos de todos os projetos →</a></p></section>';
 raiz.innerHTML=h;document.title=p.nome.replace(/\u2011/g,'-')+' · PET Conecta';
 var d=document.querySelector('meta[name="description"]');if(d){d.setAttribute('content',p.resumo);}
 if(location.hash){var el=document.getElementById(location.hash.slice(1));if(el){el.scrollIntoView();}}
});}).catch(falhou);
})();
