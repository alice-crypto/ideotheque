---
name: ideotheque
description: Applique les effets visuels nommés de la bibliothèque Idéothèque (206 animations, transitions plein écran, effets de texte, de défilement, micro-interactions, ambiances, états d'IA) sur une page web ou une interface. À utiliser quand l'utilisateur cite un effet par son nom (curtain-soft, line-mask, magnetic, count-up, aurora, ai-orb…), parle d'Idéothèque ou de data-fx, ou demande d'animer, de rendre plus vivante, plus « Awwwards » ou plus soft une landing page, un dashboard ou un site. Use it for named web animations and page transitions too.
---

# Idéothèque

Idéothèque est une bibliothèque libre (MIT) de 206 effets visuels. Chaque effet a **un nom**, **une intention** et une fiche qui fixe son rendu. Quand l'utilisateur cite un nom, il attend exactement cet effet, pas une variante.

Catalogue en ligne, avec une démo de chaque effet : https://alice-crypto.github.io/ideotheque/

## Fichiers de ce skill

- [catalogue.md](catalogue.md) : les règles, la liste des 206 effets avec leur catégorie et leur intention, l'API JavaScript et des combinaisons qui marchent bien. **Lis-le en premier.**
- `effects/<nom>.md` : la fiche complète d'un effet (utilisation, paramètres, quand l'utiliser ou l'éviter, accessibilité). **Lis la fiche de chaque effet avant de l'appliquer.** Pour trouver un effet par son intention, cherche un mot-clé dans `catalogue.md` ou dans `effects/`.

## Mise en place

Sur une page HTML, charge la bibliothèque une fois, puis ajoute `data-fx="<nom>"` sur les éléments :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.css">
<script src="https://cdn.jsdelivr.net/gh/alice-crypto/ideotheque@main/dist/fx.js" defer></script>

<section data-fx="curtain-soft">…</section>
```

Pour un site en production, propose de remplacer `@main` par une version publiée (par exemple `@v0.3.0`).

Dans un framework (React, Vue, Svelte, Flutter…), tu peux soit charger ces deux fichiers et appeler `FX.init(conteneur)` après chaque rendu de contenu nouveau, soit reproduire l'effet avec les outils du framework, avec la même durée, la même courbe, la même distance et le même ressenti que la fiche. Garde alors le nom de l'effet en commentaire.

## Règles essentielles

1. Un nom = un effet précis : respecte l'intention et les réglages par défaut de la fiche.
2. Nom inconnu : dis-le et propose l'effet existant le plus proche par son intention. Ne devine pas.
3. Respecte toujours `prefers-reduced-motion` (la bibliothèque le fait déjà avec `data-fx`).
4. Au plus un effet « fort » par écran (préchargeur, transition plein écran, `scroll-expand`, `pixel-dissolve`…).
5. Un élément ne porte qu'un seul `data-fx`. Pour ajouter une transition de page à un lien qui a déjà un effet, utilise `data-fx-tr="<transition>"`.
6. Les couleurs se règlent avec `--fx-accent` et `--fx-accent-2` sur `:root`, ou avec les variables propres à chaque fiche.
