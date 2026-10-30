# `fill-up`

**Catégorie :** Micro-interaction

## Intention
Le fond se remplit depuis le bas au survol, avec un bord arrondi qui s'aplatit en montant.

## Ce qu'on ressent
Liquide, généreux, appel à l'action.

## Utilisation
```html
<a class="bouton" href="…" data-fx="fill-up">Découvrir</a>
```

## Paramètres
- `--fx-fill` (accent) : couleur de remplissage
- `--fx-fill-ink` : couleur du texte une fois rempli

## Quand l'utiliser
Boutons secondaires, liens de menu en capsule.

## Quand l'éviter
Les boutons déjà pleins : le remplissage ne se voit pas.

## Accessibilité
Les effets de survol se déclenchent aussi au focus clavier quand c'est possible. Avec `prefers-reduced-motion: reduce`, les transitions sont instantanées.
