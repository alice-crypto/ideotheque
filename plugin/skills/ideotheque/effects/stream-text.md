# `stream-text`

**Catégorie :** Texte

## Intention
La réponse arrive par petits groupes de mots, à un rythme irrégulier, derrière un curseur plein : comme un modèle qui génère.

## Ce qu'on ressent
Vivant, « quelqu'un répond en ce moment ». Le geste visuel de l'IA.

## Utilisation
```html
<p data-fx="stream-text">Voici trois pistes pour votre lancement…</p>
```

## Paramètres
- `data-fx-speed` (55) : millisecondes par mot, en moyenne
- `--fx-caret` : couleur du curseur
- Nouvelle réponse : `el.dataset.fxText = "…"` puis `FX.replay(el)`. L'élément émet `fx:done` à la fin.

## Quand l'utiliser
Réponses d'assistant, résumés, démonstrations d'une fonction d'IA.

## Quand l'éviter
Les textes qu'on doit lire vite ou relire : l'effet impose son rythme.

## Accessibilité
Le texte complet est dans `aria-label` dès le départ, les mots affichés sont masqués aux lecteurs d'écran. Avec `prefers-reduced-motion: reduce`, la réponse s'affiche en entier.
