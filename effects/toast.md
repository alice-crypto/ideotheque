# `toast`

**Catégorie :** État

## Intention
Une notification glisse depuis le bas avec un rebond, puis disparaît d'elle-même.

## Ce qu'on ressent
Discret, informatif, non bloquant.

## Utilisation
```html
<div id="notifs" data-fx="toast"></div>
<button data-fx-toggle="#notifs" data-fx-message="Enregistré">Enregistrer</button>
```

## Paramètres
- `data-fx-message` sur le conteneur ou sur le bouton déclencheur : texte
- `data-fx-duration` (3000) : durée d'affichage
- `data-fx-local` : dans son conteneur (sinon en bas à droite de l'écran)
- Déclenchement : `FX.trigger(conteneur)` ou un bouton `data-fx-toggle="#id"`

## Quand l'utiliser
Confirmation d'enregistrement, copie, ajout au panier.

## Quand l'éviter
Les erreurs importantes : elles doivent rester visibles.

## Accessibilité
Le conteneur est une zone `aria-live="polite"` : chaque notification est annoncée.
