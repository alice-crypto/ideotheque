# `bg-shift`

**Catégorie :** Défilement

## Intention
Chaque section change la couleur de fond de la page (ou d'un conteneur) quand elle passe au milieu de l'écran.

## Ce qu'on ressent
Narratif, chaque chapitre a son ambiance.

## Utilisation
```html
<section data-fx="bg-shift" data-fx-bg="#ffd166">…</section>
```

## Paramètres
- `data-fx-bg` : couleur de fond de la section
- `data-fx-color` : couleur du texte (facultatif)
- `data-fx-bg-scope` sur un ancêtre : la couleur s'applique à lui plutôt qu'à `<body>`

## Quand l'utiliser
Récits, pages produit en chapitres, portfolios.

## Quand l'éviter
Les couleurs qui réduisent le contraste du texte.

## Accessibilité
Le changement de couleur est un fondu de 0,6 s. Avec `prefers-reduced-motion: reduce`, il est instantané.
