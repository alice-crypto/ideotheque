# `weight-tier`

**Catégorie :** Micro-interaction

## Intention
Un curseur de poids allume le palier de tarif correspondant, et le seuil suivant.

## Ce qu'on ressent
On voit ce que coûtent 200 grammes de trop.

## Utilisation
```html
<div data-fx="weight-tier" data-fx-items="1:4.95|2:6.5"></div>
```

## Paramètres
- `data-fx-items` : « poids max:prix » séparés par `|`
- `data-fx-kg` (3)

## Quand l'utiliser
Expédition, abonnements à paliers, impôts.

## Quand l'éviter
Des tarifs d'exemple : remplacez-les par les vôtres.

## Accessibilité
Curseur étiqueté, paliers écrits dans une liste.
