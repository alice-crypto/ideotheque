# `depth-journey`

**Catégorie :** Ambiance

## Intention
Toute la page change de lumière en continu pendant le défilement : chaque repère donne une couleur de fond et une couleur de texte, le reste est interpolé.

## Ce qu'on ressent
On voyage d'un monde à l'autre sans jamais voir de coupure.

## Utilisation
```html
<div data-fx="depth-journey" hidden></div>
<section data-fx-stop="#03060f,#e9f3f5">…</section>
<section data-fx-stop="#f5eadf,#1b2230">…</section>
```

## Paramètres
- Sur la page : un élément `data-fx="depth-journey"`, et des repères `data-fx-stop="#fond,#encre"`
- Variables produites : `--fx-j-bg`, `--fx-j-ink`, `--fx-j-i`
- `data-fx-stops="#a,#b|#c,#d"` et `data-fx-auto` : version en boucle sur l'élément

## Quand l'utiliser
Les récits longs, une page qui va de la nuit au jour.

## Quand l'éviter
Des fonds intermédiaires où l'encre manque de contraste : vérifiez chaque repère.

## Accessibilité
Le texte bascule vite autour du milieu de la transition pour rester lisible. Le changement suit le geste de la personne.
