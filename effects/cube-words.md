# `cube-words`

**Catégorie :** Texte

## Intention
Plusieurs mots sont posés sur les faces d'un cube, qui tourne d'un quart de tour pour passer au suivant.

## Ce qu'on ressent
Solide, mécanique, un présentoir qui pivote.

## Utilisation
```html
<span data-fx="cube-words" data-fx-words="Créer|Tester|Publier"></span>
```

## Paramètres
- `data-fx-words` : les mots séparés par `|` (4 au plus)
- `data-fx-hold` (1800) : pause sur chaque mot, en millisecondes

## Quand l'utiliser
Une accroche dont un mot change : « pour les équipes, les artistes… ».

## Quand l'éviter
Les mots de largeur très différente sans réserver la place nécessaire.

## Accessibilité
Tous les mots sont dans `aria-label`. Avec `prefers-reduced-motion: reduce`, le premier mot reste affiché.
