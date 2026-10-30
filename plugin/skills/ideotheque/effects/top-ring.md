# `top-ring`

**Catégorie :** Navigation

## Intention
Un bouton « haut de page » entouré d'un anneau qui se remplit à mesure qu'on lit la page.

## Ce qu'on ressent
Pratique, il indique la progression et ramène en haut.

## Utilisation
```html
<button data-fx="top-ring"></button>
```

## Paramètres
- `--fx-ring-color`, `--fx-ring-bg` : couleurs
- `data-fx-local` : reste dans son conteneur (sinon fixé en bas à droite)
- Apparaît après un demi-écran de défilement

## Quand l'utiliser
Articles longs, documentation, pages de catalogue.

## Quand l'éviter
Les pages courtes.

## Accessibilité
Le bouton porte `aria-label` (« Revenir en haut de la page » par défaut).
