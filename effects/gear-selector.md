# `gear-selector`

**Catégorie :** Micro-interaction

## Intention
Un levier P R N D sert de contrôle à plusieurs états, avec un petit claquement.

## Ce qu'on ressent
La sensation d'une vraie commande, dans un site.

## Utilisation
```html
<div data-fx="gear-selector"></div>
```

## Paramètres
- `data-fx-items` : « lettre:nom » séparés par `|`
- événement `fx:gear`

## Quand l'utiliser
Sites automobiles, modes d'une application.

## Quand l'éviter
Des états sans rapport : le levier n'a de sens que pour des modes bien distincts.

## Accessibilité
Groupe radio complet : flèches, focus géré, et état annoncé.
