# `ai-orb`

**Catégorie :** État

## Intention
Un orbe de couleur qui respire doucement, puis tourbillonne quand l'assistant réfléchit.

## Ce qu'on ressent
Présence calme, organique ; signale qu'une IA écoute.

## Utilisation
```html
<span data-fx="ai-orb" data-fx-state="thinking"></span>
```

## Paramètres
- `--fx-size` (64px)
- `--fx-o1`, `--fx-o2`, `--fx-o3` : les trois couleurs
- `data-fx-state="thinking"` : tourbillon rapide

## Quand l'utiliser
Avatar d'assistant, bouton « Demander à l'IA », état d'écoute vocale.

## Quand l'éviter
Plusieurs orbes sur un même écran : l'assistant doit rester unique.

## Accessibilité
Décoratif : ajoutez `aria-hidden="true"` et annoncez l'état en texte. Avec `prefers-reduced-motion: reduce`, l'orbe reste immobile.
