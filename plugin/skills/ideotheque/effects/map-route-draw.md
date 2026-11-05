# `map-route-draw`

**Catégorie :** Présentation

## Intention
Un itinéraire se dessine au fil du défilement, et chaque étape atteinte s'allume.

## Ce qu'on ressent
Carnet de voyage, on avance avec le tracé.

## Utilisation
```html
<svg data-fx="map-route-draw" viewBox="0 0 300 150"><path d="M10 120 C80 20 200 140 290 30"/><circle cx="10" cy="120" r="5" data-at="0"/></svg>
```

## Paramètres
- `data-at` sur chaque étape : position entre 0 et 1
- `--fx-route`, `--fx-weight`

## Quand l'utiliser
Voyages, histoires d'expédition, livraisons.

## Quand l'éviter
Un chemin SVG qui ne suit pas l'ordre du récit.

## Accessibilité
Ajoutez `role="img"` et `aria-label` au SVG pour décrire l'itinéraire.
