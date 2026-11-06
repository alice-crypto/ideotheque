# `bank-card-flip`

**Catégorie :** Image

## Intention
Une carte bancaire s'oriente vers le curseur, et se retourne au clic pour montrer son dos.

## Ce qu'on ressent
Objet désirable, on a envie de la tenir.

## Utilisation
```html
<div data-fx="bank-card-flip" aria-label="Carte"><div class="fx-bc"><div class="fx-f">…</div><div class="fx-b">…</div></div></div>
```

## Paramètres
- `--fx-w` (240px), `--fx-card` : fond
- Structure : `.fx-bc` contenant `.fx-f` et `.fx-b`

## Quand l'utiliser
Néobanques, offres de cartes.

## Quand l'éviter
Le logo ou le visuel d'une vraie carte que vous n'avez pas le droit d'utiliser.

## Accessibilité
Rôle `button`, activable au clavier. Donnez-lui un `aria-label`.
