# `quote-resume`

**Catégorie :** Micro-interaction

## Intention
Un formulaire s'enregistre en local à chaque saisie, et se reprend à la visite suivante.

## Ce qu'on ressent
Respect du temps déjà donné.

## Utilisation
```html
<form data-fx="quote-resume"><input name="ville"></form>
```

## Paramètres
- `data-fx-key` : clé d'enregistrement
- chaque champ doit avoir un `name`

## Quand l'utiliser
Devis, candidatures, longs formulaires.

## Quand l'éviter
D'enregistrer des données de santé ou bancaires dans le navigateur.

## Accessibilité
Les messages sont dans une région `status`. Les champs sensibles ne doivent pas être enregistrés.
