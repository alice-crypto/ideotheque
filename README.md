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

## Avec Claude

Idéothèque existe en plugin pour Claude Code. Une fois installé, Claude connaît les <!-- total -->342<!-- /total --> effets : il lit leur fiche et les applique par leur nom, sans que vous ayez à lui donner `AI.md`.

```
/plugin install ideotheque --marketplace alice-crypto/ideotheque
```

Sur une version plus ancienne de Claude Code, en deux commandes :

```
/plugin marketplace add alice-crypto/ideotheque
/plugin install ideotheque@ideotheque
```

**Sur claude.ai :** compressez le dossier [`plugin/skills/ideotheque`](plugin/skills/ideotheque) en `.zip`, puis importez-le dans les réglages, rubrique des skills.

Le plugin se met à jour avec la bibliothèque : `npm run build` y recopie le catalogue et les fiches.

## Contenu

| Dossier | Rôle |
|---|---|
| `dist/` | Les fichiers à utiliser : `fx.css` + `fx.js`, sans dépendance (générés) |
| `src/` | Les sources : le moteur (`core.*`) et les effets rangés par packs |
| `effects/` | Une fiche par effet : intention, ressenti, paramètres, quand l'utiliser ou l'éviter (générées) |
| `assets/` | Les visuels de démonstration, dessinés en SVG pour la bibliothèque |
| `index.html` | Le catalogue vivant, avec une démo de chaque effet |
| `AI.md` | Le mode d'emploi pour les assistants IA |
| `plugin/` | Le plugin Claude Code et son skill (catalogue et fiches recopiés par le build) |

## Voir le catalogue

En ligne : **https://alice-crypto.github.io/ideotheque/**

En local, le catalogue charge des fichiers voisins : ouvrez-le via un petit serveur plutôt qu'en double-cliquant dessus.

```bash
npm start
```

Puis ouvrez http://localhost:5180. Pour contribuer, voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Exemples

Cinq marques fictives, chacune avec une landing page, un dashboard et un assistant IA (réflexion visible, réponse mot à mot, palette ⌘K), construites uniquement avec les effets de la bibliothèque : **https://alice-crypto.github.io/ideotheque/exemples/**

| Marque | Landing page | Dashboard |
| --- | --- | --- |
| Brume, application de sommeil | [brume.html](exemples/brume.html) | [dashboard-brume.html](exemples/dashboard-brume.html) |
| Maison Ocre, atelier de céramique | [ocre.html](exemples/ocre.html) | [dashboard-ocre.html](exemples/dashboard-ocre.html) |
| Verdure, balcons végétalisés | [verdure.html](exemples/verdure.html) | [dashboard-verdure.html](exemples/dashboard-verdure.html) |
| Halo, musique de concentration | [halo.html](exemples/halo.html) | [dashboard-halo.html](exemples/dashboard-halo.html) |
| Atlas, voyages lents en train | [atlas.html](exemples/atlas.html) | [dashboard-atlas.html](exemples/dashboard-atlas.html) |

Les illustrations sont des SVG originaux (`exemples/img/`).

## Les <!-- total -->342<!-- /total --> effets

