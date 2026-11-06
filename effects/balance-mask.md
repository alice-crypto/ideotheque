# `balance-mask`

**Catégorie :** Micro-interaction

## Intention
Un bouton masque le solde derrière des points, et le choix peut être retenu.

## Ce qu'on ressent
Discret, on consulte ses comptes dans le métro.

## Utilisation
```html
<span data-fx="balance-mask">2 480,50 €</span>
```

## Paramètres
- `data-fx-key` : clé d'enregistrement du choix

## Quand l'utiliser
Soldes, salaires, portefeuilles.

## Quand l'éviter
De croire que c'est une sécurité : la valeur reste dans la page.

## Accessibilité
Le bouton est nommé et expose `aria-pressed`.
