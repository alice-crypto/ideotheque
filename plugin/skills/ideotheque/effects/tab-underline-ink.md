# `tab-underline-ink`

**Catégorie :** Navigation

## Intention
Le trait sous l'onglet s'étire jusqu'au suivant, puis se rétracte, comme une goutte d'encre.

## Ce qu'on ressent
Fluide, organique, un détail qui signe l'interface.

## Utilisation
```html
<div data-fx="tab-underline-ink" role="tablist"><button role="tab">Jour</button><button role="tab">Mois</button></div>
```

## Paramètres
Aucun réglage : le trait suit l'onglet choisi.

## Quand l'utiliser
Onglets, filtres, sélecteurs de période.

## Quand l'éviter
Plus de 6 onglets sur une ligne.

## Accessibilité
L'état `aria-selected` suit l'onglet actif. Ajoutez vos panneaux avec `aria-controls`.
