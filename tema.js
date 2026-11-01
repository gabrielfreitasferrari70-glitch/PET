// Roda antes do CSS: aplica a escolha guardada, evitando clarao ao abrir a pagina. Sem escolha, fica o tema claro.
(function(){var t;try{t=JSON.parse(localStorage.getItem('pet-reading-plus')||'{}').theme}catch(e){}
if(t==='sepia'||t==='dark')document.documentElement.setAttribute('data-reading-theme',t)})();
