# `rail-progress-nav`

**Catégorie :** Navigation

## Intention
Un rail vertical de petits traits : le trait de la section en cours s'allonge et se remplit au fil de la lecture.

## Ce qu'on ressent
Sobre, on sait où on est sans y penser.

## Utilisation
```html
<nav data-fx="rail-progress-nav"><a href="#a">Intro</a><a href="#b">Suite</a></nav>
```

## Paramètres
Chaque lien pointe vers une section par `href="#id"`.

## Quand l'utiliser
Longs articles, pages produit en plusieurs chapitres.

## Quand l'éviter
Une page de moins de trois sections.

## Accessibilité
Le lien actif porte `aria-current`.
