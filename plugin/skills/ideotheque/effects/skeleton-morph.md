# `skeleton-morph`

**Catégorie :** État

## Intention
Des lignes grises de chargement se dissolvent en place pour laisser apparaître le vrai texte.

## Ce qu'on ressent
Sans rupture, le contenu arrive sans faire sauter la page.

## Utilisation
```html
<article data-fx="skeleton-morph"><p>Votre contenu…</p></article>
```

## Paramètres
- `data-fx-wait` (1500) : durée d'attente, ou appelez `el._fxDone()` quand les données arrivent
- `--fx-bone` : couleur des lignes

## Quand l'utiliser
Chargement de cartes, de listes, de réponses.

## Quand l'éviter
Une attente de moins de 300 ms : affichez directement le contenu.

## Accessibilité
`aria-busy` indique le chargement aux lecteurs d'écran.
