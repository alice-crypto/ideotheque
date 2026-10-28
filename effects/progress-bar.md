# `progress-bar`

**Catégorie :** Défilement

## Intention
Une fine barre en haut de l'écran indique jusqu'où on a lu la page.

## Ce qu'on ressent
Rassurant, on sait combien il reste.

## Utilisation
```html
<div data-fx="progress-bar"></div>
```

## Paramètres
- `--fx-height` (3px), `--fx-bar` (accent)
- `data-fx-local` : barre dans son conteneur plutôt qu'en haut de l'écran

## Quand l'utiliser
Articles longs, documentation, récits.

## Quand l'éviter
Les pages courtes : la barre se remplit d'un coup.

## Accessibilité
La barre est décorative : ajoutez `aria-hidden="true"`.
