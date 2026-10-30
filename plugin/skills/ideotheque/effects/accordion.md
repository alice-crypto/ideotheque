# `accordion`

**Catégorie :** Navigation

## Intention
Un élément `<details>` qui s'ouvre et se ferme en douceur, avec un « + » qui pivote en croix.

## Ce qu'on ressent
Ordonné, rassurant, sans à-coup.

## Utilisation
```html
<details data-fx="accordion">
  <summary>Question</summary>
  <p>Réponse…</p>
</details>
```

## Paramètres
Aucun paramètre : utilisez un `<details>` avec un `<summary>`.

## Quand l'utiliser
FAQ, détails techniques, conditions, menus de filtres.

## Quand l'éviter
Les contenus essentiels : ils ne doivent pas être cachés par défaut.

## Accessibilité
C'est un vrai `<details>` : clavier et lecteurs d'écran fonctionnent nativement. Avec `prefers-reduced-motion: reduce`, l'ouverture est instantanée.
