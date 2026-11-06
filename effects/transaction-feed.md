# `transaction-feed`

**Catégorie :** État

## Intention
Les nouvelles opérations arrivent en haut de la liste, avec leur montant signé.

## Ce qu'on ressent
Le compte est vivant, on voit passer chaque mouvement.

## Utilisation
```html
<div data-fx="transaction-feed"></div>
```

## Paramètres
- `data-fx-max` (4), `data-fx-demo="true"`
- Par code : `el._fxAdd('Nom', -12.5)`

## Quand l'utiliser
Banques, caisses, portefeuilles.

## Quand l'éviter
Une démonstration qui se ferait passer pour de vraies données.

## Accessibilité
Rôle `log`. Le signe est écrit, pas seulement suggéré par la couleur.
