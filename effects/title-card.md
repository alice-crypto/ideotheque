# `title-card`

**Catégorie :** Transition

## Intention
Un carton plein écran monte avec un titre au centre, comme au cinéma, puis laisse place à la page.

## Ce qu'on ressent
Narratif, solennel, il annonce la suite.

## Utilisation
```html
<a href="/chapitre-2" data-fx="title-card" data-fx-title="Chapitre 2">Suite</a>
```

## Paramètres
- Sur un lien : `<a href="…" data-fx="title-card">` joue la transition puis change de page (et la termine sur la page suivante)
- En JavaScript : `FX.play('title-card', callback, event)` recouvre l'écran, appelle `callback`, puis découvre
- `--fx-tr-color` : couleur principale (à définir sur `:root`)
- `data-fx-title` sur le lien ou le bouton : texte du carton (titre de la page par défaut)

## Quand l'utiliser
Passage à un chapitre, ouverture d'une étude de cas.

## Quand l'éviter
Les navigations fréquentes : le carton dure 1,3 s.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la transition est sautée : l'action a lieu immédiatement. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
