# `dive-intro`

**Catégorie :** Entrée

## Intention
Une ouverture plein écran : on descend en comptant, des anneaux s'ouvrent, puis la page apparaît dans un éclat.

## Ce qu'on ressent
On entre dans un monde, on ne charge pas une page.

## Utilisation
```html
<div data-fx="dive-intro" data-fx-once="true">
  <p>Il faut descendre pour trouver la lumière.</p>
</div>
```

## Paramètres
- `data-fx-from` (0), `data-fx-to` (4200), `data-fx-unit` (m), `data-fx-sign` (−)
- `data-fx-duration` (3400, en ms)
- `data-fx-once="true"` : une seule fois par session
- `data-fx-skip` (Passer) : texte du bouton
- `data-fx-local="true"` : reste dans son parent
- `--fx-di-bg`, `--fx-di-ink`
- `FX.trigger(el)` la rejoue ; l'événement `fx:intro-end` annonce la fin

## Quand l'utiliser
Lancements, sites de marque, expériences qui racontent quelque chose.

## Quand l'éviter
Un site d'usage, où l'on revient chaque jour : utilisez `data-fx-once`, ou rien.

## Accessibilité
Bouton « Passer », touches Échap, Espace et flèche bas, ou molette. Avec le mouvement réduit, l'ouverture est sautée.
