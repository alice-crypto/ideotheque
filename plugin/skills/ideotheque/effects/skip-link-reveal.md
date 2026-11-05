# `skip-link-reveal`

**Catégorie :** Navigation

## Intention
Un lien « Aller au contenu » reste caché et descend quand on arrive sur la page au clavier.

## Ce qu'on ressent
Attention discrète pour les personnes qui naviguent au clavier.

## Utilisation
```html
<a href="#contenu" data-fx="skip-link-reveal">Aller au contenu</a>
```

## Paramètres
- `href` : l'ancre du contenu principal
- `--fx-pos` (fixed) : positionnement
- `data-fx-show` : force l'affichage, pour tester

## Quand l'utiliser
Tous les sites, à mettre en premier dans `<body>`.

## Quand l'éviter
Rien : cet effet ne gêne personne.

## Accessibilité
Conçu pour le clavier : le focus passe réellement sur la cible après le saut.
