# Guide pour les assistants IA

Ce fichier explique à une IA (Claude, Copilot, Cursor…) comment utiliser Idéothèque quand un humain lui dit par exemple :

> « Utilise `curtain-soft` pour l'entrée des sections et `magnetic` sur le bouton principal. »

La bibliothèque contient <!-- total -->867<!-- /total --> effets.

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
| `cascade-rows` | Entrée | Les éléments d'une grille arrivent rangée par rangée, selon leur position réelle à l'écran |
| `spotlight-in` | Entrée | Un projecteur balaye l'élément dans le noir, puis l'éclaire en entier |
| `typeset-lines` | Entrée | Les lignes d'un texte arrivent une à une depuis des côtés alternés, et se calent sur la marge |
| `bounce-grid` | Entrée | Les cases d'une grille rebondissent en onde, depuis le centre vers les bords |
| `mask-rise-image` | Entrée | Un cadre s'ouvre de bas en haut, et l'image se pose en se réduisant |
| `accordion-unfold` | Entrée | Des panneaux se déplient les uns après les autres, comme une feuille pliée |
| `blur-words` | Entrée | Les mots sortent du flou l'un après l'autre |
| `card-deal` | Entrée | Des cartes partent d'un même paquet en bas et rejoignent leur place, comme distribuées à une table |
| `shutter-text` | Entrée | Des bandes verticales couvrent l'élément et se replient une à une, comme un obturateur |
| `line-draw-box` | Entrée | Un cadre se dessine autour du contenu, puis celui-ci apparaît |
| `stagger-scale-row` | Entrée | Une rangée d'éléments s'ouvre depuis son centre vers ses bords |
| `grain-fade` | Entrée | L'image apparaît d'abord à travers un grain de pellicule, puis ce grain se dissout |
| `rotate-tile-in` | Entrée | Les tuiles d'une mosaïque arrivent en pivotant de quarts de tour, et s'emboîtent |
| `horizon-rise` | Entrée | Une ligne se dessine, puis le contenu se lève derrière elle comme un soleil |
| `number-stack-in` | Entrée | Plusieurs copies en contour d'un grand numéro se rassemblent et forment le numéro final |
| `list-strike-in` | Entrée | Des filets se dessinent de gauche à droite, et le texte de chaque ligne apparaît juste après |
| `depth-focus-in` | Entrée | Les éléments arrivent du fond de l'écran et deviennent nets en approchant |
| `marker-swipe-in` | Entrée | Un bloc de couleur traverse chaque ligne et laisse le texte derrière lui |
| `wipe-columns-in` | Entrée | Des colonnes se déroulent de haut en bas l'une après l'autre, comme des rideaux |
| `glow-on` | Entrée | Le texte s'allume comme un néon : quelques ratés, puis une lueur stable |
| `curtain-words` | Entrée | Chaque mot monte depuis sous sa ligne, avec un léger basculement |
| `flip-board-in` | Entrée | Les cases d'un tableau se retournent dans le désordre et révèlent leur contenu |
| `rubber-in` | Entrée | L'élément tombe étiré, s'écrase au sol et rebondit, comme dans un dessin animé |
| `path-follow-in` | Entrée | Les éléments rejoignent leur place en suivant une trajectoire courbe, chacun la sienne |
| `soft-page-in` | Entrée | Les blocs d'une page apparaissent doucement, de haut en bas, avec un très léger mouvement |
| `slice-column-text` | Entrée | Le mot arrive en tranches verticales, qui montent ou descendent pour se recaler |
| `pop-confetti-title` | Entrée | Un titre gonfle à son arrivée et lance quelques éclats colorés autour de lui |
| `receipt-print` | Entrée | Un reçu sort de la fente par petits à-coups, avec son bord dentelé |
| `covered-list` | Entrée | Deux colonnes montrent ce qui est couvert et ce qui ne l'est pas, avec le même poids |
| `umbrella-open` | Entrée | Un parapluie s'ouvre d'un ressort et les gouttes de pluie s'écartent de lui |
| `eye-chart` | Entrée | Un message se compose comme un tableau de lettres et passe du flou au net |
| `herb-sprout` | Entrée | Une tige pousse de bas en haut, et ses feuilles s'ouvrent une à une |
| `tape-measure` | Entrée | Un mètre ruban sort de son boîtier en comptant la longueur |
| `blueprint-draw` | Entrée | Un plan se trace mur par mur sur un papier bleu quadrillé |
| `key-unlock` | Entrée | Une clé entre dans une serrure, tourne, et la porte s'ouvre sur un message |
| `crane-lift` | Entrée | Une grue fait glisser un bloc de contenu et le dépose à sa place |
| `brick-lay` | Entrée | Un mur se monte brique après brique, rang par rang |
| `dimension-lines` | Entrée | Des lignes de cote mesurent réellement l'élément et écrivent sa taille |
| `tire-track` | Entrée | Une trace de pneu traverse le titre en biais, et le texte apparaît dans son sillage |
| `footsteps` | Entrée | Des empreintes s'impriment une à une vers le contenu |
| `forklift-raise` | Entrée | Un chariot élévateur soulève une palette, dont le chiffre compte en montant |
| `drone-drop` | Entrée | Un drone dépose le contenu dans la page, puis repart |
| `plug-connect` | Entrée | Une prise rejoint sa borne, et le texte s'allume en éclairant la page |
| `cnc-toolpath` | Entrée | Une trajectoire d'outil usine une forme, ligne après ligne, en laissant un trait lumineux |
| `rivet-frame` | Entrée | Les rivets se posent un à un autour d'une plaque d'acier brossé |
| `orchard-grow` | Entrée | Des rangées d'arbres sortent de terre en vague, avec leur total écrit |
| `passport-stamps` | Entrée | Une page de passeport reçoit ses tampons un à un, légèrement de travers |
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
| `weight-wave` | Texte | Une vague de graisse parcourt le titre, de la lettre la plus fine à la plus épaisse |
| `letter-rain` | Texte | Les lettres tombent du haut de l'écran et rebondissent sur la ligne de base |
| `headline-collapse` | Texte | Un titre très espacé se resserre peu à peu au défilement jusqu'à former un mot compact |
| `cursor-repel` | Texte | Les lettres s'écartent du curseur comme des aimants de même pôle, puis reviennent en place |
| `scroll-weight` | Texte | Le mot s'épaissit en approchant du centre de l'écran, puis s'affine en le quittant |
| `letter-accordion` | Texte | La lettre survolée s'étire et pousse ses voisines, comme un accordéon qu'on ouvre |
| `spot-fill` | Texte | Un titre en simple contour se remplit de couleur seulement autour du curseur |
| `letter-orbit` | Texte | Les lettres tournent en cercle, puis se déposent une à une sur la ligne |
| `mirror-type` | Texte | Le titre se reflète sous lui-même, avec un reflet qui ondule lentement |
| `echo-stack` | Texte | Le titre se répète derrière lui en copies de contour, qui s'ouvrent et se referment lentement |
| `slot-letters` | Texte | Chaque lettre défile comme un rouleau de machine à sous, puis s'arrête à son tour sur le bon signe |
| `dot-matrix` | Texte | Le titre s'allume point par point, de gauche à droite, comme un panneau d'affichage |
| `ascii-decay` | Texte | Les lettres émergent d'une suite de blocs de densité, du plus plein au plus léger |
| `hop-row` | Texte | Au survol, un petit saut se propage depuis la lettre touchée vers les deux bords |
| `half-shift` | Texte | Le mot est coupé à l'horizontale, et ses deux moitiés glissent en sens contraire au défilement |
| `hover-marquee` | Texte | Au repos, une ligne de texte immobile ; au survol, elle défile en continu |
| `cube-words` | Texte | Plusieurs mots sont posés sur les faces d'un cube, qui tourne d'un quart de tour pour passer au suivant |
| `case-shuffle` | Texte | Majuscules et minuscules se mélangent à toute vitesse, puis le mot retrouve sa casse |
| `breathe-track` | Texte | L'espacement entre les lettres s'ouvre et se referme au rythme d'une respiration calme |
| `ink-bleed` | Texte | Les lettres apparaissent déformées comme de l'encre humide, puis se fixent et deviennent nettes |
| `redact-reveal` | Texte | Le texte est caviardé de barres noires, qui se retirent mot à mot dans le désordre |
| `sticker-letters` | Texte | Chaque lettre est une étiquette collée de travers, qui claque à son arrivée |
| `drift-title` | Texte | Quand on défile vite, le titre glisse de côté et s'incline, puis revient à sa place |
| `path-type` | Texte | Le texte suit une ligne ondulée et y avance en continu, comme un ruban |
| `color-cycle-words` | Texte | Une couleur vive passe de mot en mot dans la phrase, comme une lecture guidée |
| `sun-shadow` | Texte | Une longue ombre pleine part à l'opposé du curseur, comme si celui-ci était le soleil |
| `depth-crawl` | Texte | Un bloc de texte monte et s'éloigne vers l'horizon sur un plan incliné |
| `gravity-letters` | Texte | Au clic, les lettres se décrochent, sont projetées puis tombent, avant de revenir à leur place |
| `pixel-type` | Texte | Le mot apparaît en très gros pixels, puis gagne en netteté par paliers jusqu'à l'image finale |
| `scribble-circle` | Texte | Un cercle dessiné à la main, un peu imparfait, vient entourer un mot important |
| `drop-cap-draw` | Texte | Une grande lettrine entre en réduisant, puis le paragraphe apparaît autour d'elle |
| `margin-note` | Texte | Survoler un mot annoté ouvre sa note, numérotée comme dans un livre |
| `pull-quote-rise` | Texte | Un grand guillemet surgit, puis les lignes d'une citation montent une à une |
| `reading-time-bar` | Texte | Un petit bandeau indique le temps de lecture restant et avance avec la lecture |
| `kerning-focus` | Texte | Autour du curseur, les mots sont nets ; le reste du paragraphe s'estompe |
| `news-ticker-pause` | Texte | Un bandeau d'informations défile en continu, et un bouton permet de l'arrêter |
| `bilingual-toggle` | Texte | Une phrase bascule entre deux langues, en passant par quelques signes aléatoires |
| `word-counter-goal` | Texte | Un compteur de mots avance vers un objectif, et salue d'une pulsation quand il est atteint |
| `typo-specimen` | Texte | Un spécimen de police à régler en direct : on change la taille, la graisse et le texte |
| `headline-replace-scroll` | Texte | Dans une phrase fixe, un mot change selon la section qu'on est en train de lire |
| `highlight-terms-sweep` | Texte | Des mots clés se surlignent l'un après l'autre dans un paragraphe |
| `typing-correct` | Texte | Le texte s'écrit, fait une faute, efface et se corrige comme une vraie personne |
| `letter-tilt-cursor` | Texte | Chaque lettre se penche vers le curseur, comme des herbes hautes |
| `vertical-type-flip` | Texte | Un mot écrit verticalement se couche en ligne au survol |
| `stamp-word` | Texte | Les mots sont frappés l'un après l'autre, comme des coups de tampon |
| `word-bubbles` | Texte | Une conversation apparaît bulle après bulle, à un rythme proche de la vraie frappe |
| `line-clamp-expand` | Texte | Un texte replié se déplie jusqu'à sa vraie hauteur, sans saut |
| `hatch-reveal` | Texte | Un titre apparaît en hachures de plan, puis une encre pleine le recouvre |
| `weld-sparks` | Texte | Un point de soudure court sous le titre, en projetant des étincelles |
| `tractor-plow` | Texte | Un tracteur traverse le titre, et le texte apparaît dans son sillage |
| `chalk-board` | Texte | Une ardoise s'écrit à la craie, ligne après ligne, avec ses prix |
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
| `radial-bars` | Présentation | Des barres rayonnent autour d'un centre et poussent une à une vers l'extérieur |
| `sparkline-draw` | Présentation | Une petite courbe de tendance se dessine, sa zone apparaît et un point marque la dernière valeur |
| `heat-calendar` | Présentation | Un calendrier d'activité : de petites cases plus ou moins colorées s'allument en vague |
| `stacked-progress` | Présentation | Une seule barre répartie en segments, qui s'étendent à la suite, avec leur légende en dessous |
| `versus-bars` | Présentation | Deux valeurs se font face : les barres partent de chaque bord et se rencontrent à la frontière |
| `gauge-needle` | Présentation | Un cadran dont l'aiguille monte jusqu'à la valeur, puis oscille un instant |
| `rank-race` | Présentation | Un classement où les valeurs évoluent, et les lignes se dépassent en glissant |
| `timeline-scrub` | Présentation | Une frise de dates : survoler ou choisir une date remplit le rail et affiche son histoire |
| `number-ticker-reel` | Présentation | Chaque chiffre est une bobine qui tourne et s'arrête sur la bonne valeur, de gauche à droite |
| `quote-card-shuffle` | Présentation | Une pile de témoignages : la première carte s'envole et part au fond, la suivante avance |
| `pricing-toggle-cards` | Présentation | La bascule mensuel / annuel fait défiler les prix des cartes et fait apparaître le badge d'économie |
| `feature-orbit-card` | Présentation | Une liste de fonctions dont l'élément actif change seul, avec une barre qui montre le temps restant |
| `logo-wall-flip` | Présentation | Un mur de noms ou de logos : à tour de rôle, une case se retourne pour en montrer un autre |
| `stat-reveal-split` | Présentation | Un très grand chiffre monte en comptant, puis son libellé se dévoile juste en dessous |
| `world-pins` | Présentation | Une carte du monde en points, sur laquelle des épingles s'allument et émettent une onde |
| `compare-table-sweep` | Présentation | Dans un tableau comparatif, toute la colonne survolée s'éclaire, jusqu'à son titre |
| `map-route-draw` | Présentation | Un itinéraire se dessine au fil du défilement, et chaque étape atteinte s'allume |
| `team-card-spotlight` | Présentation | Des visages se chevauchent : celui qu'on survole passe devant, grandit, et son nom s'affiche |
| `changelog-feed` | Présentation | Un journal des nouveautés dont les lignes arrivent en cascade, filtrable par type |
| `pie-explode` | Présentation | Un camembert arrive en tournant, et la part survolée sort légèrement du disque |
| `funnel-steps` | Présentation | Un entonnoir de barres centrées montre ce qui reste à chaque étape, avec le taux de passage |
| `treemap-grow` | Présentation | Une carte de rectangles proportionnels s'assemble : plus la valeur est grande, plus la surface l'est |
| `bubble-pack` | Présentation | Des bulles proportionnelles gonflent et se serrent les unes contre les autres |
| `kanban-move` | Présentation | Sur un tableau de tâches, les cartes passent d'une colonne à l'autre comme si une équipe travaillait |
| `countdown-rings` | Présentation | Un compte à rebours vers une vraie date, où chaque unité a son anneau |
| `ticker-tape` | Présentation | Un bandeau fait défiler des cours, avec le sens de chaque variation écrit par une flèche et un signe |
| `candlestick-draw` | Présentation | Un graphique en chandeliers se dessine bougie après bougie |
| `loan-calculator` | Présentation | Deux curseurs, montant et durée, donnent en direct la mensualité et le coût du crédit |
| `savings-curve` | Présentation | Un curseur règle l'épargne mensuelle, et la courbe montre l'écart croissant entre les versements et le capital |
| `rate-best-row` | Présentation | Dans un tableau de taux, la meilleure valeur de chaque colonne se remplit de couleur |
| `budget-envelopes` | Présentation | Des enveloppes de budget se remplissent, et un dépassement est hachuré et écrit en toutes lettres |
| `goal-jar` | Présentation | Une tirelire transparente se remplit vers un objectif, et quelques pièces y tombent |
| `coin-stacks` | Présentation | Des piles de pièces grandissent, une pièce à la fois, pour comparer des valeurs |
| `interest-accrual` | Présentation | Un montant grandit à la seconde près, jusqu'au millionième, pour rendre concret l'effet d'un taux |
| `order-book` | Présentation | Les ordres d'achat et de vente s'affichent de part et d'autre du prix, avec une barre de profondeur |
| `tax-brackets` | Présentation | Un curseur de revenu montre la part qui tombe dans chaque tranche et l'impôt moyen |
| `cashflow-waterfall` | Présentation | Un graphique en cascade montre les entrées et les sorties, jusqu'au solde final |
| `coverage-matrix` | Présentation | Un tableau de garanties éclaire la formule choisie sur toute sa colonne |
| `peril-shield` | Présentation | Un bouclier s'allume secteur par secteur selon les risques cochés |
| `claim-tracker` | Présentation | Une liste d'étapes montre l'avancement d'un dossier, avec l'étape en cours qui bat |
| `reimbursement-split` | Présentation | Une barre découpe une dépense entre la base, la complémentaire et le reste à payer |
| `bonus-ladder` | Présentation | Un curseur parcourt les années sans accident, et l'échelle montre le coefficient qui baisse |
| `renewal-window` | Présentation | Un repère place aujourd'hui sur l'année du contrat, face à la fenêtre de résiliation |
| `attestation-card` | Présentation | Une carte présente une attestation avec un motif propre au numéro et sa validité réelle |
| `life-events-rail` | Présentation | Un curseur d'âge parcourt les grands moments de la vie et le besoin qui s'y rattache |
| `gap-coverage` | Présentation | Deux colonnes comparent un besoin aux ressources, et l'écart à couvrir apparaît hachuré |
| `lab-range` | Présentation | Un résultat d'analyse se place sur sa plage de référence, et le statut est écrit |
| `sleep-stages` | Présentation | Une nuit se dessine en escalier, avec le temps passé dans chaque stade |
| `steps-week-goal` | Présentation | Une semaine de barres se compare à une ligne d'objectif, et le bilan s'écrit |
| `care-team` | Présentation | Une pile d'initiales s'écarte, et chaque personne dit son nom et son rôle |
| `vaccine-calendar` | Présentation | Des repères par âge se situent selon une date de naissance, et le prochain ressort |
| `cycle-ring` | Présentation | Un anneau découpé en phases situe le jour du cycle |
| `blood-level` | Présentation | Des gouttes se remplissent selon les réserves de chaque groupe sanguin |
| `record-fold` | Présentation | Un historique se range par année : la plus récente est ouverte, les autres se déplient |
| `fever-curve` | Présentation | Une courbe se trace, et la partie au-dessus du seuil se remplit d'une couleur chaude |
| `refill-date` | Présentation | Une jauge indique les jours restants et la date où la boîte sera vide |
| `side-effect-scale` | Présentation | Cent points montrent combien de personnes sont concernées par chaque effet |
| `generic-compare` | Présentation | Deux barres comparent deux prix, et l'écart annuel est calculé |
| `on-duty-list` | Présentation | Une liste met en tête ce qui est ouvert maintenant, selon l'heure locale |
| `uv-index` | Présentation | Un soleil glisse sur l'échelle de l'indice UV, avec le niveau et le conseil |
| `pollen-months` | Présentation | Un calendrier montre les périodes de pollens, et le mois en cours se repère |
| `energy-label` | Présentation | Une étiquette énergie déroule ses classes, et la valeur du logement vient se placer sur la sienne |
| `walk-score` | Présentation | Un score de quartier s'accompagne des temps de marche vers l'essentiel |
| `rent-vs-buy` | Présentation | Deux courbes de coût montrent à partir de quelle année acheter devient avantageux |
| `closing-costs` | Présentation | Une barre empilée montre le prix et les frais, et se recalcule selon le neuf ou l'ancien |
| `commute-rings` | Présentation | Une zone s'étend autour d'une adresse selon le temps choisi, et les lieux atteints s'allument |
| `area-square` | Présentation | Une surface devient un carré à l'échelle, à côté d'un repère connu |
| `axo-explode` | Présentation | Des étages empilés en axonométrie s'écartent au survol, et chacun donne son nom |
| `construction-phases` | Présentation | Un curseur fait avancer un chantier en quatre temps, du terrassement aux fenêtres allumées |
| `scale-figure` | Présentation | Une silhouette de 1,75 m rend concrète la hauteur d'un volume |
| `leader-labels` | Présentation | Des lignes de renvoi relient des points d'une image à leurs étiquettes |
| `project-sheet` | Présentation | Une fiche technique trace ses filets et révèle ses informations ligne par ligne |
| `fuel-vs-electric` | Présentation | Un curseur de kilométrage compare le coût annuel d'énergie, essence et électrique |
| `resale-curve` | Présentation | Un curseur d'âge place le véhicule sur sa courbe de décote |
| `service-odometer` | Présentation | Un compteur et des barres classent les opérations d'entretien par urgence |
| `spec-duel` | Présentation | Un tableau compare deux modèles, et la meilleure valeur de chaque ligne ressort |
| `safety-stars` | Présentation | Une note en étoiles se tamponne, et les sous-scores s'étirent dessous |
| `co2-per-mode` | Présentation | Une distance donne les émissions de chaque moyen de transport, avec des barres comparées |
| `transit-ticket` | Présentation | Un billet s'active, et sa validité s'écoule avec des bandes qui défilent |
| `traffic-strip` | Présentation | Une bande d'itinéraire montre le trafic par tronçon, avec le retard calculé |
| `elevation-profile` | Présentation | Un curseur suit le profil d'un parcours, et donne l'altitude et la pente au point choisi |
| `train-crowding` | Présentation | Chaque voiture d'un train se remplit selon l'affluence, et la plus calme est indiquée |
| `battery-radius` | Présentation | Un disque montre jusqu'où l'on peut aller avec la batterie restante |
| `timetable-grid` | Présentation | Une grille horaire estompe les passages finis et fait ressortir le prochain |
| `parcel-journey` | Présentation | Un camion avance sur le trajet d'un colis jusqu'à l'étape en cours |
| `pallet-stack` | Présentation | Une palette se remplit de couches de cartons, selon la hauteur de chaque carton |
| `container-fill` | Présentation | Un calcul place les caisses dans un conteneur, et donne le taux de remplissage |
| `route-optimize` | Présentation | Une tournée en désordre se réorganise d'un clic, avec les kilomètres gagnés |
| `eta-range` | Présentation | Une heure d'arrivée s'affiche avec sa marge, en un dégradé autour du moment probable |
| `cold-chain` | Présentation | Une courbe de température montre si le trajet est resté dans la plage permise |
| `dock-schedule` | Présentation | Un planning montre l'occupation des quais sur la journée et ceux qui sont libres maintenant |
| `bill-slices` | Présentation | Une barre découpe la facture en postes, et chacun s'explique au clic |
| `grid-mix` | Présentation | Une barre montre la composition de l'électricité, qui varie doucement dans le temps |
| `heat-pump-flow` | Présentation | Selon la température, un flux de chaleur s'épaissit à la sortie d'une pompe à chaleur |
| `self-consumption` | Présentation | Deux courbes se croisent, et leur zone commune montre la part de solaire utilisée sur place |
| `cheapest-window` | Présentation | Selon la durée demandée, les heures consécutives les moins chères s'allument dans la journée |
| `co2-by-hour` | Présentation | Des barres horaires montrent l'intensité carbone de l'électricité, avec l'heure actuelle et la meilleure heure |
| `reservoir-level` | Présentation | L'eau monte derrière un barrage, avec l'énergie stockée et le seuil de vigilance |
| `heating-compare` | Présentation | Des modes de chauffage se reclassent selon le coût ou les émissions choisis |
| `wind-rose` | Présentation | Une rose des vents ouvre ses secteurs selon la fréquence de chaque direction |
| `oee-gauge` | Présentation | Trois taux donnent le rendement global d'une ligne, et le plus faible est désigné |
| `piston-cycle` | Présentation | Un piston monte et descend avec sa bielle, et chaque temps du moteur est nommé |
| `defect-pareto` | Présentation | Un diagramme de Pareto trie les causes et désigne celles qui font 80 % des défauts |
| `reorder-point` | Présentation | Un seuil de commande redessine le stock en dents de scie, et signale les ruptures |
| `cert-badges` | Présentation | Des sceaux de certification se tamponnent avec leur vraie date de validité |
| `part-explode` | Présentation | Une pièce s'éclate le long d'un axe, et chaque composant donne son nom |
| `crop-calendar` | Présentation | Un calendrier montre semis et récoltes par culture, et dit ce qu'on fait ce mois-ci |
| `rain-gauge` | Présentation | Un pluviomètre se remplit du cumul de la semaine, à côté de la normale |
| `food-miles` | Présentation | Des barres comparent la distance parcourue par un même produit, selon son origine |
| `soil-layers` | Présentation | Un curseur descend dans une coupe de sol, et chaque couche se décrit |
| `honeycomb-fill` | Présentation | Un rayon de ruche se remplit de miel, du centre vers les bords, selon une valeur |
| `degree-days` | Présentation | Un cumul de degrés-jours monte en escalier vers le besoin de la culture, avec une date estimée |
| `sow-window` | Présentation | Une semaine de prévisions fait ressortir les jours favorables pour semer |
| `menu-leaders` | Présentation | Une carte de restaurant se révèle plat par plat, avec des points qui courent jusqu'au prix |
| `latte-layers` | Présentation | Une tasse montre ses couches selon la boisson choisie, versées l'une après l'autre |
| `allergen-matrix` | Présentation | Un tableau d'allergènes éclaire une colonne au choix, et les plats concernés se détachent |
| `daily-special` | Présentation | Le plat du jour s'écrit selon la vraie date, avec la semaine repliée en dessous |
| `nutri-panel` | Présentation | Un curseur de portion recalcule les valeurs nutritionnelles et leur part des repères quotidiens |
| `price-calendar` | Présentation | Un mois de prix se colore du moins cher au plus cher, avec le meilleur jour entouré |
| `amenity-grid` | Présentation | Les équipements essentiels s'affichent, et le reste se déplie à la demande |
| `cancel-policy` | Présentation | Une ligne de temps montre les conditions d'annulation, et situe aujourd'hui dessus |
| `loyalty-nights` | Présentation | Une barre situe les nuits de l'année face aux paliers de fidélité, et dit ce qui reste |
| `review-bars` | Présentation | Des barres résument les avis par critère, avec un point fort et un point à noter |
| `stay-bill` | Présentation | Le détail d'un séjour s'ajoute ligne par ligne, puis le total arrive, sans frais cachés |
| `flight-arc` | Présentation | Un arc relie deux villes, et donne la vraie distance et une durée de vol estimée |
| `boarding-pass` | Présentation | Une carte d'embarquement sort d'une fente, avec ses informations de vol |
| `jetlag-plan` | Présentation | Un décalage horaire donne l'heure de coucher, jour après jour, pour s'y préparer |
| `climate-months` | Présentation | Température et pluie, mois par mois, avec les meilleurs mois nommés |
| `compass-bearing` | Présentation | Une boussole cherche puis trouve le vrai cap vers une autre ville |
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
| `spring-follow` | Micro-interaction | Un point coloré suit le curseur dans l'élément, avec le retard souple d'un ressort |
| `squish-drag` | Micro-interaction | On attrape l'élément : il s'étire selon la vitesse du geste, puis revient en rebondissant |
| `cursor-label` | Micro-interaction | Au survol, une pastille portant un mot accompagne le curseur |
| `hover-tilt-text` | Micro-interaction | Le mot pivote en 3D vers le curseur et son ombre se déplace à l'opposé |
| `press-ripple-text` | Micro-interaction | Au clic, un cercle part du doigt et inverse les couleurs du bouton, y compris celles du texte |
| `swipe-reveal-row` | Micro-interaction | Un bandeau unique glisse de ligne en ligne dans une liste et inverse le texte qu'il recouvre |
| `trail-dots` | Micro-interaction | Une chaîne de perles suit le curseur, chacune poursuivant la précédente |
| `hold-confirm` | Micro-interaction | Il faut maintenir le bouton enfoncé jusqu'à ce qu'il soit plein : c'est la confirmation |
| `snap-toggle` | Micro-interaction | Le bouton de l'interrupteur s'étire avant de sauter de l'autre côté, comme une goutte |
| `stepper-pop` | Micro-interaction | Un compteur plus / moins dont le chiffre glisse dans le sens du changement et qui tremble aux limites |
| `star-rate` | Micro-interaction | Les étoiles s'allument en vague et sautillent au survol et au choix |
| `ink-button` | Micro-interaction | Une goutte de couleur entre dans le bouton par le côté d'où arrive le curseur, et ressort par le côté où il part |
| `gooey-menu` | Micro-interaction | Les actions s'échappent du bouton comme des gouttes, liées à lui par un pont liquide |
| `liquid-glass` | Micro-interaction | Une plaque de verre floute ce qui passe derrière, et son reflet suit le curseur |
| `jelly-list` | Micro-interaction | Les icônes d'une rangée grossissent à l'approche du curseur et poussent leurs voisines, comme un dock |
| `focus-beam` | Micro-interaction | Le cadre de focus glisse d'un champ à l'autre au lieu d'apparaître et de disparaître |
| `border-chase` | Micro-interaction | Une lumière fait le tour de la carte, et accélère lorsqu'on la survole |
| `sticky-note-peel` | Micro-interaction | Le coin d'une note se soulève à l'approche du curseur, comme un vrai papier |
| `image-pop-link` | Micro-interaction | Au survol du lien, une petite image s'ouvre au milieu de la ligne et écarte les mots |
| `drag-reorder` | Micro-interaction | On fait glisser une ligne de la liste, et les autres s'écartent pour lui faire de la place |
| `swipe-card` | Micro-interaction | Une pile de cartes : on balaye la première vers la gauche ou la droite, et la suivante avance |
| `sound-bars-hover` | Micro-interaction | Un petit égaliseur dont les barres ne s'animent qu'au survol, ou en continu |
| `pressure-word` | Micro-interaction | Plus on appuie longtemps sur le mot, plus il s'écrase et s'étale, puis il rebondit au relâchement |
| `price-flip` | Micro-interaction | Un prix passe d'une valeur à l'autre par un croisement vertical, sans saut de mise en page |
| `checkbox-scribble` | Micro-interaction | Cocher dessine une coche au stylo, puis un trait vient biffer le libellé |
| `search-expand` | Micro-interaction | Une icône de recherche s'ouvre en un champ de saisie, et se referme s'il reste vide |
| `tag-delete` | Micro-interaction | L'étiquette supprimée s'envole vers le haut, et les autres glissent pour combler la place |
| `copy-pop-toast` | Micro-interaction | Une petite bulle apparaît à l'endroit du clic pour confirmer l'action, puis s'envole |
| `knob-dial` | Micro-interaction | Un bouton rotatif qu'on tourne en glissant vers le haut ou vers le bas, comme sur une console |
| `footnote-spring` | Micro-interaction | Un clic sur une référence amène à sa note, qui rebondit et s'allume pour se signaler |
| `sticker-peel-hover` | Micro-interaction | Un autocollant de travers se soulève et s'oriente vers le curseur au survol |
| `underline-wave-draw` | Micro-interaction | Au survol, un soulignement ondulé se dessine sous le lien, et s'efface par l'autre côté en partant |
| `emoji-burst` | Micro-interaction | Au clic, quelques symboles s'envolent en dérivant au-dessus de l'élément |
| `cursor-compass` | Micro-interaction | Une grille d'aiguilles s'oriente toute entière vers le curseur, comme des boussoles |
| `double-click-like` | Micro-interaction | Un double appui sur l'image fait apparaître un gros cœur à cet endroit |
| `range-bubble` | Micro-interaction | Un curseur de réglage dont la valeur suit dans une petite bulle au-dessus du pouce |
| `rich-tooltip-follow` | Micro-interaction | Une info-bulle suit le curseur en restant toujours à l'intérieur de l'écran |
| `color-picker-orbit` | Micro-interaction | Des pastilles de couleur changent la teinte d'un produit, avec un anneau qui marque le choix |
| `pagination-squeeze` | Micro-interaction | Une pagination dont l'indicateur glisse et rebondit d'une page à l'autre |
| `accordion-plus-morph` | Micro-interaction | Une foire aux questions : le panneau s'ouvre en douceur et le plus se change en moins |
| `balance-mask` | Micro-interaction | Un bouton masque le solde derrière des points, et le choix peut être retenu |
| `card-number-reveal` | Micro-interaction | Un numéro de carte reste masqué, sauf ses derniers chiffres, et se révèle quelques secondes à la demande |
| `currency-converter` | Micro-interaction | Deux montants reliés par un taux, qu'on peut inverser d'un clic |
| `bill-splitter` | Micro-interaction | Le total se partage entre plusieurs personnes, et les centimes restants sont répartis pour tomber juste |
| `iban-input` | Micro-interaction | Un champ groupe l'IBAN par quatre et vérifie sa clé, sans empêcher la saisie |
| `trend-arrow` | Micro-interaction | Une flèche pivote jusqu'à un angle qui dit la force de la variation |
| `premium-builder` | Micro-interaction | Des garanties à cocher font varier la cotisation mensuelle, annoncée à chaque changement |
| `deductible-slider` | Micro-interaction | Un curseur règle la franchise, et la cotisation mensuelle baisse quand la franchise monte |
| `damage-spots` | Micro-interaction | On touche les zones abîmées d'une voiture vue de dessus, et le résumé s'écrit dessous |
| `document-checklist` | Micro-interaction | Une liste de pièces se coche, une barre avance et le message dit ce qui manque |
| `family-builder` | Micro-interaction | On ajoute adultes et enfants, les silhouettes arrivent et la cotisation se recalcule |
| `open-hours-call` | Micro-interaction | Un bouton d'appel indique en direct si la ligne répond, selon l'heure locale |
| `room-inventory` | Micro-interaction | On estime ses biens pièce par pièce, et la barre se compare au capital assuré |
| `plan-quiz` | Micro-interaction | Quelques questions, une à la fois, mènent à la formule conseillée |
| `signature-pad` | Micro-interaction | On signe au doigt ou à la souris, et la validation s'ouvre quand le tracé est assez long |
| `callback-slots` | Micro-interaction | On choisit parmi les prochains créneaux celui où l'on veut être rappelé |
| `payment-frequency` | Micro-interaction | Un choix de fréquence montre le prix par échéance, le total et l'économie réelle |
| `glossary-tip` | Micro-interaction | Les mots techniques d'un texte s'ouvrent sur leur définition, un à la fois |
| `quote-resume` | Micro-interaction | Un formulaire s'enregistre en local à chaque saisie, et se reprend à la visite suivante |
| `incident-timer` | Micro-interaction | Un compteur indique le temps restant pour déclarer un sinistre |
| `appointment-week` | Micro-interaction | On choisit un jour de la semaine, puis une heure, et le rendez-vous s'écrit en toutes lettres |
| `body-map` | Micro-interaction | Une silhouette se découpe en zones, et toucher une zone oriente vers le bon contenu |
| `pain-scale` | Micro-interaction | Un curseur de 0 à 10 fait changer un visage et le mot qui décrit la douleur |
| `hydration-glasses` | Micro-interaction | Des verres se remplissent d'un geste jusqu'à l'objectif du jour |
| `triage-flow` | Micro-interaction | Des questions oui ou non orientent vers le bon interlocuteur, avec un retour possible |
| `pregnancy-week` | Micro-interaction | Un curseur parcourt les semaines de grossesse, avec le trimestre et les semaines restantes |
| `dental-chart` | Micro-interaction | Une arcade dentaire numérotée permet de désigner les dents concernées |
| `blood-compat` | Micro-interaction | On choisit un groupe sanguin, et ceux qui peuvent recevoir ses globules rouges s'allument |
| `consent-scroll` | Micro-interaction | La case de consentement ne s'active qu'une fois le texte lu jusqu'au bout |
| `pulse-tap` | Micro-interaction | On tapote au rythme de son pouls, et une estimation par minute se calcule |
| `practitioner-sort` | Micro-interaction | On trie une liste de praticiens, et les lignes glissent à leur nouvelle place |
| `dose-grid` | Micro-interaction | Une grille matin, midi et soir se coche, et le compte des prises s'écrit |
| `pill-organizer` | Micro-interaction | Un pilulier montre la semaine, on ouvre les couvercles et la pilule du jour disparaît |
| `interaction-check` | Micro-interaction | On choisit deux éléments, et la table donne leur niveau de compatibilité |
| `capsule-switch` | Micro-interaction | Un interrupteur prend la forme d'une gélule dont la moitié colorée glisse |
| `blister-pop` | Micro-interaction | Une plaquette laisse sortir ses comprimés un par un, et le compte descend |
| `dropper-count` | Micro-interaction | Chaque geste fait tomber une goutte, et le verre se remplit |
| `measure-cup` | Micro-interaction | Un curseur règle le niveau d'un gobelet gradué et convertit le volume |
| `allergen-filter` | Micro-interaction | On coche ses allergies, et les produits concernés sortent de la liste |
| `expiry-check` | Micro-interaction | Une date saisie donne le temps restant avant péremption, en trois états |
| `ingredient-lookup` | Micro-interaction | On cherche un ingrédient dans une longue composition, et la réponse s'écrit par oui ou non |
| `budget-reach` | Micro-interaction | Trois curseurs donnent un budget d'achat possible, recalculé à chaque geste |
| `floorplan-rooms` | Micro-interaction | Un plan montre le nom et la surface de la pièce survolée, sur le total du logement |
| `sun-exposure` | Micro-interaction | Un curseur fait tourner le soleil autour d'un logement, et les façades qu'il touche s'éclairent |
| `price-per-m2` | Micro-interaction | Le prix au mètre carré se recalcule et se situe par rapport à celui du quartier |
| `search-alert` | Micro-interaction | Un bouton enregistre une recherche, la cloche sonne et les critères sont rappelés |
| `sold-sign` | Micro-interaction | Une pancarte se balance à chaque changement d'état, jusqu'à « vendu » en rouge |
| `rent-split` | Micro-interaction | Le loyer se répartit selon la taille des chambres, avec une part commune à égalité |
| `floor-view` | Micro-interaction | Choisir un étage déplace la vue par la fenêtre, et le prix suit |
| `rent-ratio` | Micro-interaction | Revenu et loyer remplissent des blocs, et le seuil des trois fois est vérifié |
| `rooms-range` | Micro-interaction | Deux clics sur des pastilles définissent une plage continue, soudée en une barre |
| `moving-boxes` | Micro-interaction | Chaque tâche cochée fait tomber un carton sur la pile du déménagement |
| `material-swatch` | Micro-interaction | Des échantillons changent le matériau de la façade dans un balayage |
| `scale-bar` | Micro-interaction | Un plan zoome et sa barre d'échelle reste juste, en changeant de valeur par paliers lisibles |
| `modular-grid` | Micro-interaction | Un bouton fait descendre la grille modulaire par-dessus une mise en page |
| `roof-pitch` | Micro-interaction | Un curseur règle la pente d'un toit et donne le pourcentage et la hauteur du faîtage |
| `car-colorizer` | Micro-interaction | Des pastilles repeignent la voiture, et le prix suit la peinture choisie |
| `range-conditions` | Micro-interaction | Température et vitesse font varier l'autonomie réelle d'un véhicule électrique |
| `charge-time` | Micro-interaction | Le type de borne et le niveau visé donnent le temps de recharge, ralenti après 80 % |
| `rev-meter` | Micro-interaction | Maintenir le bouton fait monter l'aiguille jusqu'à la zone rouge, où le rupteur coupe |
| `gear-selector` | Micro-interaction | Un levier P R N D sert de contrôle à plusieurs états, avec un petit claquement |
| `headlight-sweep` | Micro-interaction | Un bouton allume des phares, et le faisceau suit la souris pour révéler le texte |
| `lease-monthly` | Micro-interaction | Durée, kilométrage et apport donnent le loyer mensuel estimé |
| `road-cta` | Micro-interaction | Un bouton montre une route qui défile, et une petite voiture qui rejoint le bout |
| `plate-input` | Micro-interaction | Un champ prend l'apparence d'une plaque, met en forme la saisie et valide le format français |
| `parking-sensor` | Micro-interaction | Plus la distance baisse, plus les arcs s'allument, rougissent et battent vite |
| `trip-computer` | Micro-interaction | Un écran à cristaux liquides fait défiler les informations d'un trajet |
| `seat-fold` | Micro-interaction | Rabattre les sièges agrandit la zone de chargement et le volume écrit |
| `key-fob` | Micro-interaction | Deux boutons verrouillent la voiture, qui répond en faisant clignoter ses feux |
| `mode-compare` | Micro-interaction | Selon la distance, des barres comparent le temps de chaque mode et marquent le plus rapide |
| `zone-fare` | Micro-interaction | Des zones en anneaux s'allument et donnent le tarif du trajet |
| `carpool-split` | Micro-interaction | Chaque passager installé dans la voiture fait baisser le prix par personne |
| `step-free-route` | Micro-interaction | Une option redessine l'itinéraire pour éviter les marches, en annonçant la différence |
| `platform-guide` | Micro-interaction | On choisit sa sortie, et la voiture où monter s'allume, avec une flèche |
| `pass-or-ticket` | Micro-interaction | Un curseur montre si les tickets ou l'abonnement sont les plus avantageux, avec le seuil |
| `gear-cogs` | Micro-interaction | Deux pignons tournent au rapport exact, et le développement par coup de pédale s'écrit |
| `transfer-check` | Micro-interaction | Le temps de correspondance se compare à la marche à prévoir, et le risque s'écrit |
| `box-finder` | Micro-interaction | Trois dimensions trouvent le plus petit carton qui contient l'objet, dans n'importe quel sens |
| `volumetric-weight` | Micro-interaction | Dimensions et poids donnent le poids facturé, le plus élevé entre le réel et le volume |
| `barcode-scan` | Micro-interaction | Un laser balaie un code-barres, et la lecture se confirme en vert |
| `customs-fee` | Micro-interaction | Selon la valeur du colis, droits et TVA s'additionnent jusqu'au total à payer |
| `weight-tier` | Micro-interaction | Un curseur de poids allume le palier de tarif correspondant, et le seuil suivant |
| `incoterm-bar` | Micro-interaction | Un Incoterm choisi colore chaque étape du transport selon qui paie |
| `pick-counter` | Micro-interaction | Une liste de préparation compte chaque article prélevé et annonce la commande complète |
| `return-flow` | Micro-interaction | Trois étapes guident un retour de colis, chacune débloquant la suivante |
| `locker-grid` | Micro-interaction | Le bon code ouvre le bon casier, et un mauvais code fait trembler la consigne |
| `tracking-detect` | Micro-interaction | Un champ reconnaît le format d'un numéro de suivi pendant la saisie |
| `eco-delivery-day` | Micro-interaction | Parmi les jours de livraison, celui où le livreur passe déjà est mis en avant |
| `axle-load` | Micro-interaction | Une charge qu'on déplace répartit le poids sur les essieux, avec une alerte en cas d'excès |
| `solar-roof` | Micro-interaction | Un curseur pose des panneaux sur le toit et donne production, économie et rentabilité |
| `wind-turbine` | Micro-interaction | Le vent fait tourner une éolienne, et la puissance grimpe avec son cube, jusqu'à l'arrêt de sécurité |
| `insulation-loss` | Micro-interaction | Cocher les postes isolés fait passer la maison du rouge au bleu et chiffre l'économie |
| `thermostat-dial` | Micro-interaction | Un cadran règle la température et traduit chaque degré en écart de dépense |
| `appliance-meter` | Micro-interaction | Allumer des appareils accélère le disque du compteur et chiffre le coût à l'heure |
| `tariff-choice` | Micro-interaction | Selon la part de consommation en heures creuses, l'option la plus avantageuse s'affiche |
| `outage-check` | Micro-interaction | Un code postal saisi indique s'il y a une coupure, et l'heure de retour prévue |
| `burner-flame` | Micro-interaction | Un curseur règle une rangée de flammes bleues, et leur puissance en kilowatts |
| `bulb-compare` | Micro-interaction | Deux ampoules brillent et l'écart de coût annuel se calcule selon l'usage |
| `standby-drain` | Micro-interaction | Une liste d'appareils en veille chiffre le coût annuel ; les débrancher fait baisser la note |
| `aid-estimate` | Micro-interaction | Le revenu et les travaux cochés donnent une estimation d'aide, écrite et animée |
| `solar-tilt` | Micro-interaction | Un curseur incline un panneau et montre le rendement perdu par rapport à l'angle optimal |
| `tolerance-gauge` | Micro-interaction | Une mesure glisse sur une zone de tolérance, et le verdict tombe par écrit |
| `press-stamp` | Micro-interaction | Maintenir un bouton fait descendre une presse, qui marque la pièce à fond de course |
| `tank-valve` | Micro-interaction | Deux vannes font monter ou descendre le niveau d'une cuve, en continu |
| `steel-glow` | Micro-interaction | Un curseur chauffe une barre d'acier, qui change de couleur et prend le nom de cette couleur |
| `torque-click` | Micro-interaction | Maintenir serre un écrou jusqu'au clic du couple réglé, et signale tout dépassement |
| `takt-time` | Micro-interaction | Le rythme de la ligne se calcule et se voit : un bloc bat la cadence |
| `robot-arm` | Micro-interaction | Un bras à deux segments cherche à atteindre le pointeur, grâce à un vrai calcul d'angles |
| `field-rotation` | Micro-interaction | Un curseur d'années fait tourner les cultures de parcelle en parcelle |
| `harvest-yield` | Micro-interaction | Surface et rendement font lever les épis, et donnent la production et le revenu estimés |
| `sprout-stages` | Micro-interaction | Un curseur de jours fait pousser une plante, de la graine à la récolte |
| `veg-basket` | Micro-interaction | Des produits s'ajoutent au panier, avec le prix et le poids par rapport au maximum |
| `ph-meter` | Micro-interaction | Un curseur de pH glisse sur une bandelette et liste les cultures adaptées |
| `crow-scatter` | Micro-interaction | Des oiseaux posés sur un fil s'envolent à l'approche du pointeur, puis reviennent |
| `compost-ratio` | Micro-interaction | On ajoute vert et brun dans un composteur, et l'équilibre du mélange s'écrit |
| `greenhouse-vent` | Micro-interaction | Plus la température monte dans la serre, plus les vantaux du toit s'ouvrent |
| `seed-packet` | Micro-interaction | Un sachet de graines se retourne pour montrer ses conseils de culture |
| `npk-triangle` | Micro-interaction | Trois curseurs placent un engrais dans un triangle, et donnent son effet dominant |
| `tree-rings` | Micro-interaction | Un curseur d'âge ajoute des cernes à un tronc, et signale les années sèches |
| `menu-diet-filter` | Micro-interaction | Des filtres de régime retirent les plats incompatibles, et le compte s'écrit |
| `table-booking` | Micro-interaction | On choisit le nombre de couverts, seuls les créneaux possibles restent et la réservation se confirme |
| `floor-tables` | Micro-interaction | Sur un plan de salle, on choisit une table libre, et sa capacité s'écrit |
| `bowl-builder` | Micro-interaction | Des ingrédients tombent dans un bol, avec le prix et les calories recalculés |
| `pizza-builder` | Micro-interaction | Les garnitures se placent sur la moitié choisie, et le prix se met à jour |
| `tip-split` | Micro-interaction | Addition, pourboire et nombre de personnes donnent la part de chacun |
| `egg-timer` | Micro-interaction | Des préréglages lancent un minuteur, avec un œuf qui change et qui saute à la fin |
| `recipe-scale` | Micro-interaction | Un nombre de parts adapte toutes les quantités d'une recette, avec des valeurs arrondies pratiques |
| `wine-pairing` | Micro-interaction | Un plat choisi propose un type de vin, avec son verre et son profil de goût |
| `spice-level` | Micro-interaction | Une rangée de piments s'allume selon le niveau, et le mot décrit le goût |
| `brew-ratio` | Micro-interaction | Le volume d'eau et l'intensité donnent la dose exacte de café moulu |
| `dough-rise` | Micro-interaction | La température de la pièce change le temps de levée d'une pâte, qui gonfle à l'écran |
| `fork-rating` | Micro-interaction | Une note s'affiche ou se donne en fourchettes, avec des demi-valeurs |
| `stay-range` | Micro-interaction | Deux clics choisissent un séjour, et les nuits et le prix se calculent |
| `room-type` | Micro-interaction | Le type de chambre choisi affiche ses détails, et un carré montre sa surface à l'échelle |
| `guest-steppers` | Micro-interaction | Trois compteurs composent un voyage, avec des limites et un résumé clair |
| `key-card` | Micro-interaction | Une carte passe devant un lecteur, le voyant s'allume et la porte s'ouvre |
| `door-hanger` | Micro-interaction | Une accroche-porte se retourne entre deux messages, comme dans une vraie chambre |
| `breakfast-tray` | Micro-interaction | Des articles se posent sur un plateau, avec le total et l'heure de service |
| `concierge-bell` | Micro-interaction | Une sonnette de réception oscille, et un conseil de concierge apparaît |
| `bed-merge` | Micro-interaction | Deux lits simples se rapprochent pour former un grand lit, et le choix s'écrit |
| `wakeup-call` | Micro-interaction | On choisit une heure de réveil, et on voit le temps de sommeil restant, en passant minuit |
| `pillow-menu` | Micro-interaction | On choisit un oreiller, qui s'écrase à l'écran selon sa fermeté |
| `luggage-tag` | Micro-interaction | Une étiquette de bagage se remplit à la saisie, et se balance à chaque lettre |
| `timezone-slider` | Micro-interaction | Un curseur déplace l'heure, et donne celle des autres villes avec leur vrai fuseau |
| `packing-weight` | Micro-interaction | Des objets cochés remplissent une valise, et le poids se compare à la limite |
| `trip-budget` | Micro-interaction | Durée et niveau de confort donnent un budget de voyage, réparti par poste |
| `seat-map` | Micro-interaction | Un plan de cabine laisse choisir ses sièges, jusqu'au nombre de voyageurs, avec les suppléments |
| `postcard-flip` | Micro-interaction | Une carte postale se retourne, avec son image, son message et son timbre |
| `plug-adapter` | Micro-interaction | Le pays choisi affiche sa prise et sa tension, et indique s'il faut un adaptateur |
| `trip-stops` | Micro-interaction | Les nuits par étape se règlent, et les dates de tout le voyage s'ajustent |
| `suitcase-open` | Micro-interaction | Une valise s'ouvre d'un clic, et son contenu se déplie en dessous |
| `phrase-card` | Micro-interaction | Une carte retourne une expression sur sa traduction, sa prononciation, et peut la lire à voix haute |
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
| `circle-unveil` | Défilement | Une image apparaît dans un cercle qui s'agrandit à mesure qu'on défile |
| `slat-scroll` | Défilement | Des lames horizontales recouvrent l'image et s'ouvrent une à une au défilement |
| `scroll-typing` | Défilement | Le texte s'écrit à mesure qu'on défile, et s'efface si on remonte |
| `band-slide` | Défilement | Une bande de texte géant traverse l'écran à l'horizontale, au rythme du défilement |
| `cross-rows` | Défilement | Plusieurs lignes d'images ou de logos glissent en sens opposé au défilement |
| `fan-scroll` | Défilement | Des cartes empilées s'ouvrent en éventail à mesure qu'on défile |
| `tunnel-scroll` | Défilement | Des cadres concentriques grandissent au défilement : on a l'impression de traverser un couloir |
| `depth-stack` | Défilement | Plusieurs couches se déplacent à des vitesses différentes selon leur profondeur |
| `plane-land` | Défilement | Un écran couché en perspective se redresse et se pose face à nous au défilement |
| `wheel-scroll` | Défilement | Une liste de mots tourne sur une roue verticale au rythme du défilement |
| `thread-line` | Défilement | Un fil vertical se remplit de couleur le long d'une section, à mesure qu'on avance |
| `dot-swell` | Défilement | Une vague de points gonfle et traverse une grille au fil du défilement |
| `aperture-text` | Défilement | Un grand mot grandit au défilement jusqu'à remplir l'écran, et on passe à travers |
| `hue-drift` | Défilement | La couleur de l'élément glisse doucement sur le cercle chromatique au fil du défilement |
| `bars-scrub` | Défilement | Les barres d'un graphique montent et redescendent selon qu'on défile dans un sens ou l'autre |
| `door-scroll` | Défilement | Deux battants s'ouvrent en perspective sur le contenu, au fil du défilement |
| `grid-breathe` | Défilement | Les cases d'une grille s'écartent en bord d'écran et se resserrent au centre |
| `flip-scrub` | Défilement | Une carte à deux faces se retourne au fil du défilement |
| `curtain-scrub` | Défilement | Un rideau de couleur au bord arrondi se lève sur le contenu au fil du défilement |
| `letters-scrub` | Défilement | Les lettres d'un titre, dispersées, se rassemblent à mesure qu'on défile vers lui |
| `reading-marker` | Défilement | Les mots passent du gris au plein quand ils atteignent la ligne de lecture |
| `chapter-ticker` | Défilement | Un petit compteur indique le chapitre en cours, et son chiffre coulisse quand on change de section |
| `frame-drift` | Défilement | L'image glisse lentement à l'intérieur de son cadre, qui reste immobile |
| `wave-morph` | Défilement | Le bord qui sépare deux sections est une vague qui ondule selon le défilement |
| `orbit-scrub` | Défilement | Des éléments tournent autour d'un centre à mesure qu'on défile, tout en restant droits |
| `stairs-scroll` | Défilement | Une rangée de blocs forme un escalier qui s'aplanit jusqu'à une ligne parfaite |
| `wipe-scrub` | Défilement | Un balayage en biais au bord adouci dévoile l'élément au fil du défilement |
| `card-recede` | Défilement | En sortant par le haut, une section recule, s'arrondit et s'assombrit, comme une carte glissée sous la suivante |
| `speed-lines` | Défilement | Des traits verticaux apparaissent quand on défile vite, puis s'effacent au repos |
| `scroll-gauge` | Défilement | Une jauge circulaire se remplit jusqu'à sa valeur quand elle entre à l'écran |
| `sticky-slideshow` | Défilement | Le cadre reste fixe à l'écran, et les images se succèdent au fil du défilement |
| `scroll-clock` | Défilement | Les aiguilles d'une horloge tournent au rythme du défilement |
| `parallax-letters` | Défilement | Chaque lettre du titre se déplace à sa propre vitesse, et elles s'alignent au centre de l'écran |
| `tilted-band` | Défilement | Un bandeau de couleur incliné traverse la section et son texte glisse au défilement |
| `grid-open-scroll` | Défilement | Une grille de cases recouvre l'image, et elles disparaissent au hasard au fil du défilement |
| `zoom-out-frame` | Défilement | L'image part très agrandie et recule au fil du défilement jusqu'à entrer dans son cadre |
| `wave-text-scroll` | Défilement | Une onde parcourt le mot quand on défile, et il s'immobilise à l'arrêt |
| `title-fade-pass` | Défilement | Un titre n'est pleinement visible et net que lorsqu'il passe au centre de l'écran |
| `north-arrow` | Défilement | Une flèche de nord tourne au fil du défilement de la page |
| `colonnade` | Défilement | Une rangée de colonnes en perspective s'ouvre et se resserre au fil du défilement |
| `arch-tunnel` | Défilement | Des arches emboîtées grandissent au fil du défilement, comme si l'on avançait |
| `stair-climb` | Défilement | Une silhouette monte un escalier, marche par marche, au fil de la lecture |
| `louver-facade` | Défilement | Des lames de bois tournent et laissent voir ce qu'elles cachaient, au fil du défilement |
| `skyline-rise` | Défilement | Une silhouette de ville se lève, tour après tour, au fil du défilement |
| `wheel-roll` | Défilement | Une voiture avance au fil du défilement, et ses roues tournent en proportion exacte |
| `chandelier-sway` | Défilement | Un lustre se balance selon la vitesse de défilement, et s'immobilise peu à peu |
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
| `diagonal-tiles` | Transition | Une grille de tuiles couvre l'écran en une vague qui part d'un coin |
| `spiral-tiles` | Transition | Des tuiles couvrent l'écran en spirale, du bord vers le centre |
| `clock-wipe` | Transition | L'écran est balayé par un secteur qui tourne, comme l'aiguille d'une horloge |
| `ink-drops` | Transition | Plusieurs gouttes d'encre apparaissent et grandissent jusqu'à recouvrir l'écran |
| `stair-bars` | Transition | Des colonnes montent l'une après l'autre en escalier, puis repartent vers le haut |
| `wave-cover` | Transition | Une vague liquide monte du bas, recouvre l'écran, puis s'en va vers le haut |
| `cross-blinds` | Transition | Des lames verticales et horizontales s'ouvrent et se croisent jusqu'à couvrir l'écran |
| `fold-doors` | Transition | Deux panneaux se referment en 3D comme les portes d'un ascenseur qui se rabat |
| `shatter-tris` | Transition | Des éclats triangulaires convergent depuis le point de clic et se referment sur l'écran |
| `word-flash` | Transition | Pendant le passage, quelques mots géants s'enchaînent en rafale sur un aplat de couleur |
| `text-cover` | Transition | Des rangées de texte géant glissent en sens alternés pour couvrir l'écran |
| `dots-cover` | Transition | Une trame de points grossit depuis le point de clic jusqu'à former un aplat |
| `scan-cover` | Transition | Un rayon lumineux traverse l'écran de haut en bas et laisse un aplat derrière lui |
| `color-stack` | Transition | Plusieurs aplats de couleur montent à la suite et laissent voir chacun leur bande |
| `x-cross` | Transition | Un grand X s'épaissit jusqu'à couvrir l'écran, puis se retire par les côtés |
| `page-turn` | Transition | Une feuille pivote depuis le bord de l'écran, comme une page de livre qu'on tourne |
| `ripple-rings` | Transition | Des anneaux de couleur partent du point de clic et recouvrent l'écran l'un après l'autre |
| `corner-sweep` | Transition | Un grand pan de couleur balaye l'écran en diagonale depuis le coin le plus proche du clic |
| `zigzag-cover` | Transition | Un pan au bord en dents de scie monte du bas, couvre l'écran et repart par le haut |
| `mirror-split` | Transition | Deux moitiés se ferment vers le centre de l'écran, avec une ligne de lumière à leur rencontre |
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
| `ascii-image` | Image | L'image se change en texte ASCII au survol, chaque signe suivant sa luminosité |
| `dither-reveal` | Image | L'image apparaît en tramage noir et blanc de type 1-bit, puis passe par paliers à ses vraies couleurs |
| `duotone-hover` | Image | L'image est tirée en deux couleurs franches, et retrouve ses teintes au survol |
| `mosaic-hover` | Image | Au repos, l'image est éparpillée en petites cellules, qui se recomposent au survol |
| `wave-image` | Image | L'image ondule comme une surface d'eau au survol, puis retrouve son calme |
| `scan-reveal` | Image | L'image apparaît par fines lignes horizontales qui s'épaississent jusqu'à se toucher |
| `strip-slider` | Image | Un diaporama où l'image suivante arrive par bandes verticales décalées |
| `tilt-focus` | Image | Une bande de l'image reste nette et suit le curseur, le reste est flou, comme une photo de maquette |
| `polaroid-drop` | Image | Des photos à cadre blanc tombent sur la table et se posent en désordre ; un clic en ramène une au premier plan |
| `x-ray` | Image | Le curseur fait apparaître une seconde image dans un cercle, comme une radio de la première |
| `hover-zoom-pan` | Image | Au survol, l'image s'agrandit et suit le curseur pour montrer les détails |
| `hotspot-image` | Image | Des points pulsent sur une image, et chacun ouvre une courte explication |
| `grid-dim-hover` | Image | Dans une galerie, tout s'estompe sauf l'image qu'on survole |
| `film-scrub` | Image | On parcourt une séquence d'images en déplaçant le curseur, comme une pellicule qu'on fait glisser |
| `vignette-focus` | Image | Les bords de l'image s'assombrissent et le centre clair suit le curseur |
| `lightbox-flip` | Image | Une miniature grandit sans coupure jusqu'au plein écran, et revient à sa place à la fermeture |
| `scratch-reveal` | Image | On gratte une surface avec le curseur ou le doigt pour découvrir ce qu'il y a dessous |
| `color-splash` | Image | L'image est en noir et blanc, et la couleur n'apparaît qu'autour du curseur |
| `bank-card-flip` | Image | Une carte bancaire s'oriente vers le curseur, et se retourne au clic pour montrer son dos |
| `panorama-drag` | Image | Une image se fait glisser en boucle avec une inertie, et une boussole suit le regard |
| `listing-photos` | Image | Passer la souris sur la carte fait défiler les photos, des flèches font de même au doigt |
| `staging-toggle` | Image | Une pièce vide se meuble d'un geste, chaque meuble tombant à sa place |
| `section-cut` | Image | Un curseur coupe le bâtiment et montre ses pièces derrière la façade |
| `tracing-overlay` | Image | Un papier calque se déplace sur une image, avec ses traits d'esquisse |
| `sketch-render` | Image | Une image passe d'une esquisse contrastée à sa vue finale au fil du défilement |
| `turntable-top` | Image | On fait tourner une voiture sur son plateau, au pointeur ou au clavier, avec de l'inertie |
| `day-night-room` | Image | Un curseur d'heure fait passer la chambre du jour à la nuit, et allume la lampe |
| `door-reveal` | Image | Une porte numérotée s'ouvre sur une image, au survol, au focus ou au toucher |
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
| `bento-expand` | Navigation | Une case de la grille s'agrandit au clic, et les autres glissent pour se ranger autour d'elle |
| `mega-index` | Navigation | Une liste de très grands liens : l'aperçu du lien survolé apparaît à côté, les autres s'estompent |
| `pill-nav-morph` | Navigation | Une barre en pilule se réduit à l'essentiel quand on descend, et s'ouvre de nouveau au survol |
| `rail-progress-nav` | Navigation | Un rail vertical de petits traits : le trait de la section en cours s'allonge et se remplit au fil de la lecture |
| `command-dock` | Navigation | Une palette de commandes : on tape, la liste se filtre en direct, et on valide au clavier |
| `breadcrumb-fold` | Navigation | Un fil d'Ariane replie ses niveaux intermédiaires derrière « … » et les déroule au clic |
| `sticky-stack-nav` | Navigation | Les titres de section s'empilent en haut de l'écran pendant qu'on descend, et ceux à venir attendent en bas |
| `page-peek` | Navigation | Un panneau dépasse du bas de l'écran : on le tire vers le haut, il s'arrête à mi-hauteur ou en haut |
| `horizontal-snap` | Navigation | Une rangée horizontale qui s'accroche à chaque élément, avec des flèches et des points qui suivent |
| `split-hover-hero` | Navigation | Deux panneaux se partagent l'écran : celui qu'on survole prend presque toute la place |
| `masonry-flow` | Navigation | Un mur de cartes irrégulier : chacune va dans la colonne la plus courte, et tout glisse quand la largeur change |
| `tab-underline-ink` | Navigation | Le trait sous l'onglet s'étire jusqu'au suivant, puis se rétracte, comme une goutte d'encre |
| `mobile-tabbar-bump` | Navigation | Une barre d'onglets mobile : une pastille glisse sous l'icône active, qui se soulève |
| `toc-minimap` | Navigation | Une miniature de la page montre la longueur de chaque section et où se trouve l'écran |
| `cursor-menu-ring` | Navigation | Un clic droit ouvre un menu en cercle sous le curseur, et les actions rejoignent leur place autour de lui |
| `stacked-sections-tabs` | Navigation | Des sections empilées côte à côte, comme les onglets d'un classeur : celle qu'on ouvre prend la place |
| `carousel-3d-coverflow` | Navigation | Des couvertures sont disposées en perspective : celle du centre est de face, les autres pivotent sur les côtés |
| `skip-link-reveal` | Navigation | Un lien « Aller au contenu » reste caché et descend quand on arrive sur la page au clavier |
| `language-switch-flip` | Navigation | Un petit bouton rond affiche la langue en cours, et son sigle bascule en 3D quand on change |
| `progress-steps-rail` | Navigation | Une ligne court d'étape en étape, et chaque étape franchie change de couleur |
| `drawer-push` | Navigation | Un panneau latéral s'ouvre et pousse tout le contenu, comme un seul objet |
| `back-to-top-progress` | Navigation | Un bouton de remontée apparaît au bout de quelques écrans, avec un anneau qui montre la part lue |
| `tag-filter-flip` | Navigation | Une grille se filtre par étiquette, et les éléments restants glissent vers leur nouvelle place |
| `sidebar-collapse` | Navigation | Une barre latérale se replie sur ses icônes, et retient ce choix |
| `floor-finder` | Navigation | On cherche un service et son étage s'allume sur la coupe du bâtiment |
| `ask-pharmacist` | Navigation | Une bulle s'ouvre sur les questions fréquentes, en petites cartes qui arrivent en cascade |
| `map-price-pins` | Navigation | Des bulles de prix sur une carte ouvrent le détail de l'annonce choisie |
| `project-index` | Navigation | Une liste de projets par année ouvre une ligne à la fois sur son image |
| `metro-line` | Navigation | On touche un arrêt sur la ligne pour voir le trajet s'allumer et le temps de parcours |
| `network-lines` | Navigation | Des pastilles de ligne allument ou éteignent les tracés sur le plan du réseau |
| `warehouse-slot` | Navigation | On tape un emplacement et il s'allume sur le plan des allées |
| `lot-trace` | Navigation | Un numéro de lot déroule toute la chaîne, de la matière à l'expédition |
| `bom-tree` | Navigation | Une nomenclature en arbre se déplie, et les coûts remontent des pièces vers le produit |
| `elevator-dial` | Navigation | On choisit un étage, et l'aiguille d'un vieux cadran prend le temps de s'y rendre |
| `itinerary-days` | Navigation | Un programme s'ouvre jour par jour, et un point glisse jusqu'au jour choisi |
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
| `flow-field` | Ambiance | Des milliers de petits traits suivent un courant invisible et dessinent des veines qui s'effacent lentement |
| `metaballs` | Ambiance | Des bulles se rencontrent, s'étirent et fusionnent en une masse liquide |
| `voronoi-cells` | Ambiance | Un réseau de cellules se déforme lentement, comme un tissu vivant vu au microscope |
| `contour-lines` | Ambiance | Des courbes de niveau se déplacent doucement, comme une carte de relief qui respire |
| `game-of-life` | Ambiance | Un automate cellulaire vit en fond : des motifs naissent, voyagent et s'éteignent |
| `ribbon-sine` | Ambiance | Un ruban formé de dizaines de lignes fines ondule comme un tissu dans le vent |
| `particle-text` | Ambiance | Des particules se rassemblent pour former un mot, et s'écartent quand le curseur passe |
| `rain-glass` | Ambiance | Des gouttes glissent par à-coups sur l'élément, comme de la pluie sur une vitre |
| `snow-fall` | Ambiance | Des flocons tombent à plusieurs profondeurs, les plus proches plus vite et plus grands |
| `fireflies` | Ambiance | Des lucioles errent lentement et s'allument chacune à leur rythme |
| `matrix-dots-wave` | Ambiance | Une grille de points forme un terrain qui ondule en perspective |
| `sun-rays` | Ambiance | Des rayons de couleur tournent lentement autour d'un point, comme un soleil de dessin animé |
| `plasma` | Ambiance | Un plasma coloré se déforme en continu, calculé point par point entre trois couleurs |
| `equalizer-bg` | Ambiance | Un grand égaliseur rythme le bas de la section et s'estompe vers le haut |
| `kaleidoscope` | Ambiance | Des formes colorées se multiplient par symétrie autour d'un centre, et se transforment lentement |
| `lightning` | Ambiance | Un éclair généré au hasard zèbre le fond, quelques instants, à des moments imprévus |
| `sand-grain` | Ambiance | Des grains tombent et s'accumulent en dunes qui glissent, jusqu'à recommencer |
| `mesh-gradient` | Ambiance | Un dégradé maillé à quatre couleurs se déforme lentement, sans jamais se répéter |
| `tiles-flicker` | Ambiance | Une grille de tuiles s'allume et s'éteint au hasard, comme les fenêtres d'un immeuble la nuit |
| `spiral-galaxy` | Ambiance | Une galaxie en spirale tourne sur elle-même, ses bras se tordant lentement |
| `noise-terrain` | Ambiance | Des lignes de crêtes se succèdent et frémissent, chacune masquant la suivante |
| `bubble-rise` | Ambiance | Des bulles montent en ondulant et éclatent si le curseur les touche |
| `stipple-sun` | Ambiance | Un soleil dessiné en points denses respire légèrement, comme une gravure ancienne devenue vivante |
| `wire-globe` | Ambiance | Un globe en fil de fer tourne sur lui-même, et sa vitesse et son inclinaison suivent le curseur |
| `heat-haze` | Ambiance | L'image tremble légèrement, comme l'air au-dessus d'une route brûlante |
| `radar-sweep` | Ambiance | Un faisceau de radar tourne et révèle des échos, qui s'effacent lentement |
| `circuit-pulse` | Ambiance | Des impulsions de lumière voyagent sur un réseau de pistes à angles droits |
| `sea-layers` | Ambiance | Plusieurs couches de vagues se balancent à des rythmes différents |
| `dust-motes` | Ambiance | Des poussières flottent lentement dans un rayon de lumière, légèrement attirées par le curseur |
| `hex-glow` | Ambiance | Une grille d'alvéoles reste invisible, sauf autour du curseur où elle s'éclaire |
| `cloud-drift` | Ambiance | Des nuages dérivent à plusieurs profondeurs, les plus proches plus vite |
| `star-warp` | Ambiance | Les étoiles défilent depuis le centre, comme un voyage spatial qui s'accélère au survol |
| `pendulum-wave` | Ambiance | Des pendules de longueurs différentes se désynchronisent, dessinent des vagues, puis se réalignent |
| `ecg-line` | Ambiance | Un tracé cardiaque défile en effaçant devant lui, au rythme choisi |
| `led-cross` | Ambiance | Une croix en points lumineux enchaîne ses animations comme une enseigne |
| `facade-windows` | Ambiance | Une façade montre des fenêtres qui s'allument et s'éteignent selon l'heure locale |
| `concrete-grain` | Ambiance | Un fond de béton brut est généré sans image, avec ses joints et ses trous de coffrage |
| `window-light` | Ambiance | Une lumière de fenêtre glisse lentement sur un mur |
| `road-dashes` | Ambiance | Une route défile en perspective vers un horizon au soleil couchant |
| `blind-spot` | Ambiance | Une voiture passe dans l'angle mort : la zone se teinte et le témoin s'allume |
| `ferry-crossing` | Ambiance | Un petit bateau traverse à la position réelle du trajet, et le temps restant s'écrit |
| `conveyor-belt` | Ambiance | Des colis de tailles différentes passent en boucle sur un tapis roulant |
| `assembly-line` | Ambiance | Une pièce avance de poste en poste, et se complète à chaque arrêt |
| `sort-gate` | Ambiance | Des pièces arrivent, bifurquent vers le bon bac et les comptes montent |
| `flock-gather` | Ambiance | Un troupeau broute dans le pré, et rejoint l'enclos en se serrant d'un clic |
| `wheat-field` | Ambiance | Un champ de blé ondule au vent et s'écarte sous le pointeur |
| `steam-rise` | Ambiance | De la vapeur monte en volutes au-dessus d'un plat, d'une tasse ou d'un titre |
| `pool-card` | Ambiance | Une carte de piscine donne température et horaires, et fait des ondes au toucher |
| `plane-window` | Ambiance | Un hublot montre des nuages qui passent, avec un ciel réglé sur l'heure réelle |
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
| `agent-graph` | État | Un agent d'IA parcourt ses étapes : chaque nœud s'active, pulse, puis se valide |
| `voice-wave` | État | Une onde de barres réagit à la voix, plus haute au centre, quand l'assistant écoute |
| `citation-pop` | État | Des pastilles numérotées marquent les sources d'une réponse, et s'ouvrent en aperçu au survol |
| `confidence-meter` | État | Une petite barre indique, en mots et en longueur, à quel point une réponse est sûre |
| `diff-reveal` | État | Le texte se corrige sous nos yeux : les mots retirés se barrent, les mots ajoutés se surlignent |
| `context-chips` | État | De petites étiquettes apparaissent une à une pour montrer ce que l'assistant lit |
| `skeleton-morph` | État | Des lignes grises de chargement se dissolvent en place pour laisser apparaître le vrai texte |
| `streaming-code` | État | Du code s'écrit tout seul, par petits groupes de signes, avec une coloration simple |
| `queue-position` | État | Une file d'attente qui avance : on voit sa place et le nombre de personnes restantes |
| `error-glitch-shake` | État | Le champ refuse d'une petite secousse, se colore et explique en mots ce qui ne va pas |
| `success-stamp` | État | Un tampon « Validé » s'écrase sur l'élément, avec une petite secousse au moment du choc |
| `unlock-slide` | État | Pour confirmer, on fait glisser le pouce jusqu'au bout du rail ; en lâchant avant, il revient |
| `upload-drop` | État | Une zone de dépôt dont la bordure se met à tourner quand un fichier arrive au-dessus |
| `offline-banner` | État | Un bandeau descend quand la connexion se perd, puis passe au vert au retour et s'efface |
| `battery-level` | État | Une petite pile se remplit jusqu'à son niveau, et clignote doucement si elle est faible ou en charge |
| `typing-indicator-name` | État | Une phrase « Noa est en train d'écrire… » s'accorde selon le nombre de personnes, avec trois points qui dansent |
| `save-pill` | État | Une pastille discrète indique « Enregistrement… » puis « Enregistré », et s'efface |
| `empty-state-float` | État | Une illustration flotte doucement, son ombre suit, et un message invite à commencer |
| `multi-file-progress` | État | Plusieurs tâches avancent en même temps, chacune avec sa barre, sa valeur et sa coche |
| `notification-stack` | État | Des notifications s'empilent, les plus anciennes reculent, puis se retirent seules |
| `prompt-suggestions` | État | Des pastilles arrivent en cascade et proposent des idées ; un clic remplit le champ de l'assistant |
| `model-switcher` | État | Un petit bouton ouvre une liste de modes ou de modèles, avec une coche sur le choix en cours |
| `transaction-feed` | État | Les nouvelles opérations arrivent en haut de la liste, avec leur montant signé |
| `price-tick-flash` | État | Une valeur clignote brièvement dans la couleur de son changement, avec une flèche |
| `secure-lock` | État | Un cadenas ouvert se ferme et le message passe à « chiffré » |
| `due-date-bar` | État | Une barre montre le temps écoulé vers une échéance, et le message devient plus ferme à l'approche |
| `er-wait` | État | Un temps d'attente s'affiche avec son niveau, l'heure de sa mise à jour et le rappel des urgences vitales |
| `device-check` | État | Une liste vérifie pas à pas que le navigateur peut tenir une consultation à distance |
| `next-dose` | État | Un anneau compte le temps restant avant la prochaine prise, après un geste de confirmation |
| `rx-ready` | État | Une ordonnance avance de reçue à prête, et l'état final se détache en vert |
| `capsule-progress` | État | Une gélule se remplit de petits granules jusqu'à la valeur |
| `pill-tumble` | État | Trois gélules font une culbute à tour de rôle pendant une attente |
| `mortar-grind` | État | Un pilon tourne dans son mortier et fait sauter quelques grains pendant l'attente |
| `pickup-code` | État | Un code de retrait s'affiche en grand, avec sa date limite et un bouton pour le copier |
| `tire-pressure` | État | Les quatre pneus montrent leur pression, et celui qui manque d'air clignote |
| `charger-status` | État | Des bornes changent d'état en direct, et le nombre de bornes libres s'écrit |
| `next-departures` | État | Un écran liste les prochains passages, et leurs minutes descendent en temps réel |
| `ride-timer` | État | Un compteur affiche le temps de trajet et son coût, en direct |
| `wheel-loader` | État | Une roue de vélo à rayons tourne pendant une attente |
| `traffic-light` | État | Un feu tricolore indique un état, écrit en toutes lettres à côté |
| `live-bus` | État | Un point suit le bus d'arrêt en arrêt, et le temps avant votre arrêt se met à jour |
| `disruption-banner` | État | Une alerte de perturbation prend la couleur et le rôle de sa gravité, et peut être fermée |
| `delivery-window` | État | Un créneau de livraison se pose sur la journée, avec un repère à l'heure actuelle |
| `fleet-dots` | État | Des véhicules circulent sur un plan, et leur état se distingue par la forme et la couleur |
| `peak-clock` | État | Une horloge de 24 heures montre les heures creuses, avec l'heure réelle et le temps avant la prochaine |
| `energy-flow` | État | Selon l'heure, des tirets circulent entre le soleil, la maison, la batterie et le réseau |
| `smart-meter` | État | Un compteur communicant affiche son index qui monte et sa puissance qui varie |
| `machine-wall` | État | Un mur de tuiles montre l'état de chaque machine et le temps passé dans cet état |
| `safety-days` | État | Un panneau affiche le nombre de jours sans accident et le record d'équipe |
| `print-layers` | État | Une pièce se construit couche après couche, avec le temps restant |
| `shift-wheel` | État | Une roue de 24 heures montre l'équipe en poste et le temps avant la relève |
| `vibration-monitor` | État | Un signal vibratoire défile, et une alerte apparaît quand il franchit le seuil |
| `moisture-grid` | État | Une grille montre l'humidité du sol par zone, et un bouton arrose les zones sèches |
| `frost-alert` | État | Une semaine de nuits repère celles sous le seuil de gel, et alerte clairement |
| `kitchen-ticket` | État | Un bon de cuisine compte le temps écoulé, et ses plats se barrent à l'envoi |
| `pickup-board` | État | Un écran montre les numéros en préparation et ceux qui sont prêts, qui arrivent en grand |
| `opening-today` | État | Les horaires de la semaine s'affichent avec aujourd'hui en avant, et l'état d'ouverture en temps réel |
| `happy-countdown` | État | Pendant le créneau d'offre, le prix baisse et un compte à rebours réel tourne |
| `chop-loader` | État | Un couteau découpe un légume en rondelles qui glissent, pendant l'attente |
| `neon-open` | État | Une enseigne néon s'allume en grésillant, et dit vraiment si l'établissement est ouvert |
| `checkin-ready` | État | Un compte à rebours et une liste préparent l'arrivée, jusqu'au message final |
| `sunset-bar` | État | L'heure réelle du coucher de soleil est calculée pour un lieu, et le temps restant s'écrit |
| `rooms-left` | État | Une façade montre les chambres encore libres, avec la date de la donnée et sans fausse urgence |
| `gate-countdown` | État | Un compte à rebours d'embarquement change d'état, jusqu'à la fermeture de la porte |
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
