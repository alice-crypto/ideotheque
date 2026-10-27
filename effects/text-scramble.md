# `text-scramble`

**Catégorie :** Présentation

## Intention
Un texte brouillé en signes aléatoires qui se décode lettre par lettre, de gauche à droite.

## Ce qu'on ressent
Technique, mystérieux, comme un signal capté.

## Utilisation
```html
<p data-fx="text-scramble" data-fx-hover="true">SIGNAL REÇU</p>
```

## Paramètres
- `data-fx-duration` (1200, en ms)
- `data-fx-hover="true"` : rejoue le décodage au survol

## Quand l'utiliser
Sur-titres, étiquettes, codes, petits textes en majuscules dans une police à chasse fixe.

## Quand l'éviter
Les paragraphes, et les polices proportionnelles (le texte change de largeur pendant le brouillage).

## Accessibilité
Le texte final est exposé aux lecteurs d'écran via `aria-label`. Avec `prefers-reduced-motion: reduce`, le texte s'affiche directement.
