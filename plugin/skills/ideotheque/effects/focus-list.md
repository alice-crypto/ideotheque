# `focus-list`

**Catégorie :** Navigation

## Intention
Survoler un élément de liste estompe les autres et le décale légèrement vers la droite.

## Ce qu'on ressent
Focalisé, éditorial, élégant.

## Utilisation
```html
<ul data-fx="focus-list">
  <li><a href="…">Projet A</a></li>
</ul>
```

## Paramètres
- `--fx-dim` (0.3) : opacité des autres éléments
- `--fx-shift` (10px) : décalage

## Quand l'utiliser
Listes de projets, menus de navigation, index.

## Quand l'éviter
Les listes dont tous les éléments doivent rester lisibles en même temps.

## Accessibilité
Fonctionne aussi au focus clavier (`:focus-within`).
