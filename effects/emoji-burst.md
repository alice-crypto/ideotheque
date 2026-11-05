# `emoji-burst`

**Catégorie :** Micro-interaction

## Intention
Au clic, quelques symboles s'envolent en dérivant au-dessus de l'élément.

## Ce qu'on ressent
Spontané, comme une réaction dans un direct.

## Utilisation
```html
<button data-fx="emoji-burst">♥ J'aime</button>
```

## Paramètres
- `data-fx-icons` : symboles séparés par `|`
- `data-fx-count` (6)

## Quand l'utiliser
Boutons « j'aime », réactions, encouragements.

## Quand l'éviter
Une confirmation importante : l'effet ne dit rien de précis.

## Accessibilité
Les symboles sont masqués aux lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, rien ne s'envole.
