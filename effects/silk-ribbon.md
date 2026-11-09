# `silk-ribbon`

**Catégorie :** Défilement

## Intention
Un ruban de soie irisée en 3D se dessine sur toute la largeur au rythme du défilement, en se vrillant et en faisant une boucle.

## Ce qu'on ressent
Un geste fluide qui relie deux chapitres.

## Utilisation
```html
<div data-fx="silk-ribbon"></div>
```

## Paramètres
- `--fx-h` (320px) : hauteur
- `data-fx-width` (.1) : largeur du ruban
- `data-fx-auto` (en ms) : boucle sans défilement

## Quand l'utiliser
Entre deux sections, sur un fond plutôt uni.

## Quand l'éviter
Derrière un texte long : ses reflets gênent la lecture.

## Accessibilité
Décoratif (`aria-hidden`). Mouvement réduit : ruban entier et immobile. Sans WebGL : rien ne s'affiche, la page reste complète.
