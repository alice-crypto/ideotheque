# `shutter`

**Catégorie :** Transition

## Intention
Huit lames horizontales se ferment de haut en bas, comme un rideau métallique, puis se rouvrent.

## Ce qu'on ressent
Mécanique, urbain, industriel.

## Utilisation
```html
<a href="/projets" data-fx="shutter">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="shutter">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('shutter', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Boutiques, sites urbains, changement de catégorie.

## Quand l'éviter
Les transitions très fréquentes.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
