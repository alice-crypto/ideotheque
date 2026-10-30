# `line-mask`

**Catégorie :** Entrée

## Intention
Chaque ligne d'un texte glisse vers le haut depuis derrière un cache invisible, l'une après l'autre.

## Ce qu'on ressent
Éditorial, cinématographique, comme un générique de film.

## Utilisation
```html
<h2 data-fx="line-mask">Un titre<br>sur deux lignes</h2>
```

## Paramètres
- `--fx-stagger` (70ms) : décalage entre deux lignes
- `--fx-duration`, `--fx-delay`
- Les `<br>` du texte sont conservés comme retours à la ligne forcés
- Le découpage est recalculé automatiquement quand la largeur change

## Quand l'utiliser
Grands titres, accroches, citations, légendes de visuels.

## Quand l'éviter
Les textes de plus de 6 lignes, et les éléments contenant du HTML (liens, gras) : le texte est remis à plat.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
