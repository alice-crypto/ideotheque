# `word-rotator`

**Catégorie :** Texte

## Intention
Un mot change régulièrement en glissant vers le haut, et la largeur s'adapte au nouveau mot.

## Ce qu'on ressent
Dynamique, il raconte plusieurs choses en une phrase.

## Utilisation
```html
<h2>Des sites <span data-fx="word-rotator" data-fx-words="rapides|beaux|libres">rapides</span></h2>
```

## Paramètres
- `data-fx-words` : mots séparés par « | »
- `data-fx-interval` (2200) : durée par mot en ms
- `--fx-rotator-color` : couleur du mot

## Quand l'utiliser
Accroches du type « Nous concevons des sites | apps | marques ».

## Quand l'éviter
Les informations essentielles : un mot qui change peut être manqué.

## Accessibilité
Tous les mots sont annoncés aux lecteurs d'écran via `aria-label`. Avec `prefers-reduced-motion: reduce`, le premier mot reste affiché.
