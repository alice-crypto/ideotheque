# `gauge-needle`

**Catégorie :** Présentation

## Intention
Un cadran dont l'aiguille monte jusqu'à la valeur, puis oscille un instant.

## Ce qu'on ressent
Tableau de bord d'une voiture, instrument physique.

## Utilisation
```html
<div data-fx="gauge-needle" data-fx-value="72"></div>
```

## Paramètres
- `data-fx-value` (72), `data-fx-max` (100)
- `--fx-w` (170px) : largeur

## Quand l'utiliser
Scores, performance, vitesse.

## Quand l'éviter
De petites différences : un cadran n'est pas très précis.

## Accessibilité
Rôle `meter` avec `aria-valuenow`, valeur écrite sous le cadran.
