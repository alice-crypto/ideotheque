# `voice-wave`

**Catégorie :** État

## Intention
Une onde de barres réagit à la voix, plus haute au centre, quand l'assistant écoute.

## Ce qu'on ressent
Présence attentive, conversation.

## Utilisation
```html
<div data-fx="voice-wave" aria-label="Écoute en cours"></div>
```

## Paramètres
- `data-fx-bars` (13) : nombre de barres
- `el.fxLevel` (0 à 1) : niveau réel du micro, sinon simulé
- `--fx-bar`, `--fx-h`, `--fx-w`

## Quand l'utiliser
Assistants vocaux, enregistrement, dictée.

## Quand l'éviter
Faire croire qu'on enregistre quand ce n'est pas le cas.

## Accessibilité
Rôle `img` avec un libellé. Avec `prefers-reduced-motion: reduce`, l'onde reste basse.
