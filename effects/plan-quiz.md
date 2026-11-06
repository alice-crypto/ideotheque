# `plan-quiz`

**Catégorie :** Micro-interaction

## Intention
Quelques questions, une à la fois, mènent à la formule conseillée.

## Ce qu'on ressent
Comme un échange au guichet, en plus court.

## Utilisation
```html
<div data-fx="plan-quiz" data-fx-plans="Tiers,Confort"></div>
```

## Paramètres
- `data-fx-questions` : « question:réponse=points,… » séparés par `|`
- `data-fx-plans` : formules de la moins à la plus complète

## Quand l'utiliser
Choix d'une formule, d'un forfait, d'un produit.

## Quand l'éviter
De présenter ce résultat comme un conseil personnalisé réglementé.

## Accessibilité
Vrais boutons, et la conclusion est dans une région `status`.
