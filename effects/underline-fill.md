# `underline-fill`

**Catégorie :** Micro-interaction

## Intention
Le soulignement monte au survol jusqu'à devenir un fond plein derrière le texte.

## Ce qu'on ressent
Franc, graphique, éditorial.

## Utilisation
```html
<a href="…" data-fx="underline-fill">lien</a>
```

## Paramètres
- `--fx-fill` (accent) : couleur
- `--fx-fill-ink` : couleur du texte au survol

## Quand l'utiliser
Liens dans un texte, liens de menu.

## Quand l'éviter
Les textes sur plusieurs lignes très longues.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
