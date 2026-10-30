# `strike-draw`

**Catégorie :** Texte

## Intention
Un trait barre le texte de gauche à droite.

## Ce qu'on ressent
Ironique, correctif, « avant / après ».

## Utilisation
```html
<s data-fx="strike-draw">49 €</s> 29 €
```

## Paramètres
- `--fx-duration` (700ms), `--fx-delay` (0ms)

## Quand l'utiliser
Ancien prix, idée abandonnée, jeu de mots barré.

## Quand l'éviter
Les informations que l'utilisateur doit encore lire : barré signifie « ne plus en tenir compte ».

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
