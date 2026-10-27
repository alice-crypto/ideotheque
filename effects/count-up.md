# `count-up`

**Catégorie :** Présentation

## Intention
Mettre en scène un chiffre clé en le faisant défiler de 0 jusqu'à sa valeur.

## Ce qu'on ressent
Dynamique, factuel, rassurant.

## Utilisation
```html
<span data-fx="count-up" data-fx-to="12480">12480</span>
```

## Paramètres
- `data-fx-to` : valeur finale
- `data-fx-decimals` (0)
- `data-fx-duration` (1600, en ms)

## Quand l'utiliser
Statistiques, KPI, chiffres de preuve sociale.

## Quand l'éviter
Les valeurs que l'utilisateur doit lire immédiatement (prix, solde).

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
