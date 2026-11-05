# `snap-toggle`

**Catégorie :** Micro-interaction

## Intention
Le bouton de l'interrupteur s'étire avant de sauter de l'autre côté, comme une goutte.

## Ce qu'on ressent
Plaisant, élastique, un petit clic satisfaisant.

## Utilisation
```html
<span data-fx="snap-toggle" aria-label="Notifications"></span>
```

## Paramètres
- `--fx-on`, `--fx-off` : couleurs des états
- `data-fx-on="true"` : allumé au départ
- L'élément émet `fx:change`.

## Quand l'utiliser
Réglages, préférences, modes clair et sombre.

## Quand l'éviter
Une action qui prend du temps : l'interrupteur doit agir aussitôt.

## Accessibilité
Rôle `switch`, géré au clavier. Donnez-lui un `aria-label`.
