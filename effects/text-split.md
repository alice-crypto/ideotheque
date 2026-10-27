# `text-split`

**Catégorie :** Présentation

## Intention
Donner du poids à un titre en le faisant apparaître lettre par lettre.

## Ce qu'on ressent
Affirmé, typographique, mémorable.

## Utilisation
```html
<h1 data-fx="text-split">Bonjour le monde</h1>
```

## Paramètres
- `--fx-stagger` (70ms, divisé par 3 entre les lettres)
- `--fx-duration`, `--fx-delay`

## Quand l'utiliser
Le titre principal d'une page ou d'une slide, une seule fois par écran.

## Quand l'éviter
Les textes de plus d'environ 40 caractères, ou un texte qui change souvent.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
