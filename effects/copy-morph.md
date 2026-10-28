# `copy-morph`

**Catégorie :** État

## Intention
Au clic, le bouton copie un texte et se transforme en « Copié ✓ », en vert, avant de revenir.

## Ce qu'on ressent
Confirmé, net, rassurant.

## Utilisation
```html
<button data-fx="copy-morph" data-fx-copy="npm i ideotheque">Copier</button>
```

## Paramètres
- `data-fx-copy` : texte copié dans le presse-papiers
- `data-fx-done` (Copié ✓) : texte de confirmation
- `--fx-ok` : couleur de confirmation

## Quand l'utiliser
Boutons de copie de code, de lien, de code promo.

## Quand l'éviter
Les actions qui ne copient rien.

## Accessibilité
Le nouveau texte du bouton est lu par les lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, le changement est immédiat.
