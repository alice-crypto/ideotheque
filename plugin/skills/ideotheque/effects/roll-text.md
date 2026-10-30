# `roll-text`

**Catégorie :** Micro-interaction

## Intention
Au survol, chaque lettre roule vers le haut et laisse la place à son double, avec un léger décalage entre les lettres.

## Ce qu'on ressent
Précis, mécanique, très « studio ».

## Utilisation
```html
<a href="…" data-fx="roll-text">Menu</a>
```

## Paramètres
- `--fx-duration` (la durée réelle vaut 70 % de cette valeur)

## Quand l'utiliser
Liens de navigation, boutons texte, liens de pied de page.

## Quand l'éviter
Les textes sur plusieurs lignes et les liens au milieu d'un paragraphe.

## Accessibilité
Le texte d'origine est exposé via `aria-label`. Avec `prefers-reduced-motion: reduce`, le texte reste immobile.
