# `highlight-sweep`

**Catégorie :** Texte

## Intention
Un trait de surligneur passe derrière le texte, de gauche à droite, même sur plusieurs lignes.

## Ce qu'on ressent
Manuscrit, pédagogique, il pointe l'essentiel.

## Utilisation
```html
<p>Une idée <mark data-fx="highlight-sweep">qui compte vraiment</mark>.</p>
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)
- `--fx-mark` : couleur du surligneur

## Quand l'utiliser
Un passage important dans un paragraphe, une phrase clé.

## Quand l'éviter
Plus de deux surlignages par écran : plus rien ne ressort.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
