'use strict';
/* Mestre Aprova V1.2 — public, untrusted PWA presentation only.
 * This app does not register passkeys, approve tasks or send credentials.
 * Authority link is disabled until an independent HTTPS service is audited.
 */
(() => {
  const APPROVED_AUTHORITY_ORIGIN = 'https://aprova.levume.com';
  const CONFIGURED_AUTHORITY_URL = null; // Fail-closed until separate deployment.
  const $ = id => document.getElementById(id);

  function trustedAuthority(value) {
    if (typeof value !== 'string') return null;
    try {
      const target = new URL(value);
      if (target.origin !== APPROVED_AUTHORITY_ORIGIN || target.pathname !== '/' ||
          target.search || target.hash || target.username || target.password)
        return null;
      return target.href;
    } catch {
      return null;
    }
  }

  const details = $('connection-details');
  const toggle = $('connection-details-toggle');
  const link = $('authority-entry');
  const note = $('connection-note');
  const server = $('server-connect-state');
  const passkey = $('passkey-connect-state');
  const agents = $('agents-connect-state');
  if (!details || !toggle || !link || !note || !server || !passkey || !agents) return;

  // Android capability != identity confirmation or registered passkey.
  server.textContent = 'Não conectado';
  passkey.textContent = 'Não cadastrada';
  agents.textContent = 'Bloqueadas';
  link.hidden = true;
  link.removeAttribute('href');
  link.rel = 'noopener noreferrer';
  link.target = '_blank';

  const allowed = trustedAuthority(CONFIGURED_AUTHORITY_URL);
  if (allowed) {
    link.href = allowed;
    link.hidden = false;
    server.textContent = 'Portal configurado · não autenticado';
    note.textContent = 'A autenticação ocorre somente no portal HTTPS independente. Este aplicativo nunca aprova tarefas.';
  } else {
    note.textContent = 'O portal seguro ainda não foi publicado. Nunca envie códigos ou senhas por este demonstrativo.';
  }

  toggle.setAttribute('aria-expanded', 'false');
  details.hidden = true;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    details.hidden = expanded;
    toggle.textContent = expanded ? 'Entenda os próximos passos' : 'Ocultar orientações';
  });
})();
