# `feature-orbit-card`

**Catégorie :** Présentation

## Intention
Une liste de fonctions dont l'élément actif change seul, avec une barre qui montre le temps restant.

## Ce qu'on ressent
Une présentation qui se déroule, sans jamais perdre la personne.

## Utilisation
```html
<ul data-fx="feature-orbit-card"><li>Rapide</li><li>Simple</li></ul>
```

## Paramètres
- `data-fx-hold` (3.2) : secondes par élément

## Quand l'utiliser
Sections de fonctions d'une page produit.

## Quand l'éviter
Un texte long à lire dans le temps imparti.

## Accessibilité
Pause au survol, réagit au focus. Avec `prefers-reduced-motion: reduce`, le défilement automatique s'arrête.
