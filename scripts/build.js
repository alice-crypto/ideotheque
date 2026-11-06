#!/usr/bin/env node
/*
 * Construit la bibliothèque à partir de src/ :
 *   dist/fx.css, dist/fx.js   — le moteur et les 500 premiers effets (packs 00 à 22)
 *   dist/packs/<pack>.*       — chaque pack suivant, à charger selon ses besoins
 *   dist/fx-all.css, fx-all.js — toute la bibliothèque, utilisée par le catalogue
 *   dist/catalog.js           — les données du catalogue (index.html)
 *   effects/<nom>.md          — une fiche par effet
 *   AI.md, README.md          — tableaux régénérés entre leurs balises <!-- … -->
 *   plugin/                   — le plugin Claude, seulement avec --plugin (voir plus bas)
 * Usage : node scripts/build.js [--plugin]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PACKS = path.join(SRC, 'packs');
const read = (p) => fs.readFileSync(p, 'utf8');
// Sous Windows, un fichier peut être brièvement verrouillé (antivirus, indexation) : on réessaie
function write(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  for (let attempt = 0; ; attempt++) {
    try { fs.writeFileSync(p, s); return; } catch (err) {
      if (attempt >= 5) throw err;
      const until = Date.now() + 200;
      while (Date.now() < until) { /* attente active courte */ }
    }
  }
}

const CATEGORIES = [
  'Entrée', 'Texte', 'Présentation', 'Micro-interaction', 'Défilement',
  'Transition', 'Image', 'Navigation', 'Ambiance', 'État'
];
const REDUCED_DEFAULT = "Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.";

const files = fs.readdirSync(PACKS).sort();
const cssFiles = files.filter((f) => f.endsWith('.css'));
const jsFiles = files.filter((f) => f.endsWith('.js') && !f.endsWith('.meta.js'));
const metaFiles = files.filter((f) => f.endsWith('.meta.js'));

// --- dist/fx.css et dist/fx.js ----------------------------------------------

// Les packs 00 à 22 forment fx.css et fx.js : leur poids reste stable pour les sites déjà en ligne
const CORE_LAST = 22;
const isCore = (f) => parseInt(f, 10) <= CORE_LAST;
const coreCss = read(path.join(SRC, 'core.css'));
const endCss = read(path.join(SRC, 'core.end.css'));
const coreJs = read(path.join(SRC, 'core.js'));
const BOOT = 'window.FX._boot();\n';
const joinCss = (list) => [coreCss].concat(list.map((f) => read(path.join(PACKS, f)))).concat(endCss).join('\n');
const joinJs = (list) => [coreJs].concat(list.map((f) => read(path.join(PACKS, f)))).concat(BOOT).join('\n');

const css = joinCss(cssFiles.filter(isCore));
write(path.join(ROOT, 'dist/fx.css'), css);
write(path.join(ROOT, 'dist/fx.js'), joinJs(jsFiles.filter(isCore)));

const cssAll = joinCss(cssFiles);
const js = joinJs(jsFiles);
write(path.join(ROOT, 'dist/fx-all.css'), cssAll);
write(path.join(ROOT, 'dist/fx-all.js'), js);

cssFiles.filter((f) => !isCore(f)).forEach((f) => write(path.join(ROOT, 'dist/packs', f), read(path.join(PACKS, f))));
jsFiles.filter((f) => !isCore(f)).forEach((f) => write(path.join(ROOT, 'dist/packs', f), read(path.join(PACKS, f))));

// --- Métadonnées -------------------------------------------------------------

const effects = [];
const problems = [];
metaFiles.forEach((f) => {
  delete require.cache[require.resolve(path.join(PACKS, f))];
  require(path.join(PACKS, f)).forEach((e) => effects.push(Object.assign({ pack: f.replace('.meta.js', '') }, e)));
});

const seen = new Set();
effects.forEach((e) => {
  if (seen.has(e.id)) problems.push('nom en double : ' + e.id);
  seen.add(e.id);
  if (CATEGORIES.indexOf(e.cat) === -1) problems.push(e.id + ' : catégorie inconnue « ' + e.cat + ' »');
  ['intent', 'feel', 'params', 'use', 'avoid', 'code', 'demo'].forEach((k) => {
    if (!e[k]) problems.push(e.id + ' : champ « ' + k + ' » manquant');
  });
  // Chaque effet doit être enregistré dans le JavaScript (FX.register ou liste de noms)
  if (js.indexOf("'" + e.id + "'") === -1) problems.push(e.id + ' : absent de fx.js (FX.register)');
  if (e.demo && e.demo.indexOf(e.id) === -1 && !e.jump) problems.push(e.id + ' : la démo n\'utilise pas l\'effet');
});

effects.sort((a, b) => CATEGORIES.indexOf(a.cat) - CATEGORIES.indexOf(b.cat));

// --- dist/catalog.js -----------------------------------------------------------

