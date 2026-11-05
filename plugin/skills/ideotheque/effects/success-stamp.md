# `success-stamp`

**Catégorie :** État

## Intention
Un tampon « Validé » s'écrase sur l'élément, avec une petite secousse au moment du choc.

## Ce qu'on ressent
Administratif et satisfaisant, l'affaire est réglée.

## Utilisation
```html
<div data-fx="success-stamp">…</div>
```

## Paramètres
- `data-fx-stamp` (Validé) : le texte
- `data-fx-auto="true"` : déclenché à l'affichage
- `FX.trigger(el)` par code

## Quand l'utiliser
Paiement accepté, dossier validé, jeu réussi.

## Quand l'éviter
Les actions banales : le geste doit rester rare.

## Accessibilité
Le texte du tampon a le rôle `status`.
