# `highlight-terms-sweep`

**Catégorie :** Texte

## Intention
Des mots clés se surlignent l'un après l'autre dans un paragraphe.

## Ce qu'on ressent
Un lecteur attentif a déjà préparé le texte.

## Utilisation
```html
<p data-fx="highlight-terms-sweep" data-fx-terms="rapide|simple">Un outil rapide et simple.</p>
```

## Paramètres
- `data-fx-terms` : termes séparés par `|`
- `--fx-mark` : couleur

## Quand l'utiliser
Résumés, résultats de recherche, réponses d'IA.

## Quand l'éviter
Trop de termes : plus rien ne ressort.

## Accessibilité
`<mark>` garde son sens pour les technologies d'assistance.
