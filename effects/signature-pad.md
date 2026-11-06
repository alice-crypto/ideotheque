# `signature-pad`

**Catégorie :** Micro-interaction

## Intention
On signe au doigt ou à la souris, et la validation s'ouvre quand le tracé est assez long.

## Ce qu'on ressent
Le geste du stylo, avec son poids.

## Utilisation
```html
<div data-fx="signature-pad"></div>
```

## Paramètres
- `data-fx-min` (40) : longueur minimale du tracé, en pixels
- `data-fx-label`, `--fx-h`
- événement `fx:signed` avec l'image dans `detail.image`

## Quand l'utiliser
Contrats, reçus de livraison, formulaires.

## Quand l'éviter
De croire qu'un dessin vaut signature électronique qualifiée : le cadre légal reste à prévoir.

## Accessibilité
Le tracé demande un pointeur : proposez toujours une autre façon de signer, au clavier.
