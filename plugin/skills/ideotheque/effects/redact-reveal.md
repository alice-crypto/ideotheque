# `redact-reveal`

**Catégorie :** Texte

## Intention
Le texte est caviardé de barres noires, qui se retirent mot à mot dans le désordre.

## Ce qu'on ressent
Secret, enquête, dossier déclassifié.

## Utilisation
```html
<p data-fx="redact-reveal">Le projet sera annoncé demain matin.</p>
```

## Paramètres
- `--fx-bar` : couleur des barres
- `--fx-stagger` (70ms) : écart entre deux mots

## Quand l'utiliser
Citations, chiffres révélés, révélation d'un nom.

## Quand l'éviter
Les longs textes : le désordre gêne la lecture.

## Accessibilité
Le texte est dans `aria-label` et reste lisible par les lecteurs d'écran dès le départ.
