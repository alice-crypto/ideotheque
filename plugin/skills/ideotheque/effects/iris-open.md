# `iris-open`

**Catégorie :** Entrée

## Intention
Un cercle s'ouvre depuis le centre et dévoile le contenu, comme l'ouverture d'un diaphragme.

## Ce qu'on ressent
Cinématographique, focalisé.

## Utilisation
```html
<figure data-fx="iris-open"><img src="…" alt="…"></figure>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms) — durée réelle 1,4 fois plus longue

## Quand l'utiliser
Visuels forts, vidéos, portraits.

## Quand l'éviter
Les éléments très larges et peu hauts : le cercle met longtemps à atteindre les côtés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
