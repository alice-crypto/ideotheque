# `tunnel-scroll`

**Catégorie :** Défilement

## Intention
Des cadres concentriques grandissent au défilement : on a l'impression de traverser un couloir.

## Ce qu'on ressent
Plongée, vitesse, profondeur sans 3D lourde.

## Utilisation
```html
<section data-fx="tunnel-scroll">…</section>
```

## Paramètres
- `data-fx-frames` (6) : nombre de cadres
- `--fx-frame` : couleur des cadres

## Quand l'utiliser
Titres de chapitre, écrans d'introduction.

## Quand l'éviter
Les fonds déjà chargés en lignes.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
