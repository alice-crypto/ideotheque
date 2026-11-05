# `sticky-slideshow`

**Catégorie :** Défilement

## Intention
Le cadre reste fixe à l'écran, et les images se succèdent au fil du défilement.

## Ce qu'on ressent
Diaporama piloté par le geste, film qu'on déroule.

## Utilisation
```html
<section data-fx="sticky-slideshow" style="height:300vh"><div><img…><img…></div></section>
```

## Paramètres
Donnez à l'élément une grande hauteur (par exemple 300vh).
- `--fx-frame` (100vh), `--fx-top` (0)

## Quand l'utiliser
Présentation de produit, récit en images.

## Quand l'éviter
Des pages déjà très longues.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
