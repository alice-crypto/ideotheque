# `knob-dial`

**Catégorie :** Micro-interaction

## Intention
Un bouton rotatif qu'on tourne en glissant vers le haut ou vers le bas, comme sur une console.

## Ce qu'on ressent
Matériel, précis, le plaisir d'un vrai bouton.

## Utilisation
```html
<div data-fx="knob-dial" aria-label="Volume"></div>
```

## Paramètres
- `data-fx-min` (0), `data-fx-max` (100), `data-fx-value` (40)
- `--fx-size` (96px), `--fx-knob` : taille et couleur
- L'élément émet `fx:change`.

## Quand l'utiliser
Outils de création, audio, simulateurs.

## Quand l'éviter
Une saisie précise dans un formulaire : préférez un champ.

## Accessibilité
Rôle `slider` réglable au clavier. Donnez-lui un `aria-label`.
