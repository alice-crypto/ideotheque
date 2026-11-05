# `hold-confirm`

**Catégorie :** Micro-interaction

## Intention
Il faut maintenir le bouton enfoncé jusqu'à ce qu'il soit plein : c'est la confirmation.

## Ce qu'on ressent
Geste délibéré, l'action a du poids.

## Utilisation
```html
<button data-fx="hold-confirm">Maintenir pour supprimer</button>
```

## Paramètres
- `data-fx-hold` (1200) : durée d'appui en millisecondes
- `--fx-hold-fill` : couleur de remplissage
- L'élément émet `fx:confirm` une fois la durée atteinte.

## Quand l'utiliser
Suppression, paiement, action difficile à annuler.

## Quand l'éviter
Les actions courantes : le geste devient une corvée.

## Accessibilité
Fonctionne au clavier avec Espace ou Entrée maintenus. Prévoyez aussi une autre façon de confirmer pour les personnes qui ne peuvent pas maintenir un appui.
