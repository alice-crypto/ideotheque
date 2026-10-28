# `fade-through`

**Catégorie :** Transition

## Intention
Un fondu au noir (ou à la couleur choisie), puis un fondu vers la page suivante.

## Ce qu'on ressent
Sobre, cinématographique, universel.

## Utilisation
```html
<a href="/projets" data-fx="fade-through">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="fade-through">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('fade-through', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Tous les sites, quand on veut une transition sans effet marqué.

## Quand l'éviter
Rien de particulier : c'est la transition la plus neutre.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
