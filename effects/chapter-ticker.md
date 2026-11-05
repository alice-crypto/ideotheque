# `chapter-ticker`

**Catégorie :** Défilement

## Intention
Un petit compteur indique le chapitre en cours, et son chiffre coulisse quand on change de section.

## Ce qu'on ressent
Une montre de précision qui suit la lecture.

## Utilisation
```html
<div data-fx="chapter-ticker" data-fx-target="main > section"></div>
```

## Paramètres
- `data-fx-target` (section) : sélecteur des chapitres
- `data-fx-count` (5) : nombre de chiffres s'il n'y a pas de sections

## Quand l'utiliser
Coin d'une page en plusieurs chapitres.

## Quand l'éviter
Une page à une seule section.

## Accessibilité
Le compteur est décoratif et masqué aux lecteurs d'écran.
