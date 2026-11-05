# `liquid-glass`

**Catégorie :** Micro-interaction

## Intention
Une plaque de verre floute ce qui passe derrière, et son reflet suit le curseur.

## Ce qu'on ressent
Matière précieuse, interface en couches, lumière réelle.

## Utilisation
```html
<div data-fx="liquid-glass">…</div>
```

## Paramètres
- `--fx-blur` (14px) : flou de l'arrière-plan
- `--fx-radius` (22px) : arrondi

## Quand l'utiliser
Cartes et barres posées sur une image ou un dégradé.

## Quand l'éviter
Un fond uni : on ne voit pas le verre. Vérifiez aussi le contraste du texte.

## Accessibilité
Avec `prefers-reduced-motion: reduce`, l'effet est désactivé et le contenu s'affiche directement.
