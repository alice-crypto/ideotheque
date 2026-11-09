# `chapter-pin`

**Catégorie :** Défilement

## Intention
Un récit en chapitres tenu à l'écran : le défilement fait passer de l'un à l'autre, et une frise segmentée montre l'avancement.

## Ce qu'on ressent
On tourne les pages d'une histoire, à son propre rythme.

## Utilisation
```html
<section data-fx="chapter-pin">
  <article>…</article>
  <article>…</article>
  <article>…</article>
</section>
```

## Paramètres
- Enfants directs : un par chapitre
- `--fx-track-bottom`, `--fx-track-pad` : place de la frise
- `el.fxProgress` : avancement, de 0 à 1
- `data-fx-auto` (en ms) : boucle, et `--fx-h`

## Quand l'utiliser
Genèse d'un produit, trois idées à poser l'une après l'autre.

## Quand l'éviter
Plus de cinq chapitres : on a l'impression d'être retenu.

## Accessibilité
Tous les chapitres restent dans le document. Mouvement réduit : ils s'affichent les uns sous les autres, sans épinglage.
