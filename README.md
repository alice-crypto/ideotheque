# Idéothèque : une bibliothèque d'idées visuelles

> Avant, on avait des bibliothèques de style. Avec l'IA, on passe aux bibliothèques d'idées.

**[▶ Voir le catalogue en ligne](https://alice-crypto.github.io/ideotheque/)**

Chaque animation, transition ou mise en scène porte **un nom** et **une intention**. On peut l'utiliser à la main :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.css">
<script src="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.js" defer></script>

<section data-fx="curtain-soft">…</section>
```

…ou la demander directement à son IA :

> « Utilise `rise-stagger` pour la liste des fonctionnalités et `count-up` sur les chiffres. »

L'IA lit [`AI.md`](AI.md) et la fiche de l'effet, puis reproduit exactement le même rendu, quel que soit le framework.

## Installation

**Par CDN (jsDelivr)**, sans rien installer :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.css">
<script src="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.js" defer></script>
```

`@main` suit toujours la dernière version. Pour un site en production, remplacez `@main` par un numéro de version publiée (par exemple `@v0.3.0`) afin que le rendu ne change pas sans vous.

**En local :** téléchargez `dist/fx.css` et `dist/fx.js`, puis incluez-les dans votre page.

## Contenu

| Dossier | Rôle |
|---|---|
| `dist/` | Les fichiers à utiliser : `fx.css` + `fx.js`, sans dépendance (générés) |
| `src/` | Les sources : le moteur (`core.*`) et les effets rangés par packs |
| `effects/` | Une fiche par effet : intention, ressenti, paramètres, quand l'utiliser ou l'éviter (générées) |
| `assets/` | Les visuels de démonstration, dessinés en SVG pour la bibliothèque |
| `index.html` | Le catalogue vivant, avec une démo de chaque effet |
| `AI.md` | Le mode d'emploi pour les assistants IA |

## Voir le catalogue

En ligne : **https://alice-crypto.github.io/ideotheque/**

En local, le catalogue charge des fichiers voisins : ouvrez-le via un petit serveur plutôt qu'en double-cliquant dessus.

```bash
npm start
```

Puis ouvrez http://localhost:5180. Pour contribuer, voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Les <!-- total -->200<!-- /total --> effets

<!-- effets:start -->
- **Entrée (25) :** `curtain-soft`, `rise-stagger`, `blur-in`, `line-mask`, `pixel-dissolve`, `fade-up`, `slide-in`, `zoom-in-soft`, `flip-up`, `swing-in`, `iris-open`, `diagonal-wipe`, `split-reveal`, `block-reveal`, `stretch-in`, `skew-up`, `drop-bounce`, `pop-in`, `blinds-open`, `ink-spread`, `tile-cascade`, `scatter-gather`, `fold-down`, `lift-shadow`, `rule-draw`
- **Texte (24) :** `text-split`, `text-scramble`, `typewriter`, `word-rise`, `wave-text`, `glitch-text`, `gradient-flow`, `highlight-sweep`, `strike-draw`, `track-in`, `proximity-weight`, `word-rotator`, `odometer`, `stroke-fill`, `long-shadow`, `letter-focus`, `slice-hover`, `scroll-ink`, `char-flip`, `neon-flicker`, `wavy-underline`, `image-text`, `velocity-stretch`, `edge-label`
- **Présentation (19) :** `count-up`, `pill-grow`, `preloader`, `marquee`, `band-loader`, `bars-grow`, `marquee-vertical`, `timeline`, `spotlight-focus`, `logo-cycle`, `quote-rotator`, `circle-text`, `split-flap`, `line-chart`, `scroll-cue`, `peel`, `holo-card`, `donut`, `expand-panels`
- **Micro-interaction (28) :** `underline-draw`, `roll-text`, `magnetic`, `tilt-card`, `corner-marks`, `cursor`, `ripple-click`, `fill-up`, `border-trace`, `shine-sweep`, `spotlight-card`, `press-squash`, `icon-nudge`, `lift-hover`, `jelly`, `swap-text`, `conic-border`, `underline-fill`, `zoom-frame`, `tooltip-pop`, `click-burst`, `switch-morph`, `shake`, `fan-out`, `depth-hover`, `blob-morph`, `pulse-ring`, `invert-sweep`
- **Défilement (19) :** `scroll-expand`, `parallax`, `progress-bar`, `stack-cards`, `pin-horizontal`, `scroll-rotate`, `scale-on-scroll`, `fade-exit`, `hero-shrink`, `bg-shift`, `scroll-unveil`, `scroll-count`, `path-scroll`, `perspective-scroll`, `skew-scroll`, `split-columns`, `blur-exit`, `scatter-scroll`, `fill-scroll`
- **Transition (16) :** `page-wipe`, `bands`, `circle-expand`, `slash`, `pixel-wipe`, `shutter`, `curtain-close`, `fade-through`, `zoom-through`, `push-slide`, `arc-rise`, `glitch-cut`, `tile-flip`, `iris`, `title-card`, `view-morph`
- **Image (18) :** `svg-draw`, `ken-burns`, `color-reveal`, `image-trail`, `hover-preview`, `slice-in`, `rgb-split`, `blob-mask`, `compare`, `glare`, `lens`, `photo-stack`, `liquid-hover`, `pixelate`, `flip-card`, `carousel-ring`, `drag-gallery`, `noise-reveal`
- **Navigation (15) :** `burger-morph`, `menu-reveal`, `smart-header`, `tab-slider`, `dot-nav`, `top-ring`, `hover-pill`, `accordion`, `dropdown`, `scroll-spy`, `dots-morph`, `drawer`, `modal-zoom`, `header-shrink`, `focus-list`
- **Ambiance (19) :** `scanlines`, `dot-grid`, `grain`, `aurora`, `gradient-drift`, `grid-floor`, `starfield`, `constellation`, `wave-lines`, `vhs`, `crt`, `flashlight`, `bokeh`, `code-rain`, `blob-bg`, `halftone`, `orbit-rings`, `light-beams`, `water-ripple`
- **État (17) :** `shimmer`, `orbit-loader`, `loading-bar`, `typing-dots`, `check-draw`, `cross-draw`, `confetti`, `toast`, `progress-ring`, `badge-bump`, `heart-like`, `copy-morph`, `liquid-fill`, `float`, `live-dot`, `flip-clock`, `loading-quips`
<!-- effets:end -->

Tous respectent `prefers-reduced-motion`.

## Ajouter un effet

1. Écrire le CSS et le JavaScript dans un pack de `src/packs/` (`FX.register('nom', { … })`).
2. Décrire l'effet dans le fichier `.meta.js` du pack : intention, ressenti, paramètres, démo…
3. Lancer `npm run build` : `dist/`, les fiches `effects/`, le catalogue et les tableaux sont régénérés.

Le détail est dans [CONTRIBUTING.md](CONTRIBUTING.md).

**Règle d'originalité :** on peut s'inspirer d'un effet vu sur un site, mais on le **réécrit entièrement**. On ne copie jamais le code, les images ni les textes d'un autre site.

## Licence

MIT
