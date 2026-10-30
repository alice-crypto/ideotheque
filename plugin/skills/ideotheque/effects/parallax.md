# `parallax`

**Catégorie :** Défilement

## Intention
L'élément défile plus lentement (ou plus vite) que la page, ce qui crée une profondeur.

## Ce qu'on ressent
Profondeur, relief, sensation de couches.

## Utilisation
```html
<img data-fx="parallax" style="--fx-speed:-200px" src="…" alt="…">
```

## Paramètres
- `--fx-speed` (-120px) : décalage total pendant la traversée (positif = plus lent que la page)

## Quand l'utiliser
Images de fond, formes décoratives, illustrations en couches.

## Quand l'éviter
Le texte à lire : il « glisse » sous les yeux.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'élément reste dans son état final, sans suivre le défilement.
