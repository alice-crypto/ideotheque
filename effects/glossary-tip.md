# `glossary-tip`

**Catégorie :** Micro-interaction

## Intention
Les mots techniques d'un texte s'ouvrent sur leur définition, un à la fois.

## Ce qu'on ressent
On apprend sans quitter sa lecture.

## Utilisation
```html
<p data-fx="glossary-tip">La <span data-def="Ce qui reste à votre charge.">franchise</span> s'applique.</p>
```

## Paramètres
- `data-def` sur chaque mot : sa définition
- `--fx-w` (180px), `--fx-tip`

## Quand l'utiliser
Contrats, finance, santé, droit, documentation.

## Quand l'éviter
Une définition cachée indispensable : les notions clés doivent rester écrites.

## Accessibilité
Vrais boutons avec `aria-expanded`, fermeture par Échap.
