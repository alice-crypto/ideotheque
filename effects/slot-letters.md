# `slot-letters`

**Catégorie :** Texte

## Intention
Chaque lettre défile comme un rouleau de machine à sous, puis s'arrête à son tour sur le bon signe.

## Ce qu'on ressent
Mécanique, ludique, un petit suspense.

## Utilisation
```html
<h2 data-fx="slot-letters">JACKPOT</h2>
```

## Paramètres
- `data-fx-rolls` (8) : signes avant l'arrêt
- `--fx-speed` (900ms) : durée du premier rouleau

## Quand l'utiliser
Noms de marque, chiffres clés, annonces.

## Quand l'éviter
Les textes longs : l'effet devient une attente.

## Accessibilité
Le texte final est dans `aria-label`, les rouleaux sont masqués aux lecteurs d'écran.
