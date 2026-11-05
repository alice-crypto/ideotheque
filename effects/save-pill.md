# `save-pill`

**Catégorie :** État

## Intention
Une pastille discrète indique « Enregistrement… » puis « Enregistré », et s'efface.

## Ce qu'on ressent
Tranquillité, on sait que rien n'est perdu.

## Utilisation
```html
<span data-fx="save-pill"></span>
```

## Paramètres
- `FX.trigger(el)` à chaque changement
- Par code : `el._fxSt('saving' | 'saved' | 'error' | 'idle')`

## Quand l'utiliser
Éditeurs, formulaires longs, réglages.

## Quand l'éviter
De dire « Enregistré » sans enregistrement réel : branchez-la sur la vraie réponse du serveur.

## Accessibilité
Rôle `status`, annoncé aux lecteurs d'écran.
