# `push-slide`

**Catégorie :** Transition

## Intention
Un panneau arrive par la droite, couvre l'écran, puis repart par la gauche, comme un diaporama.

## Ce qu'on ressent
Linéaire, on avance dans une suite.

## Utilisation
```html
<a href="/projets" data-fx="push-slide">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="push-slide">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="push-slide">`
- Vers une autre page en JavaScript : `FX.go('push-slide', '/projets', event)`
- En JavaScript : `FX.play('push-slide', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Étapes successives, diaporamas, parcours guidés.

## Quand l'éviter
Les retours en arrière (le sens contredit le geste).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
