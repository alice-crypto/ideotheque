# `bands`

**Catégorie :** Transition

## Intention
Cinq bandes verticales de couleurs vives tombent l'une après l'autre pour couvrir l'écran, puis continuent leur chute.

## Ce qu'on ressent
Festif, coloré, très « marque ».

## Utilisation
```html
<a href="/projets" data-fx="bands">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="bands">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="bands">`
- Vers une autre page en JavaScript : `FX.go('bands', '/projets', event)`
- En JavaScript : `FX.play('bands', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- Couleurs des bandes : dans le CSS du pack (`.fx-tr-bands i:nth-child(n)`)

## Quand l'utiliser
Sites de restaurants, événements, marques joyeuses.

## Quand l'éviter
Les applications où l'on change souvent de page.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
