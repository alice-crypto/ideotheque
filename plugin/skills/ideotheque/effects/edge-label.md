# `edge-label`

**Catégorie :** Texte

## Intention
Un texte vertical posé sur le bord, qui glisse doucement au fil du défilement.

## Ce qu'on ressent
Éditorial, magazine, il structure la page.

## Utilisation
```html
<span data-fx="edge-label">Chapitre 02</span>
```

## Paramètres
- `--fx-travel` (60%) : amplitude du glissement

## Quand l'utiliser
Numéros de section, noms de chapitre, mentions sur le côté.

## Quand l'éviter
Les informations essentielles : le texte vertical se lit mal.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, le texte garde sa position de départ.
