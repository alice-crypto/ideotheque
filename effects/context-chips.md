# `context-chips`

**Catégorie :** État

## Intention
De petites étiquettes apparaissent une à une pour montrer ce que l'assistant lit.

## Ce qu'on ressent
Transparence, on sait sur quoi repose la réponse.

## Utilisation
```html
<div data-fx="context-chips" data-fx-items="a.pdf|b.md"></div>
```

## Paramètres
- `data-fx-items` : éléments séparés par `|`
- `data-fx-step` (500) : millisecondes entre deux étiquettes

## Quand l'utiliser
Assistants avec recherche ou fichiers.

## Quand l'éviter
D'afficher des fichiers que l'assistant ne lit pas vraiment.

## Accessibilité
Les ajouts sont annoncés par `aria-live`.
