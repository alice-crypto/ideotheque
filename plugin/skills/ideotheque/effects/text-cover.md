# `text-cover`

**Catégorie :** Transition

## Intention
Des rangées de texte géant glissent en sens alternés pour couvrir l'écran.

## Ce qu'on ressent
Affiche de stade, le nom de la marque occupe tout.

## Utilisation
```html
<a href="/tournee" data-fx="text-cover">Tournée</a>
```

## Paramètres
- `data-fx-word` sur `<html>` : mot affiché (sinon, le premier mot du titre)
- `--fx-tr-color`, `--fx-tr-ink` : couleurs

## Quand l'utiliser
Marques au nom court, événements.

## Quand l'éviter
Les noms très longs.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le changement de page se fait sans transition.
