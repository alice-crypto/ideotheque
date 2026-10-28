# `spotlight-focus`

**Catégorie :** Présentation

## Intention
Un projecteur assombrit tout sauf l'élément mis en avant, puis passe à l'étape suivante, avec une bulle d'explication.

## Ce qu'on ressent
Pédagogique, guidé, visite d'interface.

## Utilisation
```html
<div data-fx="spotlight-focus">
  <button data-fx-step="1" data-fx-tip="Créez">…</button>
  <button data-fx-step="2" data-fx-tip="Partagez">…</button>
</div>
```

## Paramètres
- `data-fx-step` (1, 2, 3…) sur les éléments à éclairer, `data-fx-tip` pour la bulle
- `data-fx-interval` (2600) : durée par étape ; `FX.trigger(element)` passe à la suivante
- `--fx-veil` : couleur du voile

## Quand l'utiliser
Présentation d'une interface, nouveautés, visite guidée.

## Quand l'éviter
Les parcours obligatoires qu'on ne peut pas passer.

## Accessibilité
Le voile et la bulle sont décoratifs : donnez les explications aussi dans le texte de la page.
