# `typewriter`

**Catégorie :** Texte

## Intention
Le texte s'écrit lettre par lettre, suivi d'un curseur qui clignote.

## Ce qu'on ressent
Narratif, intime, comme une machine à écrire ou un terminal.

## Utilisation
```html
<p data-fx="typewriter">Bonjour, je suis là.</p>
```

## Paramètres
- `data-fx-speed` (45) : millisecondes par lettre

## Quand l'utiliser
Accroches courtes, répliques, invites de commande.

## Quand l'éviter
Les textes de plus de deux lignes : l'attente devient pénible.

## Accessibilité
Le texte d'origine reste lisible par les lecteurs d'écran via `aria-label`. Avec `prefers-reduced-motion: reduce`, le texte s'affiche en entier.
