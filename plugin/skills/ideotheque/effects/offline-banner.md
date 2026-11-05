# `offline-banner`

**Catégorie :** État

## Intention
Un bandeau descend quand la connexion se perd, puis passe au vert au retour et s'efface.

## Ce qu'on ressent
Rassurant : le problème est connu et rien n'est perdu.

## Utilisation
```html
<div data-fx="offline-banner"></div>
```

## Paramètres
- `data-fx-off`, `data-fx-on` : messages
- `--fx-off`, `--fx-on` : couleurs

## Quand l'utiliser
Applications web, éditeurs, formulaires longs.

## Quand l'éviter
De promettre un envoi différé que l'application ne fait pas : adaptez le message.

## Accessibilité
Rôle `status`. Le message reste écrit en toutes lettres.
