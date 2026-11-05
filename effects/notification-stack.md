# `notification-stack`

**Catégorie :** État

## Intention
Des notifications s'empilent, les plus anciennes reculent, puis se retirent seules.

## Ce qu'on ressent
Ordre, plusieurs messages sans encombrer.

## Utilisation
```html
<div data-fx="notification-stack"></div>
```

## Paramètres
- `data-fx-max` (3), `data-fx-life` (4500)
- Par code : `el._fxPush('Message')`

## Quand l'utiliser
Applications, tableaux de bord, assistants.

## Quand l'éviter
Une information importante qui disparaît seule : laissez-la plus longtemps.

## Accessibilité
Rôle `log`, chaque message a son bouton de fermeture.
