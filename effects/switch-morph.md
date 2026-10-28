# `switch-morph`

**Catégorie :** Micro-interaction

## Intention
Un interrupteur dont la pastille s'étire pendant qu'on appuie puis glisse avec un rebond.

## Ce qu'on ressent
Tactile, satisfaisant, comme sur un téléphone.

## Utilisation
```html
<input type="checkbox" data-fx="switch-morph" aria-label="Mode sombre">
```

## Paramètres
- `--fx-switch-on` (accent), `--fx-switch-off` : couleurs du fond

## Quand l'utiliser
Réglages activé/désactivé.

## Quand l'éviter
Les choix qui ne sont pas binaires.

## Accessibilité
C'est une vraie case à cocher : clavier et lecteurs d'écran fonctionnent. Donnez-lui un `aria-label` ou un `<label>`.
