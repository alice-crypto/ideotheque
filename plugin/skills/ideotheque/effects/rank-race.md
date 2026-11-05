# `rank-race`

**Catégorie :** Présentation

## Intention
Un classement où les valeurs évoluent, et les lignes se dépassent en glissant.

## Ce qu'on ressent
Course, suspense, l'histoire d'une évolution.

## Utilisation
```html
<div data-fx="rank-race" data-fx-items="A:40,B:55"></div>
```

## Paramètres
- `data-fx-items` : « nom:valeur » séparés par des virgules
- `data-fx-every` (1.1) : secondes entre deux mises à jour
- `--fx-row` (28px) : hauteur d'une ligne

## Quand l'utiliser
Démonstrations, récits de données, classements.

## Quand l'éviter
De vraies données : les valeurs varient au hasard. Mettez à jour `_fxRows` vous-même dans ce cas.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le classement reste figé.
