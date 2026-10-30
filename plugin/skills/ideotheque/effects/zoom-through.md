# `zoom-through`

**Catégorie :** Transition

## Intention
La page se floute pendant qu'un voile surgit du centre en se rétrécissant, puis se dissipe.

## Ce qu'on ressent
Immersif, comme si l'on plongeait dans la page.

## Utilisation
```html
<a href="/projets" data-fx="zoom-through">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="zoom-through">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="zoom-through">`
- Vers une autre page en JavaScript : `FX.go('zoom-through', '/projets', event)`
- En JavaScript : `FX.play('zoom-through', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)
- Utilise `backdrop-filter` (sans flou sur les navigateurs anciens)

## Quand l'utiliser
Ouverture d'un projet, entrée dans un espace.

## Quand l'éviter
Les appareils peu puissants : le flou plein écran est coûteux.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
