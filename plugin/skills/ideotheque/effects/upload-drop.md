# `upload-drop`

**Catégorie :** État

## Intention
Une zone de dépôt dont la bordure se met à tourner quand un fichier arrive au-dessus.

## Ce qu'on ressent
La zone attend le fichier et le reconnaît.

## Utilisation
```html
<label data-fx="upload-drop"><input type="file" multiple>Déposez vos fichiers</label>
```

## Paramètres
- Mettez un `<input type="file">` dans un `<label>`
- L'élément émet `fx:files`.

## Quand l'utiliser
Formulaires d'envoi, ajout de documents à un assistant.

## Quand l'éviter
De cacher un champ fichier sans `<label>` : il ne serait plus accessible au clavier.

## Accessibilité
Le champ de fichier reste présent et utilisable au clavier via son `<label>`.
