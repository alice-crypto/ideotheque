# `border-chase`

**Catégorie :** Micro-interaction

## Intention
Une lumière fait le tour de la carte, et accélère lorsqu'on la survole.

## Ce qu'on ressent
Énergie contenue, circuit sous tension.

## Utilisation
```html
<div data-fx="border-chase">…</div>
```

## Paramètres
- `data-fx-idle` (50) : vitesse au repos, en degrés par seconde
- `--fx-weight` (2px), `--fx-radius` (14px)

## Quand l'utiliser
Carte mise en avant, offre recommandée, bouton d'IA.

## Quand l'éviter
Plusieurs cartes à la fois : une seule doit attirer l'œil.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
