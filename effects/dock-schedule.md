# `dock-schedule`

**Catégorie :** Présentation

## Intention
Un planning montre l'occupation des quais sur la journée et ceux qui sont libres maintenant.

## Ce qu'on ressent
Le chef de quai sait quoi répondre au chauffeur qui arrive.

## Utilisation
```html
<div data-fx="dock-schedule" data-fx-items="Quai 1:7-9,11-13"></div>
```

## Paramètres
- `data-fx-items` : « quai:début-fin,début-fin » séparés par `|`
- `data-fx-start` (6), `data-fx-end` (20)

## Quand l'utiliser
Entrepôts, salles, ateliers, plannings d'équipes.

## Quand l'éviter
Un planning très chargé en petit format : les créneaux deviennent illisibles.

## Accessibilité
Le planning est décoratif et le résultat est écrit. Pour un planning complet, fournissez un tableau.
