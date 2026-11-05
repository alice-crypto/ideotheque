# `breadcrumb-fold`

**Catégorie :** Navigation

## Intention
Un fil d'Ariane replie ses niveaux intermédiaires derrière « … » et les déroule au clic.

## Ce qu'on ressent
Rangé, on voit le début et la fin du chemin.

## Utilisation
```html
<ol data-fx="breadcrumb-fold"><li><a href="#">Accueil</a></li><li><a href="#">Docs</a></li><li><a href="#">API</a></li><li>FX</li></ol>
```

## Paramètres
- `data-fx-keep` (3) : nombre de niveaux à partir duquel le repli s'applique

## Quand l'utiliser
Documentation, boutiques, arborescences profondes.

## Quand l'éviter
Les chemins courts.

## Accessibilité
Le bouton est nommé, et le focus passe sur le premier niveau révélé.
