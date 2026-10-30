# `dropdown`

**Catégorie :** Navigation

## Intention
Un menu déroulant qui jaillit sous le bouton avec un rebond, ses éléments arrivant en cascade.

## Ce qu'on ressent
Vif, soigné, application.

## Utilisation
```html
<div data-fx="dropdown">
  <button>Compte</button>
  <div class="menu"><a>Profil</a><a>Quitter</a></div>
</div>
```

## Paramètres
- Premier enfant : le bouton, dernier enfant : le menu
- Se ferme au clic en dehors et avec Échap

## Quand l'utiliser
Menus de compte, actions secondaires, sélecteurs de langue.

## Quand l'éviter
Les menus de plus de dix éléments.

## Accessibilité
Le bouton reçoit `aria-haspopup` et `aria-expanded` ; Échap et le clic en dehors ferment le menu.
