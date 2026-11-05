# `ascii-image`

**Catégorie :** Image

## Intention
L'image se change en texte ASCII au survol, chaque signe suivant sa luminosité.

## Ce qu'on ressent
Machine qui lit l'image, terminal, culture hacker.

## Utilisation
```html
<figure data-fx="ascii-image"><img src="photo.jpg" alt="…"></figure>
```

## Paramètres
- `data-fx-cols` (46) : nombre de colonnes
- `--fx-ascii-bg`, `--fx-ascii-ink` : couleurs
- `data-fx-show` : affiche le texte en permanence

## Quand l'utiliser
Portfolios techniques, IA, jeux.

## Quand l'éviter
Une image hébergée sur un autre domaine sans autorisation CORS : le navigateur en interdit la lecture, et l'effet ne s'affiche pas.

## Accessibilité
L'image garde son texte alternatif, le texte ASCII est masqué aux lecteurs d'écran.
