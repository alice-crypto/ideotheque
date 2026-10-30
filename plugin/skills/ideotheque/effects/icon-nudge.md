# `icon-nudge`

**Catégorie :** Micro-interaction

## Intention
Une icône placée après le texte (→ par défaut) avance d'un pas au survol.

## Ce qu'on ressent
Directionnel, il invite à continuer.

## Utilisation
```html
<a href="…" data-fx="icon-nudge">En savoir plus</a>
```

## Paramètres
- `data-fx-icon` (→) : caractère de l'icône

## Quand l'utiliser
Liens « En savoir plus », boutons de navigation.

## Quand l'éviter
Les boutons qui ne mènent nulle part (fermer, annuler).

## Accessibilité
L'icône est décorative (pseudo-élément) et n'est pas lue comme un mot. Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
