# `odometer`

**Catégorie :** Texte

## Intention
Chaque chiffre défile verticalement jusqu'à sa valeur, comme un compteur mécanique.

## Ce qu'on ressent
Mécanique, précis, satisfaisant.

## Utilisation
```html
<span data-fx="odometer">2 048</span>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms) — défilement 2,2 fois plus long, décalé de 90 ms par chiffre

## Quand l'utiliser
Statistiques, compteurs, prix.

## Quand l'éviter
Les nombres qui changent souvent en direct (préférez `count-up`).

## Accessibilité
Le texte d'origine reste lisible par les lecteurs d'écran via `aria-label`.
