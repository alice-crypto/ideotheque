# `page-wipe`

**Catégorie :** Transition

## Intention
Deux panneaux (couleur d'accent, puis couleur de fond) montent pour recouvrir l'écran, puis repartent par le haut sur la page suivante.

## Ce qu'on ressent
Fluide et maîtrisé : le site se comporte comme une application.

## Utilisation
```html
<a href="/projets" data-fx="page-wipe">Projets</a>
```

## Paramètres
- Sur un lien : `data-fx="page-wipe"`
- En JavaScript : `FX.wipe(callback)` recouvre l'écran, appelle `callback`, puis le découvre
- `--fx-wipe-accent` (#ff5b2e), `--fx-wipe-bg` (#0c0c0e)

## Quand l'utiliser
Navigation entre les pages d'un portfolio ou d'un site vitrine, changement d'étape.

## Quand l'éviter
Les liens externes, les téléchargements, et les applications où l'on navigue très souvent.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la navigation est immédiate. Les clics avec Ctrl, Cmd ou Maj ne sont pas interceptés.
