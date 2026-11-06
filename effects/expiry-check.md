# `expiry-check`

**Catégorie :** Micro-interaction

## Intention
Une date saisie donne le temps restant avant péremption, en trois états.

## Ce qu'on ressent
Réponse immédiate au moment de faire le tri.

## Utilisation
```html
<div data-fx="expiry-check" data-fx-date="2027-06-30"></div>
```

## Paramètres
- `data-fx-date` ou `data-fx-days` (20) : valeur de départ
- `data-fx-soon` (30)

## Quand l'utiliser
Pharmacie familiale, alimentation, garanties.

## Quand l'éviter
D'assurer qu'un produit ouvert reste bon : la date vaut pour un produit fermé.

## Accessibilité
Vrai champ date, résultat écrit dans une région `status`.
