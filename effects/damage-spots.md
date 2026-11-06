# `damage-spots`

**Catégorie :** Micro-interaction

## Intention
On touche les zones abîmées d'une voiture vue de dessus, et le résumé s'écrit dessous.

## Ce qu'on ressent
Simple dans un moment pénible, sans vocabulaire de carrossier.

## Utilisation
```html
<div data-fx="damage-spots"></div>
```

## Paramètres
- `--fx-w` (230px)
- `--fx-accent` : couleur des zones

## Quand l'utiliser
Déclaration de sinistre, état des lieux d'une location.

## Quand l'éviter
De se passer de photos : le schéma situe, il ne prouve pas.

## Accessibilité
Chaque zone est un bouton nommé avec `aria-pressed`, et le résumé est annoncé.
