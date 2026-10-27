# Guide pour les assistants IA

Ce fichier explique à une IA (Claude, Copilot, Cursor…) comment utiliser cette bibliothèque quand un humain lui dit par exemple :

> « Utilise `curtain-soft` pour l'entrée des sections et `magnetic` sur le bouton principal. »

## Règles

1. **Un nom = un effet précis.** Lis la fiche `effects/<nom>.md` avant de l'appliquer. Respecte son *intention* et ses paramètres par défaut, n'invente pas une variante.
2. **Si le projet peut charger les fichiers** (`dist/fx.css` + `dist/fx.js`), utilise simplement l'attribut `data-fx="<nom>"`.
3. **Si le projet utilise un framework** (React, Vue, Svelte, Flutter…), reproduis l'effet avec les outils du framework, avec la même durée, la même courbe (easing), la même distance et le même ressenti que la fiche. Garde le nom de l'effet en commentaire.
4. **Respecte toujours `prefers-reduced-motion`.**
5. **Respecte les sections « Quand l'éviter ».** Si la demande contredit une fiche, applique l'effet quand même, puis signale le problème en une ligne.
6. **Nom inconnu ?** Dis-le et propose l'effet existant le plus proche par son intention. Ne devine pas.

## Catalogue

| Nom | Catégorie | Intention |
|---|---|---|
| `curtain-soft` | Entrée | Révéler un contenu avec calme, comme un rideau qui se lève |
| `rise-stagger` | Entrée | Faire arriver une liste élément par élément |
| `blur-in` | Entrée | Une mise au point : le contenu sort du flou |
| `line-mask` | Entrée | Chaque ligne glisse depuis un cache invisible |
| `pixel-dissolve` | Entrée | Une mosaïque de cases qui s'efface au hasard sur un visuel |
| `text-split` | Présentation | Un titre qui apparaît lettre par lettre |
| `text-scramble` | Présentation | Un texte brouillé qui se décode |
| `count-up` | Présentation | Un chiffre clé qui défile jusqu'à sa valeur |
| `pill-grow` | Présentation | Une gélule qui s'ouvre au milieu d'un titre |
| `preloader` | Présentation | Un écran de chargement chiffré qui se lève |
| `marquee` | Présentation | Un bandeau infini qui réagit au défilement |
| `underline-draw` | Micro-interaction | Un soulignement qui se dessine au survol |
| `roll-text` | Micro-interaction | Des lettres qui roulent vers le haut au survol |
| `magnetic` | Micro-interaction | Un bouton attiré par le curseur |
| `tilt-card` | Micro-interaction | Une carte qui s'incline en 3D |
| `corner-marks` | Micro-interaction | Des repères d'angle qui cadrent l'élément au survol |
| `cursor` | Micro-interaction | Un point qui suit la souris et peut afficher un mot |
| `scroll-expand` | Défilement | Un visuel encadré qui s'ouvre au plein cadre en défilant |
| `page-wipe` | Transition | Deux panneaux qui recouvrent puis découvrent l'écran |
| `scanlines` | Ambiance | Lignes d'écran cathodique et balayage lumineux |
| `dot-grid` | Ambiance | Une trame de points qui s'illumine autour du curseur |
| `shimmer` | État | Un reflet sur un squelette de chargement |

## Réglages communs (variables CSS)

`--fx-duration` (700ms), `--fx-delay` (0ms), `--fx-ease`, `--fx-stagger` (70ms), `--fx-distance` (24px).

## API JavaScript

- `FX.init(conteneur)` : active les effets d'un contenu ajouté dynamiquement
- `FX.replay(element)` : rejoue une entrée
- `FX.wipe(callback)` : joue la transition `page-wipe` autour d'une action

## Combinaisons qui marchent bien

- Page d'accueil : `preloader` → `line-mask` sur le titre → `dot-grid` en fond → `magnetic` sur le bouton principal
- Portfolio : `cursor` sur `<body>`, `corner-marks` sur les vignettes, `pixel-dissolve` sur les images, `page-wipe` entre les projets
- Univers science-fiction : `scanlines` sur les visuels, `text-scramble` sur les sur-titres, `marquee` entre les sections

Au plus un effet « fort » (`preloader`, `scroll-expand`, `pixel-dissolve`) par écran.
