# `typing-correct`

**Catégorie :** Texte

## Intention
Le texte s'écrit, fait une faute, efface et se corrige comme une vraie personne.

## Ce qu'on ressent
Humain, drôle, le mot juste vient après avoir hésité.

## Utilisation
```html
<h1 data-fx="typing-correct" data-fx-wrong="Bonne année">Bon anniversaire</h1>
```

## Paramètres
- `data-fx-wrong` : version fausse
- `data-fx-speed` (60)

## Quand l'utiliser
Accroches au ton léger, slogans.

## Quand l'éviter
De longs textes.

## Accessibilité
Le texte correct est dans `aria-label`. Avec `prefers-reduced-motion: reduce`, il s'affiche directement.
