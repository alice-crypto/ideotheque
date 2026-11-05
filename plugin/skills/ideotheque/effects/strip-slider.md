# `strip-slider`

**Catégorie :** Image

## Intention
Un diaporama où l'image suivante arrive par bandes verticales décalées.

## Ce qu'on ressent
Volets qui tournent, rythme de panneau publicitaire.

## Utilisation
```html
<figure data-fx="strip-slider" style="height:400px"><img src="a.jpg" alt="…"><img src="b.jpg" alt=""></figure>
```

## Paramètres
- `data-fx-strips` (8) : nombre de bandes
- `data-fx-hold` (3200) : durée d'une image en millisecondes
- Image suivante par code : `FX.trigger(el)`

## Quand l'utiliser
Couvertures, galeries d'accueil.

## Quand l'éviter
Des images dont le texte doit être lu.

## Accessibilité
Le diaporama se met en pause au survol. Avec `prefers-reduced-motion: reduce`, il ne change plus seul.
