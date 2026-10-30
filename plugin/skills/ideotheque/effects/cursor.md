# `cursor`

**Catégorie :** Micro-interaction

## Intention
Un point qui suit la souris avec un léger retard, grossit sur les liens et les boutons, et peut afficher un mot.

## Ce qu'on ressent
Personnalisé, fluide, premium.

## Utilisation
```html
<body data-fx="cursor">
  <a href="…" data-fx-cursor-label="Voir">…</a>
</body>
```

## Paramètres
- Sur le conteneur : `data-fx="cursor"` (souvent `<body>`)
- Sur un élément : `data-fx-cursor-label="Voir"` pour afficher un mot
- `--fx-cursor-color` : couleur du disque qui porte le mot

## Quand l'utiliser
Portfolios, sites vitrines, galeries.

## Quand l'éviter
Les interfaces de travail. Le curseur natif reste visible : ne le masquez pas.

## Accessibilité
Désactivé sur les écrans tactiles et avec `prefers-reduced-motion: reduce`.