const catalog = effects.map((e) => {
  const c = { id: e.id, cat: e.cat, intent: e.intent, code: e.code, demo: e.demo };
  if (e.jump) c.jump = e.jump;
  if (e.trigger) c.trigger = e.trigger;
  return c;
});
write(path.join(ROOT, 'dist/catalog.js'),
  '/* Généré par scripts/build.js — ne pas modifier à la main */\nwindow.FX_CATALOG = ' +
  JSON.stringify(catalog) + ';\n');

// --- effects/<nom>.md -----------------------------------------------------------

const docDir = path.join(ROOT, 'effects');
fs.mkdirSync(docDir, { recursive: true });
fs.readdirSync(docDir).forEach((f) => {
  if (f.endsWith('.md') && !seen.has(f.slice(0, -3))) fs.unlinkSync(path.join(docDir, f));
});
effects.forEach((e) => {
  const md = [
    '# `' + e.id + '`', '',
    '**Catégorie :** ' + e.cat, '',
    '## Intention', e.intent, '',
    "## Ce qu'on ressent", e.feel, '',
    '## Utilisation', '```html', e.code, '```', '',
    '## Paramètres', e.params, '',
    "## Quand l'utiliser", e.use, '',
    "## Quand l'éviter", e.avoid, '',
    '## Accessibilité', e.a11y || REDUCED_DEFAULT, ''
  ].join('\n');
  write(path.join(docDir, e.id + '.md'), md);
});

// --- AI.md et README.md ----------------------------------------------------------

function replaceBetween(file, tag, content) {
  const p = path.join(ROOT, file);
  const src = read(p);
  const a = '<!-- ' + tag + ':start -->';
  const b = '<!-- ' + tag + ':end -->';
  const i = src.indexOf(a);
  const j = src.indexOf(b);
  if (i === -1 || j === -1) { problems.push(file + ' : balises ' + tag + ' introuvables'); return; }
  write(p, src.slice(0, i + a.length) + '\n' + content + '\n' + src.slice(j));
}

const byCat = CATEGORIES.map((cat) => ({ cat, list: effects.filter((e) => e.cat === cat) })).filter((g) => g.list.length);
const firstSentence = (s) => s.split(/(?<=\.)\s/)[0].replace(/\.$/, '');

replaceBetween('AI.md', 'catalogue',
  '| Nom | Catégorie | Intention |\n|---|---|---|\n' +
  effects.map((e) => '| `' + e.id + '` | ' + e.cat + ' | ' + firstSentence(e.intent).replace(/\|/g, '\\|') + ' |').join('\n'));

replaceBetween('README.md', 'effets',
  byCat.map((g) => '- **' + g.cat + ' (' + g.list.length + ') :** ' + g.list.map((e) => '`' + e.id + '`').join(', ')).join('\n'));

['README.md', 'AI.md'].forEach((f) => {
  const p = path.join(ROOT, f);
  write(p, read(p).replace(/<!-- total -->\d+<!-- \/total -->/g, '<!-- total -->' + effects.length + '<!-- /total -->'));
});

// --- Plugin Claude (plugin/) ------------------------------------------------------
// Le skill embarque une copie du catalogue et des fiches : il marche sans accès au dépôt

// Figé par défaut : le plugin reste à sa version publiée et n'entre pas en nouvelle soumission.
// Pour le mettre à jour volontairement : node scripts/build.js --plugin
if (process.argv.includes('--plugin')) {
  const pkg = JSON.parse(read(path.join(ROOT, 'package.json')));
  write(path.join(ROOT, 'plugin', '.claude-plugin', 'plugin.json'), JSON.stringify({
    name: 'ideotheque',
    version: pkg.version,
    description: effects.length + ' named visual effects (animations, page transitions, text, scroll and AI-state effects) that Claude applies by name. Free and MIT.',
    author: { name: 'alice-crypto', url: 'https://github.com/alice-crypto' },
    homepage: 'https://alice-crypto.github.io/ideotheque/',
    repository: 'https://github.com/alice-crypto/ideotheque',
    license: pkg.license,
    keywords: pkg.keywords
  }, null, 2) + '\n');

  const SKILL = path.join(ROOT, 'plugin', 'skills', 'ideotheque');
  write(path.join(SKILL, 'catalogue.md'), read(path.join(ROOT, 'AI.md')));
  const skillFx = path.join(SKILL, 'effects');
  fs.mkdirSync(skillFx, { recursive: true });
  fs.readdirSync(skillFx).forEach((f) => { if (!fs.existsSync(path.join(docDir, f))) fs.unlinkSync(path.join(skillFx, f)); });
  fs.readdirSync(docDir).forEach((f) => write(path.join(skillFx, f), read(path.join(docDir, f))));
}

// --- Rapport ---------------------------------------------------------------------

console.log('fx.css : ' + (css.length / 1024).toFixed(1) + ' Ko · fx-all.js : ' + (js.length / 1024).toFixed(1) + ' Ko');
console.log(effects.length + ' effets · ' + byCat.map((g) => g.cat + ' ' + g.list.length).join(' · '));
if (problems.length) {
  console.log('\n' + problems.length + ' problème(s) :\n- ' + problems.join('\n- '));
  process.exitCode = 1;
}
