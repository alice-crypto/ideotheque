# `consent-scroll`

**Catégorie :** Micro-interaction

## Intention
La case de consentement ne s'active qu'une fois le texte lu jusqu'au bout.

## Ce qu'on ressent
Le consentement prend du poids.

## Utilisation
```html
<div data-fx="consent-scroll"><div>Texte…</div><label><input type="checkbox"> J'accepte</label></div>
```

## Paramètres
- premier enfant : le texte à faire défiler ; un `label` avec sa case
- `--fx-h` (70px)

## Quand l'utiliser
Consentements, conditions importantes, chartes.

## Quand l'éviter
De croire que le défilement prouve la compréhension, ou d'enfermer un texte court.

## Accessibilité
La zone se fait défiler au clavier, et l'ouverture de la case est annoncée.
