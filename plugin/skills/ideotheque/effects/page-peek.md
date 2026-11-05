# `page-peek`

**Catégorie :** Navigation

## Intention
Un panneau dépasse du bas de l'écran : on le tire vers le haut, il s'arrête à mi-hauteur ou en haut.

## Ce qu'on ressent
Geste d'application mobile, naturel et précis.

## Utilisation
```html
<aside data-fx="page-peek"><button>Détails</button><div>…</div></aside>
```

## Paramètres
- `data-fx-peek` (56) : hauteur visible au repos
- `--fx-h` (100%) : hauteur totale
- `--fx-peek-bg` : fond

## Quand l'utiliser
Détails sur une carte, lecteur audio, filtres sur mobile.

## Quand l'éviter
Une page sans image ou carte derrière le panneau.

## Accessibilité
La poignée est un bouton activable au clavier, avec `aria-expanded`.
