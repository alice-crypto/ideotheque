# `citation-pop`

**Catégorie :** État

## Intention
Des pastilles numérotées marquent les sources d'une réponse, et s'ouvrent en aperçu au survol.

## Ce qu'on ressent
Sérieux, vérifiable, on peut remonter à l'origine.

## Utilisation
```html
<p data-fx="citation-pop">Selon l'étude <a data-source="Rapport 2026" href="…"></a>…</p>
```

## Paramètres
- `data-source` sur un `<a>` ou un `<span>` : titre de la source

## Quand l'utiliser
Réponses d'assistants, rapports, articles.

## Quand l'éviter
De fausses sources : chaque pastille doit pointer vers une vraie référence.

## Accessibilité
Chaque pastille a un nom complet pour les lecteurs d'écran.
