# `tile-flip`

**Catégorie :** Transition

## Intention
Une mosaïque de 40 tuiles se retourne en vague diagonale pour couvrir l'écran.

## Ce qu'on ressent
Mécanique, élégant, comme un tableau d'affichage.

## Utilisation
```html
<a href="/projets" data-fx="tile-flip">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="tile-flip">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('tile-flip', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Galeries, portfolios, passage d'une collection à une autre.

## Quand l'éviter
Les appareils peu puissants.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
