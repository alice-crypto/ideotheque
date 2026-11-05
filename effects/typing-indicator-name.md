# `typing-indicator-name`

**Catégorie :** État

## Intention
Une phrase « Noa est en train d'écrire… » s'accorde selon le nombre de personnes, avec trois points qui dansent.

## Ce qu'on ressent
Présence, on se sent en conversation.

## Utilisation
```html
<div data-fx="typing-indicator-name" data-fx-names="Noa|Sam"></div>
```

## Paramètres
- `data-fx-names` : noms séparés par `|`
- Par code : `el._fxSet(['Noa', 'Sam'])`

## Quand l'utiliser
Messageries, documents partagés, assistants.

## Quand l'éviter
Un long texte de groupe : au-delà de deux noms, l'effet affiche un nombre.

## Accessibilité
Rôle `status`. Les points sont décoratifs.
