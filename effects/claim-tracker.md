# `claim-tracker`

**Catégorie :** Présentation

## Intention
Une liste d'étapes montre l'avancement d'un dossier, avec l'étape en cours qui bat.

## Ce qu'on ressent
On sait où en est son dossier, sans appeler.

## Utilisation
```html
<div data-fx="claim-tracker" data-fx-items="Déclaré:3 mars|Expertise:en cours" data-fx-current="1"></div>
```

## Paramètres
- `data-fx-items` : « étape:date » séparés par `|`
- `data-fx-current` (2) : rang de l'étape en cours

## Quand l'utiliser
Sinistres, remboursements, démarches, commandes.

## Quand l'éviter
Une date d'étape estimée présentée comme certaine.

## Accessibilité
Vraie liste ordonnée, avec `aria-current="step"`.
