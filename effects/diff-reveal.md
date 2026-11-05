# `diff-reveal`

**Catégorie :** État

## Intention
Le texte se corrige sous nos yeux : les mots retirés se barrent, les mots ajoutés se surlignent.

## Ce qu'on ressent
Relecture soigneuse, on comprend ce qui a changé.

## Utilisation
```html
<p data-fx="diff-reveal">Un texte <del>trop long</del> <ins>plus court</ins>.</p>
```

## Paramètres
- Utilisez `<del>` et `<ins>` dans le texte
- `--fx-del`, `--fx-ins` : couleurs

## Quand l'utiliser
Réécriture par IA, comparaison de versions, relecture.

## Quand l'éviter
Un grand nombre de changements : préférez une vue en deux colonnes.

## Accessibilité
`<del>` et `<ins>` gardent leur sens pour les technologies d'assistance.
