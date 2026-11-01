// Roda antes do CSS: aplica a escolha guardada ou, sem escolha, o tema do sistema, evitando clarao ao abrir a pagina.
(function(){var t;try{t=JSON.parse(localStorage.getItem('pet-reading-plus')||'{}').theme}catch(e){}
if(t!=='paper'&&t!=='sepia'&&t!=='dark')t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'paper';
if(t!=='paper')document.documentElement.setAttribute('data-reading-theme',t)})();
