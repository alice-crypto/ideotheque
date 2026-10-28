# `swap-text`

**Catégorie :** Micro-interaction

## Intention
Au survol, le texte glisse vers le haut et cède la place à un autre texte.

## Ce qu'on ressent
Malicieux, il en dit plus quand on s'approche.

## Utilisation
```html
<button data-fx="swap-text" data-fx-alt="Écrivez-nous">Contact</button>
```

## Paramètres
- `data-fx-alt` : texte qui apparaît au survol (le même par défaut)
- `--fx-swap-color` : couleur du second texte

## Quand l'utiliser
Boutons (« Contact » → « Écrivez-nous »), liens de menu.

## Quand l'éviter
Les textes de longueurs très différentes : la largeur suit le plus long.

## Accessibilité
Seul le premier texte est lu par les lecteurs d'écran. Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
