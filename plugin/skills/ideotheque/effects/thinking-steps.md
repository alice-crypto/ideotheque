# `thinking-steps`

**Catégorie :** État

## Intention
Les étapes d'un agent s'enchaînent : chacune tourne le temps du travail, puis se coche.

## Ce qu'on ressent
Transparent, rassurant : on voit ce que l'IA fait.

## Utilisation
```html
<ol data-fx="thinking-steps">
  <li>Lecture du fichier</li>
  <li>Analyse</li>
  <li>Rédaction</li>
</ol>
```

## Paramètres
- `data-fx-step` (900) : durée moyenne d'une étape, en millisecondes
- `--fx-accent` : couleur des étapes faites
- L'élément émet `fx:done` à la fin.

## Quand l'utiliser
Agents, imports, analyses en plusieurs temps.

## Quand l'éviter
Les attentes de moins d'une seconde : affichez directement le résultat.

## Accessibilité
Ajoutez `aria-live="polite"` sur la liste si les étapes doivent être annoncées. Avec `prefers-reduced-motion: reduce`, toutes les étapes s'affichent cochées.
