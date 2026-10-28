# `pin-horizontal`

**Catégorie :** Défilement

## Intention
La section reste fixe à l'écran pendant que son contenu défile horizontalement, au rythme du défilement vertical.

## Ce qu'on ressent
Immersif, comme une galerie qu'on traverse.

## Utilisation
```html
<section data-fx="pin-horizontal">
  <article>…</article>
  <article>…</article>
</section>
```

## Paramètres
- `--fx-gap` (24px) : espace entre les éléments
- La hauteur de la section est calculée automatiquement

## Quand l'utiliser
Galeries de projets, frises chronologiques, présentations produit.

## Quand l'éviter
Les contenus essentiels sur mobile : le geste vertical pour avancer horizontalement surprend.

## Accessibilité
Le contenu reste accessible au clavier dans l'ordre du document.
