# `tab-slider`

**Catégorie :** Navigation

## Intention
Un indicateur en forme de pastille glisse jusqu'à l'onglet choisi.

## Ce qu'on ressent
Fluide, précis, application moderne.

## Utilisation
```html
<div data-fx="tab-slider">
  <button aria-selected="true">Mois</button>
  <button>Année</button>
</div>
```

## Paramètres
- `--fx-indicator`, `--fx-indicator-ink` : couleurs
- `--fx-indicator-radius` (999px) : arrondi

## Quand l'utiliser
Onglets, filtres, sélecteurs mensuel / annuel.

## Quand l'éviter
Plus de six onglets : le déplacement devient long.

## Accessibilité
Le conteneur reçoit `role="tablist"` et les boutons `role="tab"` avec `aria-selected`.
