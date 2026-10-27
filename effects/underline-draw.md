# `underline-draw`

**Catégorie :** Micro-interaction

## Intention
Un lien qui se souligne au survol depuis la gauche, puis repart vers la droite.

## Ce qu'on ressent
Fluide, soigné, discret.

## Utilisation
```html
<a href="…" data-fx="underline-draw">Lien</a>
```

## Paramètres
- `--fx-duration` (la durée réelle vaut 55 % de cette valeur)

## Quand l'utiliser
Liens de navigation, liens dans un texte éditorial.

## Quand l'éviter
Les liens qui doivent rester soulignés en permanence pour être repérables.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
