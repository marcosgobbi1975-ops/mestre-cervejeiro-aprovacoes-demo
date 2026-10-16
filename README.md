# Mestre Cervejeiro — Aprovações (DEMONSTRAÇÃO PÚBLICA)

Interface Android PWA pública de demonstração, sem contas, sem telefone armazenado e sem conexão com o sistema real.

**Não existem autorizações reais.** Botão de autorização está desabilitado e nenhuma API é chamada. Não inserir dados pessoais ou senhas. Não é o serviço de segurança.

Instalação Android: abra o site HTTPS no Chrome, menu ⋮, Instalar app/Adicionar à tela inicial.

Status: demonstração estática, sem WhatsApp, sem passkey cadastrada, sem autenticação, sem Gate ou State Machine. A futura autoridade precisa estar em serviço independente sob controle humano.

Arquivos públicos: index.html, app.js, app.css, manifest.webmanifest, service-worker.js, ícones 192 e 512 PNG.

## V1.1 — diagnóstico local

Na aba Segurança, botão 'Verificar meu celular': verifica modo standalone, estado de conexão indicado pelo sistema e disponibilidade do autenticador da plataforma por API WebAuthn, **sem criar ou solicitar credenciais**. O resultado não é prova de biometria cadastrada, identidade ou autorização. Nenhuma informação do diagnóstico é enviada à rede ou armazenada.

## V1.2 — preparação da conexão (não é autenticação)
A aba Segurança exibe um painel de conexão com estados fail-closed: servidor não
conectado, passkey não cadastrada e aprovações reais bloqueadas. Há orientações
para cadastro posterior na **origem HTTPS independente** e um link atualmente
desativado até existir uma autoridade auditada e explicitamente configurada.
Nenhuma chave, senha, dado privado, credencial WebAuthn ou acesso de agentes
é fornecido pelo PWA. A CSP pública conserva \`connect-src 'none'\`.
O identificador/escopo da instalação Android foi preservado; o cache do service worker
passou para v4, incluindo o novo arquivo \`connection.js\`.

Execução da suíte V1.2: \`node --test tests/test_connection_v12.cjs\`.
