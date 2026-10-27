# Idéothèque : une bibliothèque d'idées visuelles

> Avant, on avait des bibliothèques de style. Avec l'IA, on passe aux bibliothèques d'idées.

Chaque animation, transition ou mise en scène porte **un nom** et **une intention**. On peut l'utiliser à la main :

```html
<link rel="stylesheet" href="dist/fx.css">
<script src="dist/fx.js" defer></script>

<section data-fx="curtain-soft">…</section>
```

…ou la demander directement à son IA :

> « Utilise `rise-stagger` pour la liste des fonctionnalités et `count-up` sur les chiffres. »

L'IA lit [`AI.md`](AI.md) et la fiche de l'effet, puis reproduit exactement le même rendu, quel que soit le framework.

## Contenu

| Dossier | Rôle |
|---|---|
| `dist/` | Le moteur : `fx.css` + `fx.js`, sans dépendance |
| `effects/` | Une fiche par effet (22) : intention, ressenti, paramètres, quand l'utiliser ou l'éviter |
| `assets/` | Les visuels de démonstration, dessinés en SVG pour la bibliothèque |
| `index.html` | Le catalogue vivant, avec une démo de chaque effet |
| `AI.md` | Le mode d'emploi pour les assistants IA |

## Voir le catalogue

Le catalogue charge des fichiers voisins : ouvrez-le via un petit serveur local plutôt qu'en double-cliquant dessus.

```bash
npm start
```

Puis ouvrez http://localhost:5180. Pour contribuer, voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Les 22 effets

**Entrées :** `curtain-soft`, `rise-stagger`, `blur-in`, `line-mask`, `pixel-dissolve`
**Présentation :** `text-split`, `text-scramble`, `count-up`, `pill-grow`, `preloader`, `marquee`
**Micro-interactions :** `underline-draw`, `roll-text`, `magnetic`, `tilt-card`, `corner-marks`, `cursor`
**Défilement :** `scroll-expand`
**Transitions :** `page-wipe`
**Ambiances :** `scanlines`, `dot-grid`
**États :** `shimmer`

Tous respectent `prefers-reduced-motion`.

## Ajouter un effet

1. Ajouter le CSS (et le JS si nécessaire) dans `dist/`.
2. Créer `effects/<nom>.md` sur le modèle des fiches existantes.
3. Ajouter une entrée dans `index.html` et dans le tableau de `AI.md`.

**Règle d'originalité :** on peut s'inspirer d'un effet vu sur un site, mais on le **réécrit entièrement**. On ne copie jamais le code, les images ni les textes d'un autre site.

## Licence

MIT
