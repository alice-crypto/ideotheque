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

`@main` suit toujours la dernière version. Pour un site en production, remplacez `@main` par un numéro de version publiée (par exemple `@v0.2.0`) afin que le rendu ne change pas sans vous.

**En local :** téléchargez `dist/fx.css` et `dist/fx.js`, puis incluez-les dans votre page.

## Contenu

| Dossier | Rôle |
|---|---|
| `dist/` | Le moteur : `fx.css` + `fx.js`, sans dépendance |
| `effects/` | Une fiche par effet (22) : intention, ressenti, paramètres, quand l'utiliser ou l'éviter |
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

## Les 22 effets

- **Entrées :** `curtain-soft`, `rise-stagger`, `blur-in`, `line-mask`, `pixel-dissolve`
- **Présentation :** `text-split`, `text-scramble`, `count-up`, `pill-grow`, `preloader`, `marquee`
- **Micro-interactions :** `underline-draw`, `roll-text`, `magnetic`, `tilt-card`, `corner-marks`, `cursor`
- **Défilement :** `scroll-expand`
- **Transitions :** `page-wipe`
- **Ambiances :** `scanlines`, `dot-grid`
- **États :** `shimmer`

Tous respectent `prefers-reduced-motion`.

## Ajouter un effet

1. Ajouter le CSS (et le JS si nécessaire) dans `dist/`.
2. Créer `effects/<nom>.md` sur le modèle des fiches existantes.
3. Ajouter une entrée dans `index.html` et dans le tableau de `AI.md`.

**Règle d'originalité :** on peut s'inspirer d'un effet vu sur un site, mais on le **réécrit entièrement**. On ne copie jamais le code, les images ni les textes d'un autre site.

## Licence

MIT
