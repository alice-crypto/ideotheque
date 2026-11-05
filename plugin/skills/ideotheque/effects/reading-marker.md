# `reading-marker`

**Catégorie :** Défilement

## Intention
Les mots passent du gris au plein quand ils atteignent la ligne de lecture.

## Ce qu'on ressent
Un doigt qui suit la ligne, un texte qu'on découvre.

## Utilisation
```html
<p data-fx="reading-marker">Chaque mot s'allume quand vous l'atteignez.</p>
```

## Paramètres
- `data-fx-line` (.65) : hauteur de la ligne de lecture dans l'écran
- `--fx-dim` (.22) : opacité des mots non lus

## Quand l'utiliser
Manifestes, déclarations d'intention.

## Quand l'éviter
Le texte d'un article entier, qui doit rester lisible tout de suite.

## Accessibilité
Les mots restent visibles et le texte complet est dans `aria-label`.
