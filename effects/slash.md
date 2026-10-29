# `slash`

**Catégorie :** Transition

## Intention
Un pan incliné traverse l'écran de gauche à droite, comme un coup de lame.

## Ce qu'on ressent
Rapide, sportif, tranchant.

## Utilisation
```html
<a href="/projets" data-fx="slash">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="slash">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="slash">`
- Vers une autre page en JavaScript : `FX.go('slash', '/projets', event)`
- En JavaScript : `FX.play('slash', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Sites sportifs, jeux, marques dynamiques.

## Quand l'éviter
Les univers calmes et feutrés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
