# `flip-scrub`

**Catégorie :** Défilement

## Intention
Une carte à deux faces se retourne au fil du défilement.

## Ce qu'on ressent
Un avant et un après, une carte tournée sur une table.

## Utilisation
```html
<div data-fx="flip-scrub"><div>Avant</div><div>Après</div></div>
```

## Paramètres
Le premier enfant est la face, le dernier est le dos.

## Quand l'utiliser
Avant / après, question / réponse.

## Quand l'éviter
Les deux faces de hauteur très différente.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
