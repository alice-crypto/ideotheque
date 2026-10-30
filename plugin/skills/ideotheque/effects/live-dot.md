# `live-dot`

**Catégorie :** État

## Intention
Un point rouge qui pulse à côté d'un libellé, pour signaler un direct.

## Ce qu'on ressent
Urgent, en temps réel, événementiel.

## Utilisation
```html
<span data-fx="live-dot">En direct</span>
```

## Paramètres
- `--fx-live` (#ff2e2e) : couleur

## Quand l'utiliser
Diffusions en direct, enchères, statut « en ligne ».

## Quand l'éviter
Les contenus qui ne sont pas réellement en direct.

## Accessibilité
Le libellé texte porte l'information ; le point est décoratif. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
