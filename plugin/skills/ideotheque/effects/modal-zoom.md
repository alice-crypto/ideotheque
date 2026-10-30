# `modal-zoom`

**Catégorie :** Navigation

## Intention
Une fenêtre s'ouvre en grandissant depuis le bouton qui l'a appelée, sur un fond flouté.

## Ce qu'on ressent
Spatial, on comprend d'où vient la fenêtre.

## Utilisation
```html
<button data-fx-toggle="#confirmer">Supprimer</button>
<div id="confirmer" data-fx="modal-zoom" role="dialog" aria-modal="true">
  <div class="fenetre">…</div>
</div>
```

## Paramètres
- Le premier enfant est la fenêtre elle-même
- Clic sur le fond pour fermer
- Ouverture : `FX.trigger(element)` ou un bouton `data-fx-toggle="#id"`
- Fermeture : Échap, un élément `data-fx-close`, ou un nouveau clic sur le bouton
- `data-fx-local` : reste dans son conteneur au lieu de couvrir l'écran

## Quand l'utiliser
Confirmations, formulaires courts, aperçus.

## Quand l'éviter
Les contenus longs (préférez une page) et les fenêtres en cascade.

## Accessibilité
Le bouton reçoit `aria-expanded`, le composant `aria-hidden` ; Échap ferme et le premier élément focalisable reçoit le focus à l'ouverture. Avec `prefers-reduced-motion: reduce`, l'ouverture est instantanée. Ajoutez `role="dialog"` et `aria-modal="true"`.
