# Guide pour les assistants IA

Ce fichier explique à une IA (Claude, Copilot, Cursor…) comment utiliser Idéothèque quand un humain lui dit par exemple :

> « Utilise `curtain-soft` pour l'entrée des sections et `magnetic` sur le bouton principal. »

La bibliothèque contient <!-- total -->206<!-- /total --> effets.

## Règles

1. **Un nom = un effet précis.** Lis la fiche `effects/<nom>.md` avant de l'appliquer. Respecte son *intention* et ses paramètres par défaut, n'invente pas une variante.
2. **Si le projet peut charger les fichiers** (`dist/fx.css` + `dist/fx.js`, ou le CDN jsDelivr), utilise simplement l'attribut `data-fx="<nom>"`.
3. **Si le projet utilise un framework** (React, Vue, Svelte, Flutter…), reproduis l'effet avec les outils du framework, avec la même durée, la même courbe (easing), la même distance et le même ressenti que la fiche. Garde le nom de l'effet en commentaire.
4. **Respecte toujours `prefers-reduced-motion`.**
5. **Respecte les sections « Quand l'éviter ».** Si la demande contredit une fiche, applique l'effet quand même, puis signale le problème en une ligne.
6. **Nom inconnu ?** Dis-le et propose l'effet existant le plus proche par son intention. Ne devine pas.

## Catalogue

