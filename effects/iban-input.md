# `iban-input`

**Catégorie :** Micro-interaction

## Intention
Un champ groupe l'IBAN par quatre et vérifie sa clé, sans empêcher la saisie.

## Ce qu'on ressent
Soigné, on évite une erreur coûteuse.

## Utilisation
```html
<label data-fx="iban-input">IBAN <input></label>
```

## Paramètres
Mettez un `<input>` dans l'élément.

## Quand l'utiliser
Virements, inscriptions, facturation.

## Quand l'éviter
De considérer le compte comme existant : seule la clé est contrôlée.

## Accessibilité
`aria-invalid` et message annoncé. Le texte reste dans le champ.
