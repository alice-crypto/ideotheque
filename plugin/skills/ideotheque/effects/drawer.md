# `drawer`

**Catégorie :** Navigation

## Intention
Un panneau latéral glisse depuis la droite au-dessus d'un voile sombre.

## Ce qu'on ressent
Pratique, il garde le contexte visible.

## Utilisation
```html
<button data-fx-toggle="#panier">Panier</button>
<aside id="panier" data-fx="drawer">
  <div class="panneau">…</div>
</aside>
```

## Paramètres
- `--fx-drawer-w` (360px) : largeur du panneau
- Clic sur le voile pour fermer
- Ouverture : `FX.trigger(element)` ou un bouton `data-fx-toggle="#id"`
- Fermeture : Échap, un élément `data-fx-close`, ou un nouveau clic sur le bouton
- `data-fx-local` : reste dans son conteneur au lieu de couvrir l'écran

## Quand l'utiliser
Panier, filtres, menu mobile, détails d'un élément.

## Quand l'éviter
Les formulaires très longs : préférez une page dédiée.

## Accessibilité
Le bouton reçoit `aria-expanded`, le composant `aria-hidden` ; Échap ferme et le premier élément focalisable reçoit le focus à l'ouverture. Avec `prefers-reduced-motion: reduce`, l'ouverture est instantanée.
