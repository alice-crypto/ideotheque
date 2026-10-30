# `pixel-wipe`

**Catégorie :** Transition

## Intention
L'écran se remplit de cases au hasard, puis elles disparaissent pour révéler la page suivante.

## Ce qu'on ressent
Numérique, rétro, jeu vidéo.

## Utilisation
```html
<a href="/projets" data-fx="pixel-wipe">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="pixel-wipe">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="pixel-wipe">`
- Vers une autre page en JavaScript : `FX.go('pixel-wipe', '/projets', event)`
- En JavaScript : `FX.play('pixel-wipe', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)
- Grille de 12 × 8 cases

## Quand l'utiliser
Sites techno, jeux, portfolios créatifs.

## Quand l'éviter
Les publics sensibles aux scintillements.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
