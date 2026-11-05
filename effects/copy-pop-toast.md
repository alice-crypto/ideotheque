# `copy-pop-toast`

**Catégorie :** Micro-interaction

## Intention
Une petite bulle apparaît à l'endroit du clic pour confirmer l'action, puis s'envole.

## Ce qu'on ressent
Le retour arrive là où on regarde, sans bruit.

## Utilisation
```html
<button data-fx="copy-pop-toast" data-fx-copy="npm i">Copier</button>
```

## Paramètres
- `data-fx-message` (Copié !) : texte de la bulle
- `data-fx-copy` : texte à copier dans le presse-papiers

## Quand l'utiliser
Copier un code, ajouter aux favoris, enregistrer.

## Quand l'éviter
Une erreur ou une information à lire longtemps : préférez `toast`.

## Accessibilité
La bulle a le rôle `status`, annoncé par les lecteurs d'écran.
