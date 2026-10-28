# `dot-nav`

**Catégorie :** Navigation

## Intention
Des points de navigation verticaux ; celui de la section visible s'étire et prend la couleur d'accent.

## Ce qu'on ressent
Minimal, repère discret dans une page longue.

## Utilisation
```html
<nav data-fx="dot-nav">
  <a href="#intro">Intro</a>
  <a href="#offre">Offre</a>
</nav>
```

## Paramètres
- Liens `<a href="#section">` vers les sections
- `--fx-dot`, `--fx-dot-active` : couleurs

## Quand l'utiliser
Pages en sections plein écran, récits, présentations.

## Quand l'éviter
Les pages courtes ou sans sections nettes.

## Accessibilité
Les liens gardent leur texte (masqué visuellement par `font-size: 0`) et le lien actif reçoit `aria-current`.
