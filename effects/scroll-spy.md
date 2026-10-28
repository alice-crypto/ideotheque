# `scroll-spy`

**Catégorie :** Navigation

## Intention
Dans un sommaire, le lien de la section en cours de lecture est mis en avant et une barre le suit.

## Ce qu'on ressent
Orientant, on sait toujours où l'on est.

## Utilisation
```html
<nav data-fx="scroll-spy">
  <a href="#partie-1">Partie 1</a>
  <a href="#partie-2">Partie 2</a>
</nav>
```

## Paramètres
- Liens `<a href="#section">` vers les sections
- `--fx-spy` : couleur de la barre, `--fx-spy-off` : liens inactifs

## Quand l'utiliser
Sommaires d'articles, documentation, pages de règlement.

## Quand l'éviter
Les sommaires de plus de quinze entrées.

## Accessibilité
Le lien actif reçoit `aria-current`. Avec `prefers-reduced-motion: reduce`, le défilement vers une section est immédiat.
