# `band-slide`

**Catégorie :** Défilement

## Intention
Une bande de texte géant traverse l'écran à l'horizontale, au rythme du défilement.

## Ce qu'on ressent
Ampleur d'affiche, le mot dépasse du cadre.

## Utilisation
```html
<div data-fx="band-slide">Idéothèque</div>
```

## Paramètres
- `data-fx-dir` (left) : `left` ou `right`
- `data-fx-travel` (40) : déplacement en pourcentage

## Quand l'utiliser
Séparations de sections, noms de marque en grand.

## Quand l'éviter
Les phrases qu'il faut lire entièrement.

## Accessibilité
Le texte est dans `aria-label`, les répétitions sont masquées aux lecteurs d'écran.
