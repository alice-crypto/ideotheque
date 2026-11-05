# `soft-page-in`

**Catégorie :** Entrée

## Intention
Les blocs d'une page apparaissent doucement, de haut en bas, avec un très léger mouvement.

## Ce qu'on ressent
Calme, à peine perceptible, très soigné.

## Utilisation
```html
<main data-fx="soft-page-in">…</main>
```

## Paramètres
Aucun réglage. Le retard total est limité à 450 ms.

## Quand l'utiliser
Pages d'application, documentation, tableaux de bord.

## Quand l'éviter
Les pages où la vitesse perçue est critique.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
