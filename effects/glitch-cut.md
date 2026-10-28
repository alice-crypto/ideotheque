# `glitch-cut`

**Catégorie :** Transition

## Intention
Des bandes horizontales arrivent en saccades de chaque côté, avec des éclats rouges et cyan.

## Ce qu'on ressent
Numérique, nerveux, interférence.

## Utilisation
```html
<a href="/projets" data-fx="glitch-cut">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="glitch-cut">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('glitch-cut', callback, event)` recouvre l'écran, appelle `callback`, puis découvre

## Quand l'utiliser
Univers jeux vidéo, techno, cyberpunk.

## Quand l'éviter
Les publics sensibles aux effets saccadés.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
