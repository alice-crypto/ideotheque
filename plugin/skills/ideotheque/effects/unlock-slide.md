# `unlock-slide`

**Catégorie :** État

## Intention
Pour confirmer, on fait glisser le pouce jusqu'au bout du rail ; en lâchant avant, il revient.

## Ce qu'on ressent
Geste volontaire, impossible à faire par erreur.

## Utilisation
```html
<div data-fx="unlock-slide" data-fx-label="Glisser pour payer"></div>
```

## Paramètres
- `data-fx-label`, `data-fx-done` : textes
- L'élément émet `fx:unlock`.

## Quand l'utiliser
Paiements, envois, actions difficiles à annuler sur mobile.

## Quand l'éviter
Les actions courantes.

## Accessibilité
Le pouce est un bouton : Entrée ou Espace confirment sans glisser.
