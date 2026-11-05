# `pill-nav-morph`

**Catégorie :** Navigation

## Intention
Une barre en pilule se réduit à l'essentiel quand on descend, et s'ouvre de nouveau au survol.

## Ce qu'on ressent
Discrète, elle laisse la place au contenu sans s'en aller.

## Utilisation
```html
<nav data-fx="pill-nav-morph"><a>Logo</a><div class="fx-more"><div><a>Offres</a><a>Blog</a></div></div><a>Essayer</a></nav>
```

## Paramètres
- `data-fx-after` (120) : position à partir de laquelle elle se réduit
- Les liens secondaires vont dans `.fx-more > div`.

## Quand l'utiliser
Sites vitrines, longues pages produit.

## Quand l'éviter
Une application avec beaucoup de sections.

## Accessibilité
La barre revient à sa taille pleine dès qu'un lien reçoit le focus.
