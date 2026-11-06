# `on-duty-list`

**Catégorie :** Présentation

## Intention
Une liste met en tête ce qui est ouvert maintenant, selon l'heure locale.

## Ce qu'on ressent
La réponse à la question qu'on se pose à 23 h.

## Utilisation
```html
<div data-fx="on-duty-list" data-fx-items="Pharmacie du Port:8:20"></div>
```

## Paramètres
- `data-fx-items` : « nom:ouverture:fermeture » séparés par `|`

## Quand l'utiliser
Pharmacies, commerces, urgences, services de garde.

## Quand l'éviter
Des horaires de garde figés : ils changent chaque semaine, reliez-les à leur source.

## Accessibilité
L'état est écrit en mots, pas seulement par la couleur.
