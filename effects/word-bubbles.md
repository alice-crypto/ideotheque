# `word-bubbles`

**Catégorie :** Texte

## Intention
Une conversation apparaît bulle après bulle, à un rythme proche de la vraie frappe.

## Ce qu'on ressent
Familier, on suit la conversation.

## Utilisation
```html
<div data-fx="word-bubbles"><p>Bonjour</p><p>Que puis-je faire ?</p></div>
```

## Paramètres
- `data-fx-per-char` (16) : millisecondes par signe
- `--fx-bubble-a`, `--fx-bubble-b`

## Quand l'utiliser
Démonstrations d'assistants, témoignages.

## Quand l'éviter
De longs échanges : le dernier message arrive trop tard.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
