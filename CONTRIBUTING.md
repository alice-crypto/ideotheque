# Contribuer à Idéothèque

Merci de vouloir enrichir la bibliothèque. Chaque effet est une **idée nommée** : la contribution compte autant pour sa fiche que pour son code.

## Proposer un effet

1. **Vérifiez qu'il n'existe pas déjà.** Parcourez le catalogue (`index.html`) et le tableau de `AI.md`.
2. **Choisissez un nom** en anglais, court et en kebab-case, qui évoque le ressenti plutôt que la technique : `curtain-soft` plutôt que `clip-path-reveal`.
3. **Écrivez le code** dans `dist/fx.css` et, si nécessaire, dans `dist/fx.js` :
   - activation par `data-fx="<nom>"`, réglages par variables CSS `--fx-*` ou attributs `data-fx-*` ;
   - aucune dépendance ;
   - respect de `prefers-reduced-motion` : le contenu doit rester visible et utilisable.
4. **Rédigez la fiche** `effects/<nom>.md` sur le modèle des fiches existantes : intention, ressenti, utilisation, paramètres, quand l'utiliser, quand l'éviter, accessibilité.
5. **Ajoutez la démo** dans `index.html` (tableau `EFFECTS`) et la ligne dans `AI.md`.

## Règle d'originalité

On peut s'inspirer d'un effet vu sur un site, mais on le **réécrit entièrement**. On ne copie jamais le code, les images, les polices ni les textes d'un autre site. Les visuels de démonstration sont créés pour la bibliothèque (SVG dans `assets/`).

## Tester

```bash
npm start
```

Puis ouvrez http://localhost:5180. Vérifiez votre effet sur ordinateur, sur mobile et avec le mouvement réduit activé dans le système.
