# TP 4 - prise en main de la stack JS (suite)

Dans ce TP, vous allez commencer la prise en main de la stack côté client. Pour cela, vous commencerez par réaliser un client qui interroge une API, puis vous le packagerez et le transformerez progressivement.

Pour pouvoir bénéficier des outils de gestion de projet, vous réaliserez d'abord la partie programmatique de ce client en JavaScript, puis la passerez en TypeScript.

## Objectifs

Approfondir votre utilisation des outils de gestion de projet et de programmation côté client.

- Webpack
- TypeScript

## Pointeurs

Documentation et tutos :

- TypeScript :
  - [Documentation](https://www.typescriptlang.org/docs/)
  - [Mise en place d'un projet avec Babel + TS](https://github.com/microsoft/TypeScript-Babel-Starter)
  - [Utilisation avec WebPack](https://webpack.js.org/concepts/loaders/)
- Webpack :
  - [installation](https://webpack.js.org/guides/installation/)
  - [packager un projet](https://webpack.js.org/guides/getting-started/)
	- [créer et gérer des `assets`](https://webpack.js.org/guides/asset-management/)
  - [ESLint](https://eslint.org/) (rappel)
  - [Babel](https://babeljs.io/) (compilation / transpilation en JS basique)
  - [Jasmine](https://jasmine.github.io/) (tests en JS)
  - [Leaflet](https://leafletjs.com/examples/quick-start/) (carte basée sur OpenStreetMap)

## 1. Mise en place d'un bundler

Dans cette partie, vous allez initialiser un projet NPM avec la CLI de webpack.

- Créer un dossier `admin` à la racine de votre repo.
- Lancer la commande `npx create-new-webpack-app .` (voir [doc](https://github.com/webpack/webpack-cli/tree/master/packages/create-webpack-app)) pour initialiser le fichier `webpack.config.js`, ainsi que les autres fichiers de configuration du projet et une structure de base pour l'application. Au besoin, installez `create-new-webpack-app` comme proposé par npx. Répondez comme suit aux différentes questions posées par `webpack-cli` :

<img alt="Questionnaire webpack-cli" src="webpack-cli.png" width="500px">

- Observez la structure du répertoire généré, et distinguez les différents fichiers de configuration et de gestion de projet, des éléments de l'application de démonstration.
- Pour vérifier le fonctionnement de l'application de démo, lancez le serveur de dev inclus avec `npx webpack serve` : l'application générée doit démarrer automatiquement. Dans la console de dev, vous devez avoir un log du fichier `src/index.ts`
- Vérifiez le fonctionnement du _Hot Module Replacement (HMR)_ en modifiant le contenu du log du fichier index.js et en sauvegardant ce fichier ; la console doit se mettre à jour automatiquement.
- D'après le contenu du fichier `package.json`, lancez le script de build pour la production avec NPM (à vous de trouver comment). Observez le contenu du répertoire `dist` généré.

Vous êtes maintenant prêts à ajouter votre application à ce projet.

**Avant de pousser sur votre repo, n'oubliez pas de vérifier qu'un fichier `.gitignore` est positionné pour ce dossier.**

## 2. Application

Vous allez travailler sur le client de l'interface d'administration du jeu "Panique au Musée : Une Soirée en Grande Pompe sous Haute Surveillance". Pour vous faire gagner du temps, une version initiale de l'interface du client vous est donnée dans [le répertoire `admin` du projet contenant les sources](https://forge.univ-lyon1.fr/m1if13/m1if13-2025-base/-/tree/main/admin?ref_type=heads).

Commencez par télécharger ce client et en déposer une copie dans un dossier d'un serveur web (Express, nginx) permettant de servir des fichiers statiques. Requêtez chacune des deux pages HTML pour tester. Vous constaterez que ce client est en deux parties :

- une page `index.html` qui ne sera utilisée que pour le login
- une page `admin.html` qui contiendra le métier de votre application ; elle s'appuie sur :
  - une carte (CSS, script et requêtes asynchrones vers les "tuiles" qui composent la carte)
  - plusieurs autres ressources (scripts, CSS, fonts)

Les formulaires et les scripts ne sont pour l'instant pas fonctionnels. Le seul script qui fonctionne est celui qui recentre la carte à l'endroit où vous cliquez, pour que vous ayez un exemple d'utiliation de l'API de LeafLet.

Dans un premier temps, vous travaillerez avec cette version de la page `admin.html`, et vous la complèterez en fin de TP.

### 2.2. Intégration de votre projet dans webpack

Vous allez donc reprendre le client statique (`admin.html`) en recopiant les "bonnes" parties dans votre répertoire `admin` :

- Dans `admin.html`, **supprimez la balise &lt;script&gt; à la fin du fichier** (c'est webpack qui se chargera de faire l'importation).
- Modifiez le fichier `webpack.config.js`, section `plugins`/`HtmlWebpackPlugin` pour indiquer à webpack qu'il doit transformer la page `admin.html` et non ~~`index.html`~~ .
- Déplacez les fichiers HTML dans `src` pour éviter les ambiguïtés avec les fichiers générés. Recopiez également les contenus des répertoires `css` et `img` dans `src`.
- Recopiez les scripts JS dans le répertoire `src` (écrasez `index.ts`).

Si vous lancez `npx webpack serve` maintenant, la page ne trouvera pas le CSS. Pour que webpack la rajoute au bundle, vous n'avez qu'à l'importer dans `index.js` comme si c'était un module JS : `import 'css/style.css';`

- Lancez `npx webpack serve` pour vérifier que tout se passe bien
- Générez le bundle correspondant à votre projet avec la commande `npx webpack` (option par défaut : `build`). Cela vous génèrera un répertoire `dist` dans lequel vous avez l'ensemble des fichiers statiques que vous pourrez déployer sur votre serveur de production (`/api/static`).

**Aide :**

Il se peut que vous tombiez sur le problème suivant : une fois les icônes fournis avec Leaflet packagés avec webpack, ils ne sont pas retrouvés par la lib à cause d’une erreur de regexp. Il s'agit d'une issue non (correctement) résolue dans Leaflet  : https://github.com/Leaflet/Leaflet/issues/6496 . Le workaround est de rajouter dans map.js (uniquement dans la version webpack) une ligne comme :
  ```javascript
  L.Icon.Default.imagePath` = '/lib/leaflet/dist/images/';
  ```

où la partie droite permet d'accéder par une requête HTTP au répertoire contenant les icônes Leaflet.

&Agrave; la fin de cette partie, webpack a dû vous générer un répertoire `dist` contenant des fichiers statiques que vous pouvez copier dans la partie statique de votre serveur Express, afin d'exécuter l'application dans votre navigateur. Attention toutefois à ne pas écraser les fichiers de votre application source (qui doivent se trouver dans le même répertoire) en faisant cela...

## 3. Passage du projet en TypeScript

Dans cette section, vous allez passer votre client actuel en TypeScript :

- Typez les variables et les valeurs de retour des fonctions. Pour vous aider, vous pouvez utiliser un conversisseur en ligne.
- Pour pouvoir utiliser des classes issues de Leaflet, vous devrez importer ce module dans `map.ts` :<br>
  `import * as L from "leaflet";`
- Une fois cette importation faite, vous pouvez supprimer l'import du script de cette librairie dans la page HTML

Avant de lancer le build, analysez les différents fichiers de config pour comprendre ce que les différents éléments font.
Puis, lancez le build et vérifiez le fichier `dist/index.html`.


## 4. Ajout du métier de l'application

Dans cette partie, vous allez faire en sorte que votre client soit fonctionnel. Réalisez les scripts qui interagissent avec la carte et avec le serveur pour que les différentes parties de l'interface fonctionnent normalement.

_Fonctionnalités_ :

- La page de login permettra de récupérer un token pour pouvoir interroger la partie `/api` du serveur et recevoir les positions des ressources sur la carte. Vous devrez envoyer une requête asynchrone en CORS au serveur Spring et mémoriser le token avant de changer de page.
- Pour vous dérouiller côté client, vous devrez faire fonctionner le premier formulaire de la page `admin.html` : mettre à jour les différents champs quand la carte est modifiée, et déplacer / zoomer la carte quand la valeur d'un champ change. Aidez-vous de la [doc de Leaflet](https://leafletjs.com/reference.html) pour cela.
- Pour la ZRR, l'utilisateur devra positionner la carte où il veut que le jeu se tienne et cliquer sur le bouton "Set" pour définir la ZRR aux limites de la carte, puis sur "Send" pour l'envoyer au serveur. &Agrave; vous de mettre en place les scripts correspondants.
- Pour le TTL, vous pouvez suivre un fonctionnement similaire à celui utilisé pour l'envoi de la ZRR.
- Le jeu sera lancé dès le login des différents utilisateurs. Vous devrez donc envoyer régulièrement des requêtes à la partie `/api` d'Express pour pouvoir récupérer les ressources et les placer sur la carte.

_Indications techniques_ :

- Le squelette de code qui vous est fourni gère les dépendances en utilisant les modules ES6. Il vous est demandé de conserver ce mode de gestion des dépendances.
- Pour requêter l'API du serveur Express, il est conseillé d'utiliser une "variable globale" qui représentera le chemin de base de cette API et que vous pourrez modifier par la suite (voir partie déploiement) ; dans la suite, on appellera cette variable `apiPath`. Pour vous conformer à la gestion des dépendances par modules, vous pouvez soit la passer en paramètre des fonctions, soit créer un module avec cette constante dedans et l'importer là où vous en aurez besoin (conseillé).
- Pour vérifier le fonctionnement, il peut être utile d'ajouter un utilisateur (mocké) au jeu dans Spring et de le "promener" sur la carte _via_ Express à l'aide de Postman.

> &Agrave; ce stade, votre application "confidentielle" doit fonctionner correctement.

## 5. Tests

Dans cette partie, vous allez mettre en place des tests unitaires avec Jasmine. Vous testerez dans un premier temps le fonctionnement de l'API côté serveur. En bonus, vous pouvez compléter par des tests des parties du code côté client.

- Suivre les 3 premières manipulations de [ce tuto](https://jasmine.github.io/pages/getting_started.html) pour installer l'outil de test Jasmine
- Suivez [la partie _Configuration_ de ce tuto](https://jasmine.github.io/setup/nodejs.html#configuration) pour configurer Jasmine dans votre projet.
- &Eacute;crivez vos tests en vous inspirant de la [first test suite](https://jasmine.github.io/tutorials/your_first_suite) et en suivant la syntaxe indiquée dans la [doc de l'API](https://jasmine.github.io/api/edge/global).
- Normalement, vous devez déjà avoir un script nommé `test` dans votre package.json. Vous pouvez le lancer avec `npm test`.

_Aide :_ Faites en sorte que ces tests se trouvent dans des fichiers avec des noms finissant par `.spec.js` et se trouvent dans un répertoire `test`, ce sera plus simple à configurer.

Indiquez dans votre readme les types de tests réalisés.

## 6. Déploiement

Vous déploierez la page HTML et le bundle webpack généré sur un chemin `/secret` du serveur nginx. Attention, la valeur de la variable `apiPath` ne sera pas la même que pour les fichiers générés déployés directement sur Express. Le plus simple est donc de faire un deuxième fichier d'entrée webpack, et de créer une autre configuration, identique à la première au fichier d'entrée près, et lancée à l'aide d'une autre commande NPM (par exemple : `npm run build`).

**Aide** : voir [ici](https://webpack.js.org/configuration/mode/) pour une explication de comment réaliser plusieurs configurations (p. ex. dev et prod) dans le même fichier de config webpack.

Mettez en place un script de CI qui utilise cette commande et déploie automatiquement les fichiers générés dans le bon répertoire de votre VM.

&Agrave; la fin de ce TP, toute votre application doit être fonctionnelle sur votre VM, à l'exception du client des joueurs, que vous simulerez via Postman. 

## Date de rendu

Ce TP et le précédent sont à pousser sur la forge et à déployer sur votre VM pour le **dimanche 6 avril 2025 à 23h59**.