<!-- catalogue:start -->
| Nom | Catégorie | Intention |
|---|---|---|
| `curtain-soft` | Entrée | Révéler un contenu important avec calme, comme un rideau qui se lève |
| `rise-stagger` | Entrée | Faire arriver une liste élément par élément pour guider l'œil dans l'ordre de lecture |
| `blur-in` | Entrée | Une mise au point photographique : le contenu sort du flou pour capter l'attention en douceur |
| `line-mask` | Entrée | Chaque ligne d'un texte glisse vers le haut depuis derrière un cache invisible, l'une après l'autre |
| `pixel-dissolve` | Entrée | Une mosaïque de cases colorées recouvre un visuel, puis s'efface case par case dans un ordre aléatoire |
| `fade-up` | Entrée | L'apparition de référence : le contenu monte légèrement en devenant opaque |
| `slide-in` | Entrée | Le contenu glisse depuis un côté de l'écran, au choix gauche, droite, haut ou bas |
| `zoom-in-soft` | Entrée | L'élément grandit doucement de 90 % à sa taille réelle en apparaissant |
| `flip-up` | Entrée | L'élément bascule vers l'avant depuis sa base, comme une carte qu'on relève sur une table |
| `swing-in` | Entrée | L'élément pivote depuis son coin haut gauche et se stabilise avec un léger rebond, comme une enseigne suspendue |
| `iris-open` | Entrée | Un cercle s'ouvre depuis le centre et dévoile le contenu, comme l'ouverture d'un diaphragme |
| `diagonal-wipe` | Entrée | Un bord en biais balaie l'élément de gauche à droite et le révèle |
| `split-reveal` | Entrée | Deux volets de couleur recouvrent l'élément puis s'écartent vers la gauche et la droite |
| `block-reveal` | Entrée | Un bloc de couleur traverse l'élément de gauche à droite ; le contenu apparaît derrière lui |
| `stretch-in` | Entrée | L'élément jaillit de sa base en s'étirant verticalement, avec un léger dépassement |
| `skew-up` | Entrée | Le contenu monte en se redressant d'une légère inclinaison |
| `drop-bounce` | Entrée | L'élément tombe d'en haut, touche le sol et rebondit deux fois avant de se poser |
| `pop-in` | Entrée | L'élément surgit de 55 % à sa taille, la dépasse légèrement puis se stabilise |
| `blinds-open` | Entrée | Huit lames horizontales s'ouvrent comme un store vénitien et laissent voir le contenu |
| `ink-spread` | Entrée | Le contenu se répand depuis le coin bas gauche, comme une goutte d'encre sur du papier |
| `tile-cascade` | Entrée | Les tuiles d'une grille apparaissent en vague diagonale, du coin haut gauche vers le coin bas droit |
| `scatter-gather` | Entrée | Les enfants partent de positions et d'angles éparpillés au hasard, puis se rassemblent à leur place |
| `fold-down` | Entrée | L'élément se déplie depuis son bord supérieur, comme une feuille pliée qu'on ouvre |
| `lift-shadow` | Entrée | L'élément s'élève du fond pendant que son ombre se forme sous lui |
| `rule-draw` | Entrée | Un filet horizontal se trace depuis le centre jusqu'aux bords |
| `text-split` | Texte | Donner du poids à un titre en le faisant apparaître lettre par lettre |
| `text-scramble` | Texte | Un texte brouillé en signes aléatoires qui se décode lettre par lettre, de gauche à droite |
| `typewriter` | Texte | Le texte s'écrit lettre par lettre, suivi d'un curseur qui clignote |
| `word-rise` | Texte | Les mots montent un par un depuis la ligne de base |
| `wave-text` | Texte | Une vague parcourt les lettres en boucle, de gauche à droite |
| `glitch-text` | Texte | Le texte se dédouble en rouge et cyan par à-coups, comme un signal numérique perturbé |
| `gradient-flow` | Texte | Un dégradé de couleurs coule en continu à l'intérieur des lettres |
| `highlight-sweep` | Texte | Un trait de surligneur passe derrière le texte, de gauche à droite, même sur plusieurs lignes |
| `strike-draw` | Texte | Un trait barre le texte de gauche à droite |
| `track-in` | Texte | Les lettres se resserrent depuis un interlettrage très large en sortant du flou |
| `proximity-weight` | Texte | Les lettres proches du curseur s'épaississent et prennent la couleur d'accent |
| `word-rotator` | Texte | Un mot change régulièrement en glissant vers le haut, et la largeur s'adapte au nouveau mot |
| `odometer` | Texte | Chaque chiffre défile verticalement jusqu'à sa valeur, comme un compteur mécanique |
| `stroke-fill` | Texte | Un texte en contour se remplit de couleur au survol, de gauche à droite |
| `long-shadow` | Texte | Une ombre portée en escalier se déploie sous le texte, en diagonale |
| `letter-focus` | Texte | Chaque lettre sort du flou à un instant aléatoire, comme une image qui se précise |
| `slice-hover` | Texte | Au survol, le texte se coupe horizontalement en deux moitiés qui glissent en sens opposés |
| `scroll-ink` | Texte | Les mots d'un paragraphe passent du gris à la couleur un par un, au rythme du défilement |
| `char-flip` | Texte | Chaque lettre bascule en 3D depuis le haut pour se mettre en place |
| `neon-flicker` | Texte | Une enseigne néon lumineuse qui grésille de temps en temps |
| `wavy-underline` | Texte | Un soulignement ondulé qui se met à filer quand on le survole |
| `image-text` | Texte | Une image ou un dégradé se promène lentement à l'intérieur des lettres |
| `velocity-stretch` | Texte | Le texte s'étire verticalement et penche selon la vitesse du défilement, puis revient au repos |
| `edge-label` | Texte | Un texte vertical posé sur le bord, qui glisse doucement au fil du défilement |
| `stream-text` | Texte | La réponse arrive par petits groupes de mots, à un rythme irrégulier, derrière un curseur plein : comme un modèle qui génère |
| `text-shimmer` | Texte | Un reflet traverse le texte en boucle, pour dire « en train de réfléchir » |
| `count-up` | Présentation | Mettre en scène un chiffre clé en le faisant défiler de 0 jusqu'à sa valeur |
| `pill-grow` | Présentation | Une gélule s'ouvre au milieu d'un titre, puis une pastille glisse à l'intérieur, comme un interrupteur qu'on active |
| `preloader` | Présentation | Un écran de chargement chiffré de 0 à 100 %, avec une barre de progression, qui se lève vers le haut pour révéler la page |
| `marquee` | Présentation | Un bandeau de texte qui défile à l'infini, accélère quand on fait défiler la page et change de sens quand on remonte |
| `band-loader` | Présentation | Un écran de chargement en bandes de couleur, avec des messages qui changent ; à la fin, les bandes s'envolent une à une |
| `bars-grow` | Présentation | Les barres d'un graphique poussent l'une après l'autre, puis leur valeur apparaît au-dessus |
| `marquee-vertical` | Présentation | Une colonne d'éléments défile à l'infini vers le haut, avec des bords qui s'estompent ; le survol met en pause |
| `timeline` | Présentation | La ligne d'une frise se trace au fil du défilement et allume chaque étape qu'elle atteint |
| `spotlight-focus` | Présentation | Un projecteur assombrit tout sauf l'élément mis en avant, puis passe à l'étape suivante, avec une bulle d'explication |
| `logo-cycle` | Présentation | Quelques emplacements font tourner, à tour de rôle, une collection plus grande de logos |
| `quote-rotator` | Présentation | Les témoignages se succèdent dans un fondu flou ; le survol met en pause |
| `circle-text` | Présentation | Un texte écrit en cercle tourne lentement, comme un tampon ou un autocollant |
| `split-flap` | Présentation | Un tableau d'affichage de gare : les lettres tournent rapidement avant de s'arrêter sur le mot suivant |
| `line-chart` | Présentation | La courbe d'un graphique se trace de gauche à droite, puis ses points apparaissent un à un |
| `scroll-cue` | Présentation | Une petite souris dont la molette descend en boucle, pour inviter à faire défiler |
| `peel` | Présentation | Le coin de l'élément se décolle au survol, comme un autocollant qu'on soulève |
| `holo-card` | Présentation | Une carte holographique : des reflets irisés et une lueur suivent le curseur pendant qu'elle s'incline |
| `donut` | Présentation | Un graphique en anneau dont les parts se tracent l'une après l'autre, avec un libellé au centre |
| `expand-panels` | Présentation | Des panneaux côte à côte ; celui qu'on survole s'élargit pendant que les autres se resserrent |
| `prompt-box` | Présentation | Un champ de saisie qui écrit tout seul des exemples de demandes, les garde un instant, puis les efface |
| `underline-draw` | Micro-interaction | Un lien qui se souligne au survol depuis la gauche, puis repart vers la droite |
| `roll-text` | Micro-interaction | Au survol, chaque lettre roule vers le haut et laisse la place à son double, avec un léger décalage entre les lettres |
| `magnetic` | Micro-interaction | Un bouton attiré par le curseur, qui invite au clic |
| `tilt-card` | Micro-interaction | Une carte qui s'incline en 3D sous le curseur, comme un objet qu'on tient |
| `corner-marks` | Micro-interaction | Quatre repères d'angle viennent cadrer l'élément au survol, comme un viseur qui fait la mise au point |
| `cursor` | Micro-interaction | Un point qui suit la souris avec un léger retard, grossit sur les liens et les boutons, et peut afficher un mot |
| `ripple-click` | Micro-interaction | Une onde circulaire se propage depuis le point exact où l'on clique |
| `fill-up` | Micro-interaction | Le fond se remplit depuis le bas au survol, avec un bord arrondi qui s'aplatit en montant |
| `border-trace` | Micro-interaction | Une bordure se dessine tout autour de l'élément au survol : le haut, la droite, puis le bas et la gauche |
| `shine-sweep` | Micro-interaction | Un reflet lumineux traverse l'élément en diagonale au survol |
| `spotlight-card` | Micro-interaction | Une lueur colorée suit le curseur à l'intérieur de la carte |
| `press-squash` | Micro-interaction | L'élément s'écrase quand on appuie dessus et rebondit au relâchement |
| `icon-nudge` | Micro-interaction | Une icône placée après le texte (→ par défaut) avance d'un pas au survol |
| `lift-hover` | Micro-interaction | L'élément se soulève de quelques pixels et son ombre s'allonge au survol |
| `jelly` | Micro-interaction | L'élément tremble comme une gelée au survol avant de se stabiliser |
| `swap-text` | Micro-interaction | Au survol, le texte glisse vers le haut et cède la place à un autre texte |
| `conic-border` | Micro-interaction | Une bordure dégradée tourne en continu autour de l'élément |
| `underline-fill` | Micro-interaction | Le soulignement monte au survol jusqu'à devenir un fond plein derrière le texte |
| `zoom-frame` | Micro-interaction | L'image s'approche lentement à l'intérieur de son cadre au survol, sans que le cadre bouge |
| `tooltip-pop` | Micro-interaction | Une bulle d'aide jaillit au-dessus de l'élément au survol, avec un petit rebond |
| `click-burst` | Micro-interaction | Des éclats de couleur jaillissent en cercle autour de l'élément au clic |
| `switch-morph` | Micro-interaction | Un interrupteur dont la pastille s'étire pendant qu'on appuie puis glisse avec un rebond |
| `shake` | Micro-interaction | L'élément est secoué horizontalement, pour signaler une erreur ou un refus |
| `fan-out` | Micro-interaction | Une pile de cartes s'ouvre en éventail au survol |
| `depth-hover` | Micro-interaction | Les calques d'une composition bougent à des profondeurs différentes sous le curseur |
| `blob-morph` | Micro-interaction | La forme ondule comme une goutte d'eau tant qu'on la survole |
| `pulse-ring` | Micro-interaction | Des anneaux s'échappent de l'élément en continu pour attirer l'attention |
| `invert-sweep` | Micro-interaction | Un aplat balaie l'élément de gauche à droite en inversant ses couleurs |
| `scroll-expand` | Défilement | Un visuel encadré, aux coins arrondis, s'agrandit jusqu'au plein cadre au fil du défilement, pendant que l'image se recadre doucement |
| `parallax` | Défilement | L'élément défile plus lentement (ou plus vite) que la page, ce qui crée une profondeur |
| `progress-bar` | Défilement | Une fine barre en haut de l'écran indique jusqu'où on a lu la page |
| `stack-cards` | Défilement | Les cartes restent collées en haut en défilant et s'empilent ; celles du dessous reculent et s'assombrissent |
| `pin-horizontal` | Défilement | La section reste fixe à l'écran pendant que son contenu défile horizontalement, au rythme du défilement vertical |
| `scroll-rotate` | Défilement | L'élément tourne sur lui-même au rythme du défilement |
| `scale-on-scroll` | Défilement | L'élément grandit de 70 % à sa taille réelle et devient opaque à mesure qu'il entre à l'écran |
| `fade-exit` | Défilement | L'élément s'efface et remonte légèrement en sortant par le haut de l'écran |
| `hero-shrink` | Défilement | En quittant l'écran, le bloc rétrécit légèrement et ses coins s'arrondissent, comme une carte qu'on range |
| `bg-shift` | Défilement | Chaque section change la couleur de fond de la page (ou d'un conteneur) quand elle passe au milieu de l'écran |
| `scroll-unveil` | Défilement | Le visuel se dévoile du bas vers le haut à mesure qu'il entre à l'écran |
| `scroll-count` | Défilement | Un nombre augmente de 0 à sa valeur au fil du défilement, et redescend si on remonte |
| `path-scroll` | Défilement | Un tracé SVG se dessine au fil du défilement, comme un chemin qui avance avec le lecteur |
| `perspective-scroll` | Défilement | L'élément arrive couché en 3D et se redresse à mesure qu'il entre à l'écran |
| `skew-scroll` | Défilement | Le contenu penche légèrement selon la vitesse du défilement, puis se redresse |
| `split-columns` | Défilement | Les colonnes d'une grille défilent en sens opposés : les impaires montent, les paires descendent |
| `blur-exit` | Défilement | L'élément devient flou et s'estompe en quittant l'écran par le haut |
| `scatter-scroll` | Défilement | Les lettres d'un titre se dispersent dans toutes les directions quand il quitte l'écran, et se rassemblent si on remonte |
| `fill-scroll` | Défilement | Le texte se remplit de couleur de gauche à droite à mesure qu'il entre à l'écran |
| `page-wipe` | Transition | Deux panneaux (couleur d'accent, puis couleur de fond) montent pour recouvrir l'écran, puis repartent par le haut sur la page suivante |
| `bands` | Transition | Cinq bandes verticales de couleurs vives tombent l'une après l'autre pour couvrir l'écran, puis continuent leur chute |
| `circle-expand` | Transition | Un cercle grandit depuis le point exact du clic jusqu'à couvrir l'écran, puis se referme au centre |
| `slash` | Transition | Un pan incliné traverse l'écran de gauche à droite, comme un coup de lame |
| `pixel-wipe` | Transition | L'écran se remplit de cases au hasard, puis elles disparaissent pour révéler la page suivante |
| `shutter` | Transition | Huit lames horizontales se ferment de haut en bas, comme un rideau métallique, puis se rouvrent |
| `curtain-close` | Transition | Deux rideaux de théâtre se rejoignent au centre, puis se rouvrent sur la nouvelle page |
| `fade-through` | Transition | Un fondu au noir (ou à la couleur choisie), puis un fondu vers la page suivante |
| `zoom-through` | Transition | La page se floute pendant qu'un voile surgit du centre en se rétrécissant, puis se dissipe |
| `push-slide` | Transition | Un panneau arrive par la droite, couvre l'écran, puis repart par la gauche, comme un diaporama |
| `arc-rise` | Transition | Un panneau au bord supérieur arrondi monte du bas de l'écran, puis repart vers le haut |
| `glitch-cut` | Transition | Des bandes horizontales arrivent en saccades de chaque côté, avec des éclats rouges et cyan |
| `tile-flip` | Transition | Une mosaïque de 40 tuiles se retourne en vague diagonale pour couvrir l'écran |
| `iris` | Transition | Un diaphragme se referme sur le centre de l'écran, puis se rouvre sur la page suivante |
| `title-card` | Transition | Un carton plein écran monte avec un titre au centre, comme au cinéma, puis laisse place à la page |
| `view-morph` | Transition | Les éléments passent d'un état à l'autre en se transformant (position, taille), grâce à l'API View Transitions du navigateur |
| `svg-draw` | Image | Les tracés d'une illustration SVG se dessinent l'un après l'autre, comme à la main |
| `ken-burns` | Image | L'image avance et glisse très lentement en boucle, comme dans un documentaire |
| `color-reveal` | Image | L'image en noir et blanc retrouve ses couleurs (et grossit à peine) au survol |
| `image-trail` | Image | En bougeant la souris, des images apparaissent dans le sillage du curseur puis s'effacent |
| `hover-preview` | Image | Survoler un élément de liste fait flotter son image près du curseur ; les autres éléments s'estompent |
| `slice-in` | Image | L'image arrive en tranches verticales qui glissent en alternance, vers le haut et vers le bas |
| `rgb-split` | Image | Au survol, les couches rouge et bleue de l'image se décalent de part et d'autre, avec une légère vibration |
| `blob-mask` | Image | L'image est découpée dans une forme molle qui ondule en continu |
| `compare` | Image | Deux images superposées et une poignée qu'on fait glisser pour comparer l'avant et l'après |
| `glare` | Image | Un reflet de lumière suit le curseur sur l'image, qui grossit légèrement |
| `lens` | Image | Une loupe circulaire agrandit l'image sous le curseur |
| `photo-stack` | Image | Une pile de photos posées de travers ; un clic envoie celle du dessus glisser sous la pile |
| `liquid-hover` | Image | Au survol, l'image ondule un instant comme un reflet dans l'eau, puis se stabilise |
| `pixelate` | Image | L'image s'affiche en gros pixels et devient nette progressivement au survol |
| `flip-card` | Image | La carte se retourne en 3D au survol (ou au clic) et montre son verso |
| `carousel-ring` | Image | Les éléments tournent lentement sur un anneau en 3D ; le survol met la rotation en pause |
| `drag-gallery` | Image | Une galerie horizontale qu'on fait glisser à la souris ou au doigt, avec de l'inertie et un rebond aux extrémités |
| `noise-reveal` | Image | L'image se reconstitue à partir d'un bruit fortement déformé, comme un signal qui se stabilise |
| `burger-morph` | Navigation | Les trois barres du bouton de menu se transforment en croix quand le menu est ouvert |
| `menu-reveal` | Navigation | Un menu plein écran s'ouvre en cercle depuis le bouton, puis ses liens arrivent en cascade |
| `smart-header` | Navigation | L'en-tête se cache quand on descend dans la page et réapparaît dès qu'on remonte |
| `tab-slider` | Navigation | Un indicateur en forme de pastille glisse jusqu'à l'onglet choisi |
| `dot-nav` | Navigation | Des points de navigation verticaux ; celui de la section visible s'étire et prend la couleur d'accent |
| `top-ring` | Navigation | Un bouton « haut de page » entouré d'un anneau qui se remplit à mesure qu'on lit la page |
| `hover-pill` | Navigation | Une pastille de fond glisse d'un lien à l'autre au survol de la navigation |
| `accordion` | Navigation | Un élément `<details>` qui s'ouvre et se ferme en douceur, avec un « + » qui pivote en croix |
| `dropdown` | Navigation | Un menu déroulant qui jaillit sous le bouton avec un rebond, ses éléments arrivant en cascade |
| `scroll-spy` | Navigation | Dans un sommaire, le lien de la section en cours de lecture est mis en avant et une barre le suit |
| `dots-morph` | Navigation | L'indicateur d'un diaporama : le point actif s'étire en barre qui se remplit pendant le temps d'affichage |
| `drawer` | Navigation | Un panneau latéral glisse depuis la droite au-dessus d'un voile sombre |
| `modal-zoom` | Navigation | Une fenêtre s'ouvre en grandissant depuis le bouton qui l'a appelée, sur un fond flouté |
| `header-shrink` | Navigation | L'en-tête s'affine, prend un fond et réduit son logo dès qu'on commence à défiler |
| `focus-list` | Navigation | Survoler un élément de liste estompe les autres et le décale légèrement vers la droite |
| `scanlines` | Ambiance | Des lignes d'écran cathodique et un balayage lumineux passent sur un visuel, avec un léger scintillement |
| `dot-grid` | Ambiance | Une trame de points recouvre le fond ; autour du curseur, les points grossissent et prennent la couleur d'accent |
| `grain` | Ambiance | Un grain de pellicule animé recouvre le contenu, comme un film argentique |
| `aurora` | Ambiance | Des voiles de couleur floue ondulent lentement derrière le contenu, comme une aurore boréale |
| `gradient-drift` | Ambiance | Un dégradé maillé de quatre couleurs dérive lentement en fond |
| `grid-floor` | Ambiance | Un sol quadrillé en perspective défile vers l'horizon, sous une lueur |
| `starfield` | Ambiance | Un champ d'étoiles défile vers le spectateur, et le centre suit légèrement le curseur |
| `constellation` | Ambiance | Des points dérivent et se relient par des lignes quand ils sont proches ; le curseur se relie aussi à eux |
| `wave-lines` | Ambiance | Des lignes ondulantes se superposent et se déplacent comme des ondes sonores |
| `vhs` | Ambiance | L'image d'une cassette vidéo : couleurs saturées, bande de distorsion qui défile, « ● REC » et compteur de lecture |
| `crt` | Ambiance | Un vieil écran cathodique : coins arrondis, vignette, lignes, et un allumage en trait lumineux à l'entrée |
| `flashlight` | Ambiance | L'obscurité recouvre l'élément et seul le cercle éclairé par le curseur laisse voir le contenu |
| `bokeh` | Ambiance | Des taches de lumière floues et colorées flottent lentement, comme un arrière-plan photographique |
| `code-rain` | Ambiance | Des colonnes de signes tombent en traînées lumineuses, comme une pluie de code |
| `blob-bg` | Ambiance | Une grande forme dégradée et floue se déforme et tourne lentement derrière le contenu |
| `halftone` | Ambiance | Une trame de points d'imprimerie apparaît en tache qui se déplace lentement |
| `orbit-rings` | Ambiance | Trois anneaux pointillés tournent autour du centre, chacun portant une petite planète |
| `light-beams` | Ambiance | Des faisceaux de lumière tombent du haut et balancent doucement, comme des projecteurs de scène |
| `water-ripple` | Ambiance | Des ondes se forment à la surface quand on bouge ou clique, et des gouttes tombent d'elles-mêmes de temps en temps |
| `glow-grid` | Ambiance | Une grille fine, estompée sur les bords, dont les lignes s'allument autour du curseur |
| `shimmer` | État | Indiquer un chargement par un reflet qui balaie la forme du futur contenu |
| `orbit-loader` | État | Deux points tournent à des vitesses différentes autour d'un cœur qui respire |
| `loading-bar` | État | Une barre de chargement indéterminée : un segment accélère et s'étire en traversant la piste |
| `typing-dots` | État | Trois points sautillent dans une bulle : quelqu'un est en train d'écrire |
| `check-draw` | État | Une coche verte se dessine dans un cercle, puis fait un petit bond de satisfaction |
| `cross-draw` | État | Une croix rouge se dessine dans un cercle, puis secoue la tête |
| `confetti` | État | Une gerbe de confettis jaillit depuis l'élément, retombe en tournoyant et s'efface |
| `toast` | État | Une notification glisse depuis le bas avec un rebond, puis disparaît d'elle-même |
| `progress-ring` | État | Un anneau se remplit jusqu'à sa valeur pendant que le pourcentage défile au centre |
| `badge-bump` | État | La pastille de compteur rebondit à chaque nouvelle valeur |
| `heart-like` | État | Au clic, le cœur se remplit avec un rebond et un anneau qui éclate autour de lui |
| `copy-morph` | État | Au clic, le bouton copie un texte et se transforme en « Copié ✓ », en vert, avant de revenir |
| `liquid-fill` | État | Un liquide ondulant monte dans le récipient jusqu'au niveau voulu |
| `float` | État | L'élément flotte doucement de haut en bas, son ombre s'éloigne et se rapproche |
| `live-dot` | État | Un point rouge qui pulse à côté d'un libellé, pour signaler un direct |
| `flip-clock` | État | Des chiffres qui basculent comme une horloge à palettes : l'heure actuelle, ou un compte à rebours |
| `loading-quips` | État | Pendant un chargement, des phrases sympathiques se succèdent au-dessus d'une barre qui avance |
| `ai-orb` | État | Un orbe de couleur qui respire doucement, puis tourbillonne quand l'assistant réfléchit |
| `thinking-steps` | État | Les étapes d'un agent s'enchaînent : chacune tourne le temps du travail, puis se coche |
<!-- catalogue:end -->

## Réglages communs (variables CSS)

`--fx-duration` (700ms), `--fx-delay` (0ms), `--fx-ease`, `--fx-stagger` (70ms), `--fx-distance` (24px), `--fx-accent`, `--fx-accent-2`.

## API JavaScript

- `FX.init(conteneur)` : active les effets d'un contenu ajouté dynamiquement
- `FX.replay(element)` : rejoue une entrée
- `FX.trigger(element)` : déclenche un effet ponctuel (secousse, confettis, notification…)
- `FX.play(nom, callback, event)` : joue une transition plein écran autour d'une action
- `FX.go(nom, adresse, event)` : joue une transition puis change de page (la page suivante la termine)
- `data-fx-tr="nom"` sur un lien qui porte déjà un autre effet : il joue cette transition avant de changer de page
- `FX.register(nom, définition)` : ajoute un effet (voir `CONTRIBUTING.md`)

## Combinaisons qui marchent bien

- Page d'accueil : `preloader` → `line-mask` sur le titre → `dot-grid` en fond → `magnetic` sur le bouton principal
- Portfolio : `cursor` sur `<body>`, `corner-marks` sur les vignettes, `pixel-dissolve` sur les images, `page-wipe` entre les projets
- Univers science-fiction : `scanlines` sur les visuels, `text-scramble` sur les sur-titres, `marquee` entre les sections

Au plus un effet « fort » (`preloader`, `scroll-expand`, `pixel-dissolve`, transitions plein écran) par écran.
