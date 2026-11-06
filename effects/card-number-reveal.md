# `card-number-reveal`

**Catégorie :** Micro-interaction

## Intention
Un numéro de carte reste masqué, sauf ses derniers chiffres, et se révèle quelques secondes à la demande.

## Ce qu'on ressent
Sécurité visible, on garde la main.

## Utilisation
```html
<span data-fx="card-number-reveal" data-fx-number="4000 0000 0000 0002"></span>
```

## Paramètres
- `data-fx-number` : numéro avec des espaces
- `data-fx-hold` (6000) : durée d'affichage

## Quand l'utiliser
Cartes virtuelles, maquettes de banques.

## Quand l'éviter
De vrais numéros en clair dans le HTML : chargez-les seulement à la demande depuis votre serveur.

## Accessibilité
Le bouton expose `aria-pressed`.
