# `streaming-code`

**Catégorie :** État

## Intention
Du code s'écrit tout seul, par petits groupes de signes, avec une coloration simple.

## Ce qu'on ressent
Assistant au travail, productivité de programmeur.

## Utilisation
```html
<pre data-fx="streaming-code">const a = 1;</pre>
```

## Paramètres
- `data-fx-speed` (22) : millisecondes entre deux groupes
- `--fx-kw`, `--fx-str` : couleurs
- L'élément émet `fx:done`.

## Quand l'utiliser
Présentation d'un assistant de code, documentation.

## Quand l'éviter
De longs fichiers : l'attente devient lassante.

## Accessibilité
Le code complet est dans `aria-label`.
