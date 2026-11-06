# `ask-pharmacist`

**Catégorie :** Navigation

## Intention
Une bulle s'ouvre sur les questions fréquentes, en petites cartes qui arrivent en cascade.

## Ce qu'on ressent
On a l'impression qu'il y a quelqu'un au comptoir.

## Utilisation
```html
<div data-fx="ask-pharmacist" data-fx-items="Vos horaires ?|Livrez-vous ?"></div>
```

## Paramètres
- `data-fx-items` : questions séparées par `|`
- `data-fx-title` ; événement `fx:ask`

## Quand l'utiliser
Pharmacie en ligne, assistance, boutiques.

## Quand l'éviter
De faire croire qu'un humain répond si c'est un automate.

## Accessibilité
`aria-expanded`, focus dans le panneau, fermeture par Échap.
