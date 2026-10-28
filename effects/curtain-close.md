# `curtain-close`

**Catégorie :** Transition

## Intention
Deux rideaux de théâtre se rejoignent au centre, puis se rouvrent sur la nouvelle page.

## Ce qu'on ressent
Théâtral, il annonce un nouvel acte.

## Utilisation
```html
<a href="/projets" data-fx="curtain-close">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="curtain-close">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('curtain-close', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`) (rouge velours par défaut)

## Quand l'utiliser
Spectacles, récits en chapitres, révélations.

## Quand l'éviter
Les interfaces utilitaires.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
