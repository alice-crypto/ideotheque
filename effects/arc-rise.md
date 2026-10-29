# `arc-rise`

**Catégorie :** Transition

## Intention
Un panneau au bord supérieur arrondi monte du bas de l'écran, puis repart vers le haut.

## Ce qu'on ressent
Doux, fluide, organique.

## Utilisation
```html
<a href="/projets" data-fx="arc-rise">Projets</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="arc-rise">` joue la transition puis change de page (et la termine sur la page suivante)
- Sur un lien qui porte déjà un autre effet : `<a href="…" data-fx="lift-hover" data-fx-tr="arc-rise">`
- Vers une autre page en JavaScript : `FX.go('arc-rise', '/projets', event)`
- En JavaScript : `FX.play('arc-rise', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)

## Quand l'utiliser
Portfolios, marques douces, changements de section.

## Quand l'éviter
Rien de particulier, mais choisissez une couleur qui contraste avec la page.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
