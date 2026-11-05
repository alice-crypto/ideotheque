# `timeline-scrub`

**Catégorie :** Présentation

## Intention
Une frise de dates : survoler ou choisir une date remplit le rail et affiche son histoire.

## Ce qu'on ressent
Récit maîtrisé, on remonte le temps à son rythme.

## Utilisation
```html
<div data-fx="timeline-scrub"><p data-date="2019">Création.</p><p data-date="2024">Lancement.</p></div>
```

## Paramètres
- Chaque enfant porte `data-date` et contient son texte.

## Quand l'utiliser
Histoire d'une entreprise, parcours, versions d'un produit.

## Quand l'éviter
Plus de 7 dates sur une ligne.

## Accessibilité
Rôles `tablist` et `tab`, flèches au clavier, changement annoncé par `aria-live`.
