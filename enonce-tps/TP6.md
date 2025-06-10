# TP 6 - Framework côté client (suite)

## Objectifs

- Maîtriser la logique réactive des frameworks JS modernes
- Mettre en place un _State Management Pattern_ centralisé pour un framework en JS

## Pointeurs

- [Pinia](https://pinia.vuejs.org/) : le "store" de Vue
  - [installation](https://pinia.vuejs.org/getting-started.html) (si Pinia n'a pas été mis en place par Vite)
  - [principes](https://pinia.vuejs.org/introduction.html)
  - [exemple de code](https://stackblitz.com/edit/vite-vue3-pinia-ex?file=package.json)
- [Vite (JS)](https://vitejs.dev/)
- [Vue.js devtools](https://github.com/vuejs/vue-devtools)

## 0. Préambule

Dans ce TP, vous poursuivrez la réalisation du client pour la partie publique du jeu. Cet énoncé part du principe que :

- la gestion des utilisateurs est disponible en HTTPS
- l'API publique du jeu côté serveur fonctionne, et qu'elle est déployée en HTTPS via le serveur nginx sur la route `/api/game`
- l'interface "confidentielle" (d'administration) fonctionne également pour pouvoir configurer le jeu ; elle ne sera pas utilisée dans ce TP mais vous en aurez besoin pour tester.
- Le client pour la partie publique du jeu est réalisé (avec un métier fonctionnel et des données mockées) et contient [vos premiers composants et votre routeur VueJS](../tp5/).

## 1. Mise en place du store Pinia

Dans ce TP, vous allez modifier la façon dont Vue accède aux données du jeu, en appliquant le State Management pattern. Pour cela, Pinia fournit un espace centralisé pour gérer l'état des composants de votre application, et ainsi faciliter leur partage. **Le store mis en place dans cette partie s'intéressera uniquement à la gestion des données géolocalisées** (et non aux propriétés du joueur)

Si vous avez suivi les instructions du TP précédent, Pinia devrait déjà être installé (dans les dépendances du `package.json`) et utilisé dans votre projet (un store nommé `counter.js`) existe déjà.

Si ce n'est pas le cas, suivez les instructions [ici](https://pinia.vuejs.org/getting-started.html) pour le mettre en place.

### 1.1. &Eacute;tats

Globalement, l'idée est de conserver la structure des données mockées (l'ensemble des données géolocalisées, cf. TPs précédents) que vous avez déjà, et de définir un `state` équivalent. Pour cela, vous pouvez vous aider de la doc [ici](https://pinia.vuejs.org/core-concepts/state.html).

### 1.2. Getters

Pour rendre Vue réactif aux changements de propriétés des états, il peut être utile de fournir à l'application une valeur dérivée à partir d'une ces propriétés. Par exemple :

- la distance entre un joueur et une vitrine,
- le TTL d'une vitrine ouverte à partir du dernier TTL envoyé par le serveur : si vous faites une requête toutes les 5 secondes, cela permettra de faire décroître le TTL dans l'interface entre 2 réponses du serveur.

On utilise pour cela [des getters](https://pinia.vuejs.org/core-concepts/getters.html), que vous pouvez définir dans le store avec la propriété `getters:`. Ensuite, il suffit de les importer dans les composants pour pouvoir les utiliser.

**Remarque :** Ne créez des getters que si vous en ressentez le besoin. Ce n'est pas obligatoire.

### 1.3. Actions

Les actions sont les fonctions appelées dans votre application pour effectuer les mutations. Elles suivent les principes de C(R)UD: ajout, suppression, modification. Il ne s'agit que de mutations alors pas de nécessité d'avoir la lecture (read -> getter), vue se chargera de diffuser les changements d'état aux composants.

- Commencez par identifier dans le TP précédent l'ensemble des fonctions de mutation des données, à partir de la liste des actions à réaliser dans votre application, voir la [section sur les fonctionnalités](#2-fonctionnalités-à-réaliser) ci-dessous.
- Placez ces fonctions dans votre store, comme indiqué [ici](https://pinia.vuejs.org/core-concepts/actions.html).
- Importez ces fonctions dans les composants, de façon à pouvoir les utiliser, soit dans les scripts (par exemple comme callbacks des requêtes asynchrones), soit directement de manière déclarative dans les templates.

### 2. Fonctionnalités à réaliser

Faites en sorte qu'une fois l'utilisateur logué, l'application requête le serveur Express toutes les 5 secondes pour obtenir les informations sur les différentes ressources géolocalisées. Remplacez les données mockées par ces données.

Stockez dans le store :

  - la limite de la ZRR (si implémentée)
  - les ressources géolocalisées
  - les informations de base des joueurs : identifiant, espèce, nombre de trésors récupérés / vitrines refermées
  - les TTL des vitrines ouvertes (quand approprié)

Faites en sorte que côté client, les joueurs voient les TTLs des vitrines ouvertes décroître régulièrement entre 2 requêtes au serveur.

Sur la carte, faites apparaître :

- le joueur courant et les joueurs de la même espèce avec leurs images
- des markers sur les vitrines ouvertes, contenant la distance par rapport à l'utilisateur courant et leurs TTL

Lorsque l'utilisateur courant a atteint une vitrine ouverte :
- envoyez une requête au serveur pour l'informer de l'action réalisée sur la vitrine (pillage / fermeture)
- à la réception de la réponse, faites en sorte que l'interface affiche un nouveau composant textuel par-dessus la carte, en le félicitant et indiquant son score
