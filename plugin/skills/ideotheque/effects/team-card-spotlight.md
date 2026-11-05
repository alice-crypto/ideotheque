# `team-card-spotlight`

**Catégorie :** Présentation

## Intention
Des visages se chevauchent : celui qu'on survole passe devant, grandit, et son nom s'affiche.

## Ce qu'on ressent
Une équipe proche, on rencontre chacun à son tour.

## Utilisation
```html
<div data-fx="team-card-spotlight"><img data-name="Noa" data-role="Design" alt="" src="noa.jpg"></div>
```

## Paramètres
- `data-name`, `data-role` sur chaque visage
- `--fx-size` (56px)

## Quand l'utiliser
Pages « à propos », avis, signatures de lettres.

## Quand l'éviter
De très grandes équipes.

## Accessibilité
Le nom change avec `aria-live`, et chaque visage peut recevoir le focus.
