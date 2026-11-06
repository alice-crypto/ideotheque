# `fever-curve`

**Catégorie :** Présentation

## Intention
Une courbe se trace, et la partie au-dessus du seuil se remplit d'une couleur chaude.

## Ce qu'on ressent
On voit le pic sans lire chaque relevé.

## Utilisation
```html
<div data-fx="fever-curve" data-fx-data="37.1,38.4,37.3" data-fx-threshold="38"></div>
```

## Paramètres
- `data-fx-data` : valeurs séparées par des virgules
- `data-fx-threshold` (38), `--fx-hot`

## Quand l'utiliser
Température, tout indicateur avec seuil.

## Quand l'éviter
D'en déduire un avis médical : le seuil reste un paramètre d'affichage.

## Accessibilité
Le maximum et le seuil sont écrits en texte.
