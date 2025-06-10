# TP 3 - JavaScript côté serveur

## Objectifs

Comprendre le rôle et utiliser quelques outils de gestion de projet pour mettre en place un serveur en JS

  - Node : plateforme d'exécution JS
  - NPM : gestion de dépendances
  - Express : serveur Web

## Pointeurs

Documentation et tutos :

  - NPM :
    - [Documentation](https://docs.npmjs.com/)
    - [CLI](https://docs.npmjs.com/cli/v10/commands)
  - Node :
    - [Guides et tutos](https://nodejs.org/en/docs/guides/)
    - [Documentation de l'API](https://nodejs.org/docs/latest-v20.x/api/) (V. 20 LTS)
  - [Express](https://expressjs.com/) :
    - [lancer un serveur](https://expressjs.com/en/starter/hello-world.html)
    - [servir des fichiers statiques](https://expressjs.com/en/starter/static-files.html)
    - [Routage (répondre à des URLs spécifiques)](https://expressjs.com/en/guide/routing.html)
    - [Traiter des données de formulaire](https://www.npmjs.com/package/body-parser)
  - ESLint :
    - [installation](https://eslint.org/docs/user-guide/getting-started)
    - [configuration](https://eslint.org/docs/user-guide/getting-started#configuration)
    - [règles](https://eslint.org/docs/rules/)
 
## Description de l'application

Dans ce TP et les suivants, vous allez travailler sur une application que vous transformerez progressivement en un jeu Web mobile, multi-joueurs, où les utilisateurs seront géolocalisés et utiliseront une visualisation cartographique. Vous trouverez à la racine de ce projet le [pitch de ce jeu](../pitch.md).

Ce TP sera consacré à la mise en place de l'API côté serveur du jeu. &Agrave; la fin de ce TP :
- les joueurs devront pouvoir :
  - accéder aux informations sur les ressources exposées par le serveur :
    - coordonnées de la ZRR
    - coordonnées et TTL des vitrines qu'ils ont "traitées" (pillées pour les bandits, fermées pour les policiers)
    - positions courantes des joueurs **de leur espèce**
  - remonter au serveur les informations les concernant :
    - indiquer leur position
    - déclarer qu'ils ont traité (pillé/fermé) une vitrine
- un administrateur pourra en plus :
  - spécifier les limites de la ZRR
  - définir le TTL initial
  - définir à quelle espèce appartient chaque joueur
  - déclencher l'apparition d'une vitrine
  - accéder aux informations remontées par tous les joueurs

Lorsqu'un joueur déclare avoir traité une vitrine, c'est la responsabilité du serveur de vérifier que ses coordonnées sont suffisamment proches (moins de 5m) de celles de la ressource concernée avant de valider la requête.

Pour qu'un joueur puisse traiter une vitrine, c'est la responsabilité du serveur de calculer son TTL en le remettant à jour à chaque requête d'accès à ces ressources. Il en informe le client dans les réponses aux requêtes asynchrones. Il arrête de le faire une fois que le TTL d'une vitrine est à 0.

Vous pouvez réaliser la partie sur la ZRR en dernier. Elle fait partie du barème (donc vous n'aurez pas 20 si vous ne la faites pas), mais le projet fonctionnera même si vous ne mettez pas la ZRR en place.

## Travail à réaliser

### 1. Mise en place du projet

&Agrave; partir de ce TP, il est conseillé de travailler dans une branche bien identifiée (par exemple, "TP3"). Cela vous permettra de mettre en place des scripts de CI spécifiques et de gagner du temps au déploiement de votre application sur votre VM.

#### 1.0. Fichiers à ignorer /!\ important

&Agrave; l'aide de [ce template](https://github.com/github/gitignore/blob/master/Node.gitignore), complétez le fichier `.gitignore` de votre dépôt avec les noms de fichiers et répertoires à ignorer pour votre projet (_a minima_ le répertoire `node_modules` et les fichiers de votre IDE).

**Avant de pusher sur la forge, vérifiez bien que le répertoire node_module n'est pas inclus dans votre `git status`.**

#### 1.1. Initialisation du projet

- Créez un dossier `api` à la racine de votre dépôt de code.
- Dans ce dossier, créez un projet NPM à l'aide de la commande `npm init` (aide : [référence sur le site de NPM](https://docs.npmjs.com/creating-a-package-json-file#running-a-cli-questionnaire))<br>
  Attention : utilisez la commande `npm init` sans l'option `--yes` pour pouvoir entrer autre chose que les valeurs par défaut.

> Comme indiqué en cours, il existe plusieurs systèmes de gestion de dépendances. **Vous allez spécifier que vous choisissez d'utiliser les modules ES6.** Pour cela, éditez le fichier `package.json` et rajoutez-y une propriété `"type": "module"` (n'oubliez pas la virgule à la ligne précédente).

#### 1.2. Types de dépendances

- Récupérez et ajoutez à votre nouveau projet celui réalisé au TP2, qui contient le début d'application Express. Logiquement, il contient Express, Axios et jwt-decode en dépendances simples (dans l'objet `dependencies` de votre `package.json`).

Vous utiliserez aussi [ESLint](https://eslint.org/) pour valider syntaxiquement votre code (comme CheckStyle en Java).

> Avec NPM, il existe plusieurs sortes de dépendances, et notamment les dépendances "normales", qui seront téléchargées par les utilisateurs de votre projet, et les "devDependencies", qui ne sont nécessaires que pour builder, tester, etc.

- Installez ESLint en dépendance de dev (`npm init --save-dev @eslint/config`), et configurez-le avec les options par défaut, sauf :
  - `Which framework does your project use?` -> `None of these`
  - `Where does your code run?` -> `Node`
  - `What format do you want your config file to be in?` -> `JSON`
- Testez que votre application démarre correctement.

> L'ensemble des dépendances est installé dans le dossier `node_modules`. Vous pouvez ouvrir ce dossier pour voir ce qu'il contient... et comprendre pourquoi il ne faut pas le pousser sur la forge ;-).

#### 1.3. Scripts de lancement

- Ajoutez au fichier `package.json` un script nommé `start` permettant de démarrer le serveur en tapant simplement `npm start` (voir [cette page](https://docs.npmjs.com/cli/v10/using-npm/scripts))
- Testez à nouveau avec ce script
- Ajoutez un script `prestart` qui validera le code avec ESLint. Ce script sera automatiquement exécuté avant `start` (cf. [Life Cycle Operation Order](https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-operation-order) de NPM).
- Dans le fichier `.eslintrc.json` généré, rajoutez _a minima_ une [règle](https://eslint.org/docs/rules/) pour spécifier que l'indentation doit être réalisée avec des tabulations.
- Testez à nouveau `npm start`. Dites à ESLint de se débrouiller pour corriger l'indentation automatiquement. Il vous reste une erreur à corriger vous-même : passer du système de gestion de dépendances CommonJS à celui des modules ES6...
- Corrigez et retestez.

### 2. Partie serveur

#### 2.1. Serveur de fichiers statiques

- Faites en sorte que votre serveur Express réponde aux requêtes sur `/static` en servant directement les fichiers situés dans le répertoire `public`.
- Créez une page d'accueil HTML basique, et placez-la dans le répertoire `public` pour tester que vous pouvez la requêter avec votre serveur Express.
- Redirigez la requête à la racine du serveur vers cette page d'accueil
- Ajoutez un [middleware de gestion des erreurs 404](http://expressjs.com/en/starter/faq.html#how-do-i-handle-404-responses)
- Testez

> Cette partie ne sera pas utilisée dans la version finale de votre application (où les fichiers statiques seront servis par nginx), mais est destinée à faciliter les tests en local sur votre machine.

#### 2.2. Contenus dynamiques

Dans cette partie, vous mettrez en place l'API côté serveur qui va gérer les ressources géolocalisées : les utilisateurs et autres éléments placés par le serveur.

Voici les différents types de ressources gérées par le serveur (fournis à titre indicatif) :

```
ressource géolocalisée
|__id
|__position
|__role courant
   |__voleur
   |  |__nombre de vitrines traitées
   |__policier
   |  |__nombre de vitrines traitées
   |__vitrine
      |__TTL
ZRR
|__limite-NO
|__limite-NE
|__limite-SE
|__limite-SO
```

Vous allez mettre en place 2 parties de votre application capables de [servir des contenus dynamiques](http://expressjs.com/en/starter/basic-routing.html), une pour gérer le fonctionnement du jeu, et une autre pour l'interface d'administration.

Une première partie de l'API du serveur est donnée dans le fichier [`express-api.yaml`](./express-api.yaml). Vous pouvez vous aider d'outils de génération automatiques pour générer le squelette de votre code, et de Postman pour tester les requêtes.

Pour chacune de ces 2 parties de l'application, vous créerez un middleware spécifique, à l'aide de la classe [`express.Router`](http://expressjs.com/en/guide/routing.html#express-router), et l'associerez à une route spécifique (voir partie Déploiement). Vous placerez le code de ces routes dans un sous-répertoire `routes`.
Les routeurs seront placés dans des modules JS séparés, et importés par l'application Express principale.

##### 2.2.1. Gestion du fonctionnement du jeu

Créez un premier routeur qui répondra aux requêtes sur l'URL de base `/game`. 5 requêtes sont à implémenter dans ce routeur :

- Mise à jour de la position du joueur : le format utilisé pour les positions est un tableau de deux décimaux tel que défini par l'API de cartographie qui sera utilisée par les clients. Exemple : `[45.781987907026334, 4.865596890449525]`.
- Récupération de la liste des ressources géolocalisées à afficher : renvoie le tableau de toutes les ressources  pour lesquelles le serveur dispose d'informations de géolocalisation, avec les attributs de chaque ressource, **sauf les joueurs de l'espèce opposée**. Cela comprend les joueurs qui ont indiqué leurs positions (et pas les autres, ni l'administrateur), les vitrines non traitées. Toutes les ressources ont un ID (login pour un user, string pour les autres), une position, plus d'autres attributs, dépendants du "rôle" (pour ne pas dire "type") de cette ressource.
- Traitement d'une vitrine : ne pourra être validé que si l'utilisateur est suffisamment proche (moins de 5m) de celle-ci. &Agrave; partir du moment où la vitrine apparaît, son TTL commence à décroître.
- Capture d'un voleur (uniquement pour un policier) : de même, les deux joueurs doivent se trouver à moins de 5m l'un de l'autre. Remarque : vous pouvez implémenter cette requête et la précédente dans la même route.
- Récupération des limites de la ZRR : si elle a été définie par l'administrateur (voir plus bas)

&Agrave; la réception de chaque requête, le serveur devra valider l'identité de l'utilisateur avec le serveur Spring (_cf._ [TP2](../tp2/README.md#2-lancement-dune-application-sous-express)) :

Remarque : **Il est conseillé de n'implémenter la validation des tokens qu'une une fois que toutes les requêtes de la partie "game" fonctionnent**. Vous allez gagner beaucoup de temps si vous n'avez pas besoin de générer un token pour tester chaque requête. Au départ, il est donc préférable de mettre en place un "faux test de validation" qui réussit toujours, puis de le remplacer par une validation _via_ Tomcat fonctionnelle.

##### 2.2.2. Interface d'administration

Créez un second routeur qui répondra aux requêtes sur l'URL de base `/admin`. 4 requêtes sont à implémenter dans ce second routeur :

- fixer le périmètre de jeu (ZRR), par exemple, en spécifiant 2 points, et en choisissant un rectangle dont ces points sont les coins
- préciser le TTL initial (valeur par défaut : 1 minute)
- spécifier l'espèce d'un joueur (voleur ou policier, mais pas admin)
- déclencher l'apparition d'une vitrine

Remarque : l'utilisateur administrateur devra de toutes façons être authentifié pour pouvoir visualiser la position des ressources _via_ les requêtes GET de la partie précédente (il en aura besoin au TP4). Il donc est conseillé de valider également son authentification et de limiter l'accès des 3 requêtes ci-dessus aux utilisateurs ayant le rôle d'administrateur. 

**Indication** : plus de détails sur l'implémentation du client de cette interface seront donnés au [TP4](../tp4/README.md)

### 3. Déploiement

Comme au TP2, vous allez déployer votre application sur votre VM : créez un script de CI spécifique à la branche sur laquelle vous travaillez, qui :

- recopie vos fichiers dans `/opt/express`,
- exécute les commandes NPM pour télécharger les dépendances et vérifier la syntaxe avec ESLint,
- lance l'application avec PM2.

&Agrave; la fin du TP, n'oubliez pas de merger sur main et de tagguer votre commit.

**Date de rendu : dimanche 16 mars 2025 à 23h59.**