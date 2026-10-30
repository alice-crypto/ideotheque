# `split-flap`

**Catégorie :** Présentation

## Intention
Un tableau d'affichage de gare : les lettres tournent rapidement avant de s'arrêter sur le mot suivant.

## Ce qu'on ressent
Voyage, mécanique, rétro.

## Utilisation
```html
<div data-fx="split-flap" data-fx-words="Paris|Dakar|Tokyo"></div>
```

## Paramètres
- `data-fx-words` : mots séparés par « | »
- `data-fx-interval` (2600) : durée par mot
- `--fx-card`, `--fx-flap-ink` : couleurs

## Quand l'utiliser
Destinations, noms de villes, mots-clés d'accroche.

## Quand l'éviter
Les mots de plus de 12 lettres.

## Accessibilité
Tous les mots sont annoncés via `aria-label`. Avec `prefers-reduced-motion: reduce`, le premier mot reste affiché.
