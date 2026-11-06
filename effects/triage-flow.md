# `triage-flow`

**Catégorie :** Micro-interaction

## Intention
Des questions oui ou non orientent vers le bon interlocuteur, avec un retour possible.

## Ce qu'on ressent
Calme et net, une question à la fois.

## Utilisation
```html
<div data-fx="triage-flow"></div>
```

## Paramètres
- `data-fx-tree` : arbre JSON avec `q`, `y`, `n`, `r` (réponse), `u` (urgent)

## Quand l'utiliser
Orientation médicale, assistance, dépannage.

## Quand l'éviter
Tout arbre santé non validé par des soignants : celui d'exemple est illustratif.

## Accessibilité
Vrais boutons, et chaque nouvelle question est annoncée.
