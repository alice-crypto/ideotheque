# `scroll-count`

**Catégorie :** Défilement

## Intention
Un nombre augmente de 0 à sa valeur au fil du défilement, et redescend si on remonte.

## Ce qu'on ressent
Interactif, le lecteur « fait tourner » le compteur.

## Utilisation
```html
<span data-fx="scroll-count" data-fx-to="1200">1200</span>
```

## Paramètres
- `data-fx-to` : valeur finale (le texte de l'élément par défaut)

## Quand l'utiliser
Statistiques dans un récit défilant.

## Quand l'éviter
Les chiffres que l'on doit lire sans défiler.

## Accessibilité
La valeur finale est exposée via `aria-label`. Avec `prefers-reduced-motion: reduce`, la valeur finale est affichée.
