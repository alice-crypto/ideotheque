# `depth-meter`

**Catégorie :** Défilement

## Intention
Une règle graduée glisse sur le côté et compte les mètres : la page devient une distance à parcourir.

## Ce qu'on ressent
On sait où l'on est, et on a envie d'arriver à zéro.

## Utilisation
```html
<div data-fx="depth-meter" data-fx-from="4200" data-fx-to="0"></div>
```

## Paramètres
- `data-fx-from` (4200), `data-fx-to` (0)
- `data-fx-unit` (m), `data-fx-sign` (−)
- `--fx-h` (220px)
- `data-fx-auto` (en ms) : boucle sans défilement

## Quand l'utiliser
Récits immersifs, longues pages narratives.

## Quand l'éviter
Une page courte : la valeur saute sans rien raconter.

## Accessibilité
Rôle `img` avec une valeur dans `aria-label`. Mouvement réduit : la valeur suit sans glissement.
