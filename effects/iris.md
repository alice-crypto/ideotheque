# `iris`

**Catégorie :** Transition

## Intention
Un diaphragme se referme sur le centre de l'écran, puis se rouvre sur la page suivante.

## Ce qu'on ressent
Cinéma muet, dessin animé, fin de scène.

## Utilisation
```html
<a href="/projets" data-fx="iris">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="iris">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('iris', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)
- Utilise `@property` (sans animation sur les navigateurs anciens)

## Quand l'utiliser
Récits, sites rétro, fin d'un chapitre.

## Quand l'éviter
Les interfaces sérieuses.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
