# `prompt-suggestions`

**Catégorie :** État

## Intention
Des pastilles arrivent en cascade et proposent des idées ; un clic remplit le champ de l'assistant.

## Ce qu'on ressent
L'angoisse de la page blanche disparaît.

## Utilisation
```html
<div data-fx="prompt-suggestions" data-fx-target="#demande"><button>Résumer un texte</button></div>
```

## Paramètres
- `data-fx-target` : sélecteur du champ à remplir
- `data-prompt` : texte complet, s'il diffère du libellé
- L'élément émet `fx:pick`.

## Quand l'utiliser
Accueil d'un assistant, recherche, formulaires.

## Quand l'éviter
Plus de 5 suggestions : on ne les lit plus.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
