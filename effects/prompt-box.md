# `prompt-box`

**Catégorie :** Présentation

## Intention
Un champ de saisie qui écrit tout seul des exemples de demandes, les garde un instant, puis les efface.

## Ce qu'on ressent
Invitant : montre ce qu'on peut demander sans l'expliquer.

## Utilisation
```html
<div data-fx="prompt-box" data-fx-prompts="Résume ce rapport|Écris un e-mail de relance"></div>
```

## Paramètres
- `data-fx-prompts` : demandes séparées par `|`
- `data-fx-speed` (45) : millisecondes par lettre
- `data-fx-hold` (1800) : temps d'affichage
- `--fx-prompt-bg`, `--fx-prompt-line`, `--fx-radius` (18px)

## Quand l'utiliser
Héros de produit d'IA, page d'accueil d'un assistant, état vide d'un chat.

## Quand l'éviter
À la place d'un vrai champ : c'est une vitrine, pas une saisie.

## Accessibilité
Le champ a `role="img"` et la liste des exemples dans `aria-label`. Avec `prefers-reduced-motion: reduce`, le premier exemple reste affiché.
