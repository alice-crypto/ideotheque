# `tooltip-pop`

**Catégorie :** Micro-interaction

## Intention
Une bulle d'aide jaillit au-dessus de l'élément au survol, avec un petit rebond.

## Ce qu'on ressent
Utile, vivant, discret.

## Utilisation
```html
<button data-fx="tooltip-pop" data-fx-tip="Copier le lien">🔗</button>
```

## Paramètres
- `data-fx-tip` : texte de la bulle

## Quand l'utiliser
Icônes sans texte, abréviations, aides contextuelles courtes.

## Quand l'éviter
Les informations indispensables : sur mobile, il n'y a pas de survol.

## Accessibilité
Le texte de la bulle n'est pas lu par les lecteurs d'écran : doublez-le avec `aria-label`. Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
