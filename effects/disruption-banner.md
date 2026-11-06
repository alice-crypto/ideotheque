# `disruption-banner`

**Catégorie :** État

## Intention
Une alerte de perturbation prend la couleur et le rôle de sa gravité, et peut être fermée.

## Ce qu'on ressent
Clair et net, sans dramatiser.

## Utilisation
```html
<div data-fx="disruption-banner" data-fx-level="warn">Ligne 4 ralentie</div>
```

## Paramètres
- `data-fx-level` : `info`, `warn` ou `stop`
- `data-fx-key` : mémorise la fermeture

## Quand l'utiliser
Transports, statuts de service, maintenance.

## Quand l'éviter
De laisser une alerte `stop` se fermer si elle reste vitale pour la suite du parcours.

## Accessibilité
Rôle `alert` si grave, `status` sinon, bouton de fermeture nommé.
