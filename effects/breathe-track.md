# `breathe-track`

**Catégorie :** Texte

## Intention
L'espacement entre les lettres s'ouvre et se referme au rythme d'une respiration calme.

## Ce qu'on ressent
Apaisant, presque méditatif.

## Utilisation
```html
<p data-fx="breathe-track">Inspirez</p>
```

## Paramètres
- `data-fx-cycle` (6000) : durée d'un cycle en millisecondes
- `--fx-air` (.16em) : ouverture maximale

## Quand l'utiliser
Marques de bien-être, attente, écran de pause.

## Quand l'éviter
Les pages denses : le mot change de largeur et déplace ses voisins.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
