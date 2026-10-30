# `shake`

**Catégorie :** Micro-interaction

## Intention
L'élément est secoué horizontalement, pour signaler une erreur ou un refus.

## Ce qu'on ressent
Clair et universel : « non ».

## Utilisation
```html
<input data-fx="shake">
<script>FX.trigger(champ)</script>
```

## Paramètres
- Se déclenche avec `FX.trigger(element)`
- `data-fx-vibrate="true"` : fait aussi vibrer le téléphone

## Quand l'utiliser
Champ de formulaire invalide, mot de passe incorrect.

## Quand l'éviter
Les messages positifs, et sans message d'erreur écrit à côté.

## Accessibilité
Accompagnez toujours la secousse d'un message d'erreur écrit. Avec `prefers-reduced-motion: reduce`, il n'y a pas de mouvement.
