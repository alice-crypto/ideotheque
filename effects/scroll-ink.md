# `scroll-ink`

**Catégorie :** Texte

## Intention
Les mots d'un paragraphe passent du gris à la couleur un par un, au rythme du défilement.

## Ce qu'on ressent
Immersif, on lit au rythme de la page.

## Utilisation
```html
<p data-fx="scroll-ink">Un long paragraphe…</p>
```

## Paramètres
- `--fx-ink-off` : couleur des mots pas encore lus

## Quand l'utiliser
Manifestes, paragraphes d'introduction en très grands caractères.

## Quand l'éviter
Les textes que l'on doit pouvoir lire sans faire défiler.

## Accessibilité
Le texte d'origine reste lisible par les lecteurs d'écran via `aria-label`. Avec `prefers-reduced-motion: reduce`, tous les mots sont colorés.
