/* Conteúdo externo é carregado somente por escolha explícita, sem consentimento persistente. */
(() => {
  'use strict';
  // Devolve o foco ao controle de busca quando o diálogo é fechado.
  const searchDialog = document.getElementById('search-dialog');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && searchDialog?.open) {
      event.preventDefault();
      searchDialog.close();
    }
  }, true);
  searchDialog?.addEventListener('close', () => {
    document.getElementById('search-open')?.focus();
  });
  document.querySelectorAll('iframe[data-privacy-src]').forEach(frame => {
    const placeholder = frame.previousElementSibling;
    const button = placeholder?.querySelector('[data-load-embed]');
    if (!button) return;
    const hide = document.createElement('button');
    hide.type = 'button';
    hide.className = 'text-link privacy-hide-embed';
    hide.textContent = 'Ocultar publicação e interromper a conexão';
    hide.hidden = true;
    frame.after(hide);
    button.addEventListener('click', () => {
      let url;
      try { url = new URL(frame.dataset.privacySrc); } catch { return; }
      if (url.origin !== 'https://www.instagram.com' || !/^\/p\/[A-Za-z0-9_-]+\/embed\/$/.test(url.pathname)) return;
      frame.src = url.href;
      frame.hidden = false;
      placeholder.hidden = true;
      hide.hidden = false;
      hide.focus();
    });
    hide.addEventListener('click', () => {
      frame.removeAttribute('src');
      frame.hidden = true;
      placeholder.hidden = false;
      hide.hidden = true;
      button.focus();
    });
  });

  const form = document.getElementById('contact-form');
  form?.addEventListener('reset', () => {
    setTimeout(() => {
      form.dispatchEvent(new Event('input', {bubbles:true}));
      document.getElementById('contact-feedback').textContent = 'Campos limpos nesta página. A área de transferência não foi alterada.';
    }, 0);
  });

  const clear = document.querySelector('[data-clear-local]');
  const feedback = document.getElementById('privacy-storage-status');
  if (feedback && location.hash === '#preferencias-redefinidas') feedback.textContent = 'Favoritos, progresso e preferências foram redefinidos neste navegador. As preferências padrão podem ser gravadas novamente.';
  clear?.addEventListener('click', () => {
    try {
      ['pet-conecta-salvos','pet-conecta-aprendizado','pet-conecta-leitura','pet-reading','pet-reading-plus'].forEach(key => localStorage.removeItem(key));
      Object.keys(sessionStorage).filter(key => key.startsWith('pet-scroll:')).forEach(key => sessionStorage.removeItem(key));
      location.hash = 'preferencias-redefinidas';
      location.reload();
    } catch {
      feedback.textContent = 'O navegador não permitiu redefinir os dados. Use as configurações do navegador para limpar os dados deste site.';
    }
  });
})();
