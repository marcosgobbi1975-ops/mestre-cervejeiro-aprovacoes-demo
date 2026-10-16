'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const text = f => fs.readFileSync(path.join(root, f), 'utf8');
const js = text('connection.js');
const html = text('index.html');
const sw = text('service-worker.js');
const manifest = JSON.parse(text('manifest.webmanifest'));
const readme = text('README.md');

function element() {
  const attrs = new Map();
  const handlers = {};
  return {
    textContent: '', hidden: false, href: undefined, rel: '', target: '',
    setAttribute(name, value) { attrs.set(name, value); },
    getAttribute(name) { return attrs.get(name); },
    removeAttribute(name) { if (name === 'href') this.href = undefined; attrs.delete(name); },
    addEventListener(name, fn) { handlers[name] = fn; },
    fire(name) { handlers[name]?.(); }
  };
}
function run() {
  const ids = ['connection-details', 'connection-details-toggle', 'authority-entry',
    'connection-note', 'server-connect-state', 'passkey-connect-state', 'agents-connect-state'];
  const ui = Object.fromEntries(ids.map(id => [id, element()]));
  let networkCalls = 0;
  const ctx = { URL, document: { getElementById: id => ui[id] },
    fetch() { networkCalls++; throw Error('Network forbidden'); },
    navigator: {credentials: {create() {throw Error('Credential forbidden');}}}
  };
  vm.runInNewContext(js, ctx, {timeout: 200});
  return {ui, networkCalls};
}

test('version in diagnostic', () => assert.match(html, /VERSÃO 1\.2/));
test('Android diagnostic preserved', () => assert.match(html, /id="check-device"/));
test('PWA id preserved', () => assert.equal(manifest.id, './'));
test('PWA scope preserved', () => assert.equal(manifest.scope, './'));
test('PWA start URL preserved', () => assert.equal(manifest.start_url, './'));
test('standalone mode preserved', () => assert.equal(manifest.display, 'standalone'));
test('legacy app script retained', () => assert.match(html, /src="app\.js" defer/));
test('new script loaded', () => assert.match(html, /src="connection\.js" defer/));
test('service worker caches new script', () => assert.match(sw, /\.\/connection\.js/));
test('service worker bumped', () => assert.match(sw, /demo-v4/));
test('API calls disabled by CSP', () => assert.match(html, /connect-src 'none'/));
test('form posts disabled by CSP', () => assert.match(html, /form-action 'none'/));
test('script does not create credentials', () => assert.doesNotMatch(js, /navigator\.credentials\.(get|create)\s*\(/));
test('script does not store tokens', () => assert.doesNotMatch(js, /APPROVAL_SETUP_TOKEN|localStorage|sessionStorage/));
test('script makes no fetch requests', () => assert.doesNotMatch(js, /\bfetch\s*\(/));
test('authority starts unset', () => assert.match(js, /CONFIGURED_AUTHORITY_URL = null/));
test('UI marks approvals blocked', () => assert.match(html, /Aprovações reais continuam bloqueadas/));
test('sample approval button remains locked', () => assert.match(html, /class="locked" type="button" disabled/));
test('README explains V1.2', () => assert.match(readme, /V1\.2/));
test('all statuses deny connection', () => {
  const {ui, networkCalls} = run();
  assert.equal(networkCalls, 0);
  assert.equal(ui['server-connect-state'].textContent, 'Não conectado');
  assert.equal(ui['passkey-connect-state'].textContent, 'Não cadastrada');
  assert.equal(ui['agents-connect-state'].textContent, 'Bloqueadas');
});
test('no fake authority link', () => {
  const {ui} = run();
  assert.equal(ui['authority-entry'].hidden, true);
  assert.equal(ui['authority-entry'].href, undefined);
});
test('future link isolated in top-level browsing', () => {
  const {ui} = run();
  assert.equal(ui['authority-entry'].target, '_blank');
  assert.equal(ui['authority-entry'].rel, 'noopener noreferrer');
});
test('instructions start collapsed', () => {
  const {ui} = run();
  assert.equal(ui['connection-details'].hidden, true);
  assert.equal(ui['connection-details-toggle'].getAttribute('aria-expanded'), 'false');
});
test('instructions open on tap', () => {
  const {ui} = run(); ui['connection-details-toggle'].fire('click');
  assert.equal(ui['connection-details'].hidden, false);
  assert.equal(ui['connection-details-toggle'].getAttribute('aria-expanded'), 'true');
});
test('instructions close on second tap', () => {
  const {ui} = run(); ui['connection-details-toggle'].fire('click');
  ui['connection-details-toggle'].fire('click');
  assert.equal(ui['connection-details'].hidden, true);
  assert.equal(ui['connection-details-toggle'].getAttribute('aria-expanded'), 'false');
});
