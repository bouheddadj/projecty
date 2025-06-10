# Panique au Musée : Une Soirée en Grande Pompe sous Haute Surveillance

<img alt="La grande soirée d'inauguration du musée ZRR approche..." src="img/musee.jpg" style="width: 100%">

Un nouveau musée vient d’ouvrir en ville. Le "Zénith Royal des Richesses" est un musée d'art
prestigieux où sont exposés des œuvres inestimables et des trésors historiques. Ce musée, avec son
architecture majestueuse et ses collections exceptionnelles ouvre bientôt. La soirée d’inauguration
approche et elle fait couler de l’encre dans la presse...

## Grande inauguration du Musée ZRR

En ce jour mémorable, le tout nouveau musée d'art Zénith Royal des Richesses (ZRR)
ouvre ses portes avec une soirée d'inauguration qui promet de marquer les esprits.
Placée sous le signe de la Belle Époque, cette réception fastueuse accueillera une pléiade
d'invités prestigieux, dignes des magnifiques bijoux, diamants et pierres précieuses
exposés dans la somptueuse salle baptisée "La Chambre des Éclats Éternels".

Les trésors inestimables présentés ne manqueront pas d'attirer l'attention du célèbre
Arsène Lupin, dont la réputation de gentleman-cambrioleur n'est plus à faire. La
présence de ce maître du déguisement et de l'évasion est redoutée, mais les forces de
l'ordre, sur leur trente-et-un, sont déterminées à le capturer. Cette tension palpable
ajoute une dimension particulière à cette soirée exceptionnelle, où chaque invité se
demandera si le mystérieux Lupin ne se cache pas parmi eux.

Les préparatifs pour la grande soirée d’ouverture vont donc bon train.

<img alt="Arsène Lupin au musée ZRR" src="img/lupin2.png" style="width: 40%; float:right;">

Arsène Lupin travaille jour et nuit sur le déguisement qu’il portera pour se fondre incognito dans la
foule des invités et sur un plan pour mettre la main sur les trésors du musée. Vu la présence des
forces de l’ordre attendue en nombre, Arsène est bien conscient qu’il ne pourra pas agir seul cette
fois. Il recrute donc des acolytes volontaires qui se glisseront dans la foule des invités. Pour faciliter
leurs actions pendant la soirée, il commande à un complice digne de confiance, Lorenzo Menicci, une
application web pour avoir accès au système de verrouillage des vitrines du musée. Ayant toute
confiance en son complice, c’est aussi lui qui utilisera l’application pour ouvrir les vitrines à voler le
jour J, pendant que les acolytes verront les vitrines ouvertes directement sur leurs téléphones et n'auront qu'à se servir.

Ce qu’Arsène ne sait pas, c’est que son complice s’est aussi fait approcher par les forces de l’ordre :
c’est un agent-double ! En effet des agents seront en poste au musée le soir-là. Outre les gardes du
musée, certains agents sécuriseront la zone devant le musée et d’autres volontaires seront en tenue
d’époque, mêlés parmi les invités, à l’affut de la moindre trace du gentleman-cambrioleur. Ces
agents devront eux aussi voir les vitrines ouvertes et les acolytes pour essayer de les appréhender.

## Policiers et voleurs équipés des dernières technologies

Devant agir en toute discrétion, le complice missionne un groupe d’ingénieux inventeurs et dans
laquelle vous vous trouvez, et c’est ainsi que vous vous êtes retrouvé.e chargé.e de développer cette
application en trois parties :

1. La première chose dont le complice a voulu s’assurer est que l’application ne soit accessible
que par les cambrioleurs et les policiers (pas question que des invités respectables se
retrouvent au milieu de ces histoires !). Il a donc indiqué dès le début qu’elle s’appuierait sur
un serveur d’authentification, et qu’il gèrera lui-même (et à sa manière) les utilisateurs ayant accès à
l’application. En fait, pris de remord par rapport à sa trahison, il a décidé de compliquer la vie des forces de l’ordre en permettant à tous les utilisateurs d’être tantôt cambrioleur tantôt policier...

