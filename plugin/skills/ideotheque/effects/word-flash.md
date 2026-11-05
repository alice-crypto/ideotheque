# `word-flash`

**Catégorie :** Transition

## Intention
Pendant le passage, quelques mots géants s'enchaînent en rafale sur un aplat de couleur.

## Ce qu'on ressent
Bande-annonce, montage serré, voix forte.

## Utilisation
```html
<a href="/lancement" data-fx="word-flash" data-fx-words="Prêt|Partez">Lancement</a>
```

## Paramètres
- `data-fx-words` sur le lien : mots séparés par `|`
- `--fx-tr-color`, `--fx-tr-ink` : couleurs

## Quand l'utiliser
Pages de campagne, annonces, lancements.

## Quand l'éviter
La navigation habituelle d'un site, vite répétitive.

## Accessibilité
Les mots sont décoratifs. Évitez de les faire clignoter davantage : au-delà de trois éclairs par seconde, l'effet peut gêner certaines personnes. Avec `prefers-reduced-motion: reduce`, aucune transition.
