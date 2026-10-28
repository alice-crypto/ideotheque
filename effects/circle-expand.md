# `circle-expand`

**Catégorie :** Transition

## Intention
Un cercle grandit depuis le point exact du clic jusqu'à couvrir l'écran, puis se referme au centre.

## Ce qu'on ressent
Direct, il relie le geste au résultat.

## Utilisation
```html
<a href="/projets" data-fx="circle-expand">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="circle-expand">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('circle-expand', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Boutons d'action, cartes de projets, passage en mode plein écran.

## Quand l'éviter
Les liens dans un texte : le cercle part d'un point trop discret.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
