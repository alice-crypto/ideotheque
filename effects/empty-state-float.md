# `empty-state-float`

**Catégorie :** État

## Intention
Une illustration flotte doucement, son ombre suit, et un message invite à commencer.

## Ce qu'on ressent
Chaleureux, un écran vide qui donne envie d'agir.

## Utilisation
```html
<div data-fx="empty-state-float"><img src="vide.svg" alt=""><p>Rien pour l'instant.</p></div>
```

## Paramètres
Le premier enfant flotte, les suivants sont le texte et le bouton.

## Quand l'utiliser
Listes vides, premier usage, résultats absents.

## Quand l'éviter
De masquer une erreur derrière un état vide.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
