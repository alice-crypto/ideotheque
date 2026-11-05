# `headline-replace-scroll`

**Catégorie :** Texte

## Intention
Dans une phrase fixe, un mot change selon la section qu'on est en train de lire.

## Ce qu'on ressent
Une phrase qui suit la conversation.

## Utilisation
```html
<h2>Pour <span data-fx="headline-replace-scroll"></span></h2>
```

## Paramètres
- `data-word` sur chaque section, ou `data-fx-words` : mots séparés par `|`

## Quand l'utiliser
Titre collant le long d'une page de fonctions.

## Quand l'éviter
Une phrase qui perd son sens quand le mot change.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
