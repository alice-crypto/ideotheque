# `interaction-check`

**Catégorie :** Micro-interaction

## Intention
On choisit deux éléments, et la table donne leur niveau de compatibilité.

## Ce qu'on ressent
Un filet de sécurité qui renvoie vers un humain.

## Utilisation
```html
<div data-fx="interaction-check" data-fx-names="A,B" data-fx-table='{"A+B":"caution"}'></div>
```

## Paramètres
- `data-fx-names` : éléments séparés par des virgules
- `data-fx-table` : JSON « A+B » vers `caution` ou `avoid`

## Quand l'utiliser
Compatibilités produit, composants, pièces détachées.

## Quand l'éviter
Toute donnée médicale non validée : la table d'exemple est fictive et « rien de signalé » ne veut pas dire sans risque.

## Accessibilité
Vraies listes étiquetées, résultat dans une région `status`, niveau écrit en mots.
