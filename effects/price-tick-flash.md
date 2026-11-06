# `price-tick-flash`

**Catégorie :** État

## Intention
Une valeur clignote brièvement dans la couleur de son changement, avec une flèche.

## Ce qu'on ressent
Marché en mouvement, tension.

## Utilisation
```html
<span data-fx="price-tick-flash">102,40</span>
```

## Paramètres
- `data-fx-digits` (2), `data-fx-demo="true"`
- Par code : `el._fxSet(102.4)`

## Quand l'utiliser
Cours, enchères, compteurs en direct.

## Quand l'éviter
Des valeurs qui changent plusieurs fois par seconde : le clignotement devient gênant.

## Accessibilité
La flèche indique le sens sans dépendre de la couleur.
