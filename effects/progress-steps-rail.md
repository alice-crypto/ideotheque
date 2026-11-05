# `progress-steps-rail`

**Catégorie :** Navigation

## Intention
Une ligne court d'étape en étape, et chaque étape franchie change de couleur.

## Ce qu'on ressent
On avance, on voit le chemin restant, on reste motivé.

## Utilisation
```html
<ol data-fx="progress-steps-rail"><li>Panier</li><li>Livraison</li><li>Paiement</li></ol>
```

## Paramètres
- `data-fx-step` (0) : étape de départ
- Étape suivante : `FX.trigger(el)`

## Quand l'utiliser
Formulaires en plusieurs étapes, commandes, inscriptions.

## Quand l'éviter
Plus de 6 étapes.

## Accessibilité
L'étape courante porte `aria-current="step"`.
