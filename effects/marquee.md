# `marquee`

**Catégorie :** Présentation

## Intention
Un bandeau de texte qui défile à l'infini, accélère quand on fait défiler la page et change de sens quand on remonte.

## Ce qu'on ressent
Énergique, vivant, la page réagit au geste.

## Utilisation
```html
<div data-fx="marquee" data-fx-speed="60">
  <span>Texte</span> ✳
</div>
```

## Paramètres
- `data-fx-speed` (60) : vitesse en pixels par seconde
- `data-fx-direction` (-1) : -1 vers la gauche, 1 vers la droite

## Quand l'utiliser
Bandeau de catégories, de clients ou de slogan entre deux sections.

## Quand l'éviter
Les informations importantes : un texte qui bouge se lit mal.

## Accessibilité
Les copies du bandeau sont masquées aux lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, le bandeau reste immobile.