2. Tout d'abord, il faut une interface spécifique pour permettre à Menicci d'indiquer la position des vitrines déverrouillées. 
Celui-ci s’est en secret extorqué d'autres fonctionnalités lui permettant, pour son plus grand amusement, de surveiller l’activité des différents utilisateurs dans le musée ZRR en train de courir à travers les salles vers les vitrines pour les voler ou les refermer.
Et considérant que tout policier peut être attiré par le luxe des diamants et que tout cambrioleur peut être tenté de rentrer dans le droit chemin, Menicci s'autorise à participer à la confusion générale : à chaque nouvelle vitrine ouverte, les cartes seront rebattues et les joueurs pourront au hasard être désignés Acolyte ou Policier. Leur avatar sur la carte sera alors changé, leur mission s’affichera clairement sur l’application et ils devront suivre leur nouvelle mission (piller la vitrine ou aller fermer la vitrine).

<img alt="La police cherche activement Arsène Lupin" src="img/policier.jpg" style="width: 40%; float:left; padding-right: 20px;">

3. Fidèle à la demande d’Arsène Lupin, il faut une interface que les acolytes pourront consulter sur leur téléphone, capable de leur indiquer la position des vitrines ouvertes, et tant qu'à faire de les géolocaliser. 
Les acolytes ne le savent pas encore, mais cette application ne leur donnera pas l’avantage décisif escompté sur les policiers : ceux-ci verront comme eux en temps réel les vitrines ouvertes par le complice. 
Lorsque le complice fait ouvrir une vitrine, cette interface indique aux policiers le Temps de Traque Limité (TTL) pendant lequel ils pourront se déplacer jusqu’à la vitrine pour aller la refermer et protéger les trésors. Chose étrange, on s'est aperçu que ce
TTL était le même que le Temps de Trafic Libre (TTL) dont disposent les acolytes afin de se déplacer vers la vitrine pour la piller de ses trésors. Une fois qu’une vitrine est fermée ou pillée elle disparaît de la carte.

4. ... Mais ne brûlons pas les étapes ! Vous avez assez vite réalisé que les parties 2 et 3 sont en fait deux clients d'une même Web API responsable de gérer les données de l'application, et s'appuyant le serveur d'authentification de la partie 1. Vous réaliserez donc cette API avant de réaliser les clients.

------

Au final, vous avez décidé de découper votre travail de la façon suivante :

### Serveur d'authentification (TP 1 & 2)

- Gestion (CRUD) des utilisateurs, y compris changement d’espèce
- Login / logout (par JWT), potentiellement depuis un client en CORS
- Validation de token (avec renvoi du déguisement), en back office pour l'API du jeu
- Mise en place de l'infrastructure de déploiement (VM, CI/CD...)

### API (TP 3 & 4)

Afin d’aider tout ce petit monde à mener à bien leurs missions, vous développerez une API
fournissant les fonctionnalités suivantes, dont certaines seront limitées à l’éminent complice :

- Fixer les limites du musée ZRR réservée au complice
- Visualiser les limites du musée ZRR
- Fixer le TTL des vitrines (suite aux premiers tests, il est apparu que Menicci s'ennuie vite et qu'il fallait dynamiser l'application pour le distraire un peu) réservée au complice
- Inscrire les individus (acolytes ou policiers) autorisés à utiliser l'application réservée au
complice
- Surveiller leurs positions et accéder aux historiques de leurs actions (nombre de vitrines
pillées et nombre de vitrines refermées) réservée au complice
- Visualiser sa propre position et celle des joueurs de son espèce, et accéder aux historiques de
ses propres actions
- Indiquer la localisation d'une nouvelle vitrine ouverte (non pillée) réservée au complice
- Visualiser les points d'apparition des vitrines ouvertes, avec leurs statuts (pillée ou non)
- TTL quand un joueur a pillé une vitrine et court après les joueurs d'un autre type ou court
pour s’échapper

### Clients Web (TP 4 -> 8)

**Partie Complice**

À partir d'un squelette fourni, vous réaliserez un premier client de votre API pour valider ses
principales fonctionnalités, et fournir à Menicci de quoi occuper les acolytes et les policiers dans le
musée ZRR.

**Partie Joueurs**

Vous réaliserez enfin l'interface web des acolytes et des policiers, en vous appuyant sur des
technologies web avancées, pour que tout ce petit monde ait plus de facilité à se courir après - ce
qui, apparemment, donne un but à son existence.