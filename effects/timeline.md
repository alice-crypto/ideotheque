# `timeline`

**Catégorie :** Présentation

## Intention
La ligne d'une frise se trace au fil du défilement et allume chaque étape qu'elle atteint.

## Ce qu'on ressent
Narratif, chronologique, progression.

## Utilisation
```html
<ol data-fx="timeline">
  <li>2019 — Création</li>
  <li>2023 — Lancement</li>
</ol>
```

## Paramètres
- `--fx-line` : couleur de la ligne tracée, `--fx-track` : couleur de fond

## Quand l'utiliser
Histoire d'une entreprise, parcours, étapes d'un projet.

## Quand l'éviter
Les frises de plus de dix étapes sur un petit écran.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, la frise est entièrement tracée.
