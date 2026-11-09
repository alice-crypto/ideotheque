# `tide-score`

**Catégorie :** Micro-interaction

## Intention
Un bouton lance une musique générée sur place, sans fichier : un fond grave, une houle et des notes rares. Elle s'ouvre à mesure qu'on remonte la page.

## Ce qu'on ressent
L'eau s'éclaircit aussi à l'oreille.

## Utilisation
```html
<button data-fx="tide-score">Son</button>
```

## Paramètres
- `data-fx-volume` (.5)
- Se pose sur un `<button>` : le texte du bouton est conservé

## Quand l'utiliser
Une expérience immersive, où le son reste un bonus.

## Quand l'éviter
De le lancer sans action de la personne : le son doit rester à sa demande.

## Accessibilité
`aria-pressed` donne l'état. Coupé par défaut, jamais lancé sans clic. Les barres s'arrêtent avec le mouvement réduit.
