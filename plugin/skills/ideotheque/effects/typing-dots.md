# `typing-dots`

**Catégorie :** État

## Intention
Trois points sautillent dans une bulle : quelqu'un est en train d'écrire.

## Ce qu'on ressent
Conversationnel, humain, d'attente.

## Utilisation
```html
<span data-fx="typing-dots"></span>
```

## Paramètres
- `--fx-bubble` : couleur de la bulle

## Quand l'utiliser
Messageries, assistants, chats d'aide.

## Quand l'éviter
Les chargements qui ne sont pas une réponse en cours d'écriture.

## Accessibilité
Reçoit `role="status"` et `aria-label="En train d'écrire"`. Avec `prefers-reduced-motion: reduce`, l'animation est figée.