<!-- effets:start -->
- **Entrée (25) :** `curtain-soft`, `rise-stagger`, `blur-in`, `line-mask`, `pixel-dissolve`, `fade-up`, `slide-in`, `zoom-in-soft`, `flip-up`, `swing-in`, `iris-open`, `diagonal-wipe`, `split-reveal`, `block-reveal`, `stretch-in`, `skew-up`, `drop-bounce`, `pop-in`, `blinds-open`, `ink-spread`, `tile-cascade`, `scatter-gather`, `fold-down`, `lift-shadow`, `rule-draw`
- **Texte (56) :** `text-split`, `text-scramble`, `typewriter`, `word-rise`, `wave-text`, `glitch-text`, `gradient-flow`, `highlight-sweep`, `strike-draw`, `track-in`, `proximity-weight`, `word-rotator`, `odometer`, `stroke-fill`, `long-shadow`, `letter-focus`, `slice-hover`, `scroll-ink`, `char-flip`, `neon-flicker`, `wavy-underline`, `image-text`, `velocity-stretch`, `edge-label`, `stream-text`, `text-shimmer`, `weight-wave`, `letter-rain`, `headline-collapse`, `cursor-repel`, `scroll-weight`, `letter-accordion`, `spot-fill`, `letter-orbit`, `mirror-type`, `echo-stack`, `slot-letters`, `dot-matrix`, `ascii-decay`, `hop-row`, `half-shift`, `hover-marquee`, `cube-words`, `case-shuffle`, `breathe-track`, `ink-bleed`, `redact-reveal`, `sticker-letters`, `drift-title`, `path-type`, `color-cycle-words`, `sun-shadow`, `depth-crawl`, `gravity-letters`, `pixel-type`, `scribble-circle`
- **Présentation (20) :** `count-up`, `pill-grow`, `preloader`, `marquee`, `band-loader`, `bars-grow`, `marquee-vertical`, `timeline`, `spotlight-focus`, `logo-cycle`, `quote-rotator`, `circle-text`, `split-flap`, `line-chart`, `scroll-cue`, `peel`, `holo-card`, `donut`, `expand-panels`, `prompt-box`
- **Micro-interaction (57) :** `underline-draw`, `roll-text`, `magnetic`, `tilt-card`, `corner-marks`, `cursor`, `ripple-click`, `fill-up`, `border-trace`, `shine-sweep`, `spotlight-card`, `press-squash`, `icon-nudge`, `lift-hover`, `jelly`, `swap-text`, `conic-border`, `underline-fill`, `zoom-frame`, `tooltip-pop`, `click-burst`, `switch-morph`, `shake`, `fan-out`, `depth-hover`, `blob-morph`, `pulse-ring`, `invert-sweep`, `spring-follow`, `squish-drag`, `cursor-label`, `hover-tilt-text`, `press-ripple-text`, `swipe-reveal-row`, `trail-dots`, `hold-confirm`, `snap-toggle`, `stepper-pop`, `star-rate`, `ink-button`, `gooey-menu`, `liquid-glass`, `jelly-list`, `focus-beam`, `border-chase`, `sticky-note-peel`, `image-pop-link`, `drag-reorder`, `swipe-card`, `sound-bars-hover`, `pressure-word`, `price-flip`, `checkbox-scribble`, `search-expand`, `tag-delete`, `copy-pop-toast`, `knob-dial`
- **Défilement (49) :** `scroll-expand`, `parallax`, `progress-bar`, `stack-cards`, `pin-horizontal`, `scroll-rotate`, `scale-on-scroll`, `fade-exit`, `hero-shrink`, `bg-shift`, `scroll-unveil`, `scroll-count`, `path-scroll`, `perspective-scroll`, `skew-scroll`, `split-columns`, `blur-exit`, `scatter-scroll`, `fill-scroll`, `circle-unveil`, `slat-scroll`, `scroll-typing`, `band-slide`, `cross-rows`, `fan-scroll`, `tunnel-scroll`, `depth-stack`, `plane-land`, `wheel-scroll`, `thread-line`, `dot-swell`, `aperture-text`, `hue-drift`, `bars-scrub`, `door-scroll`, `grid-breathe`, `flip-scrub`, `curtain-scrub`, `letters-scrub`, `reading-marker`, `chapter-ticker`, `frame-drift`, `wave-morph`, `orbit-scrub`, `stairs-scroll`, `wipe-scrub`, `card-recede`, `speed-lines`, `scroll-gauge`
- **Transition (32) :** `page-wipe`, `bands`, `circle-expand`, `slash`, `pixel-wipe`, `shutter`, `curtain-close`, `fade-through`, `zoom-through`, `push-slide`, `arc-rise`, `glitch-cut`, `tile-flip`, `iris`, `title-card`, `view-morph`, `diagonal-tiles`, `spiral-tiles`, `clock-wipe`, `ink-drops`, `stair-bars`, `wave-cover`, `cross-blinds`, `fold-doors`, `shatter-tris`, `word-flash`, `text-cover`, `dots-cover`, `scan-cover`, `color-stack`, `x-cross`, `page-turn`
- **Image (28) :** `svg-draw`, `ken-burns`, `color-reveal`, `image-trail`, `hover-preview`, `slice-in`, `rgb-split`, `blob-mask`, `compare`, `glare`, `lens`, `photo-stack`, `liquid-hover`, `pixelate`, `flip-card`, `carousel-ring`, `drag-gallery`, `noise-reveal`, `ascii-image`, `dither-reveal`, `duotone-hover`, `mosaic-hover`, `wave-image`, `scan-reveal`, `strip-slider`, `tilt-focus`, `polaroid-drop`, `x-ray`
- **Navigation (15) :** `burger-morph`, `menu-reveal`, `smart-header`, `tab-slider`, `dot-nav`, `top-ring`, `hover-pill`, `accordion`, `dropdown`, `scroll-spy`, `dots-morph`, `drawer`, `modal-zoom`, `header-shrink`, `focus-list`
- **Ambiance (41) :** `scanlines`, `dot-grid`, `grain`, `aurora`, `gradient-drift`, `grid-floor`, `starfield`, `constellation`, `wave-lines`, `vhs`, `crt`, `flashlight`, `bokeh`, `code-rain`, `blob-bg`, `halftone`, `orbit-rings`, `light-beams`, `water-ripple`, `glow-grid`, `flow-field`, `metaballs`, `voronoi-cells`, `contour-lines`, `game-of-life`, `ribbon-sine`, `particle-text`, `rain-glass`, `snow-fall`, `fireflies`, `matrix-dots-wave`, `sun-rays`, `plasma`, `equalizer-bg`, `kaleidoscope`, `lightning`, `sand-grain`, `mesh-gradient`, `tiles-flicker`, `spiral-galaxy`, `noise-terrain`
- **État (19) :** `shimmer`, `orbit-loader`, `loading-bar`, `typing-dots`, `check-draw`, `cross-draw`, `confetti`, `toast`, `progress-ring`, `badge-bump`, `heart-like`, `copy-morph`, `liquid-fill`, `float`, `live-dot`, `flip-clock`, `loading-quips`, `ai-orb`, `thinking-steps`
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
