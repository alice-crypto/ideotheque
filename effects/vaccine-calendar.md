# `vaccine-calendar`

**Catégorie :** Présentation

## Intention
Des repères par âge se situent selon une date de naissance, et le prochain ressort.

## Ce qu'on ressent
Organisé, le prochain rendez-vous ne passe pas à la trappe.

## Utilisation
```html
<div data-fx="vaccine-calendar" data-fx-born="2026-01-15"></div>
```

## Paramètres
- `data-fx-items` : « libellé:mois » séparés par `|`
- `data-fx-born` : date de naissance

## Quand l'utiliser
Carnet de santé, entretien d'un véhicule, échéances par âge.

## Quand l'éviter
Un calendrier médical inventé : reliez-le au calendrier officiel.

## Accessibilité
Liste ordonnée, statuts écrits, repère suivant marqué par `aria-current`.
