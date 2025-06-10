# TP2 - Infrastructure

Dans ce TP, vous allez mettre en place sur votre VM l'infrastructure qui va vous permettre de déployer les différents éléments de l'application sur laquelle vous allez travailler ce semestre.

**N'oubliez pas de sauvegarder votre configuration dans votre projet forge, cela peut être très utile en cas de "plantage" de la VM.**

## Objectifs pédagogiques

- Approfondir ses compétences DevOps
- Sécuriser un serveur Tomcat
- Mettre en place une infrastructure d'authentification distribuée

## Présentation de l'infrastructure

Cette infrastructure est bâtie sur celle que vous avez construite en M1IF03 mais elle est plus complexe :

- Le serveur Tomcat ne sera plus "derrière" le proxy nginx, mais exposera "séparément" son API d'authentification et de validation des tokens JWT
- Comme nginx est toujours accédé en HTTPS, il faut donc que Tomcat le soit aussi ; vous allez donc devoir sécuriser aussi ce serveur
- Vous utiliserez un nouveau serveur en JS : Express, qui exposera l'API du jeu
- Vous devrez installer un "process" manager pour permettre à Express de fonctionner quand l'utilisateur est déconnecté

![Infrastructure matérielle M1IF13](../archi.png)

## 1. Sécurisation à l'aide d'un certificat externe

Comme au premier semestre, nous avons généré pour votre VM une clé privée, un certificat signé par une autorité intermédiaire `m1if-ca` et la chaîne de certification le reliant à l'autorité racine `root-ca`. Ces fichiers sont déjà correctement positionnés sur votre VM, avec les droits requis (voir [partie correspondante du TP de M1IF03](https://perso.univ-lyon1.fr/lionel.medini/enseignement/#md=M1IF03/TP/md/TP3&p=21-s%C3%A9curisation-du-serveur). 

> Ce certificat été attribué à votre VM en fonction d'un nom de serveur, c'est-à-dire 192.168.75.XXX. Il est valide quel que soit le port du serveur, et pourra être utilisé à la fois par nginx et par Tomcat.

### 1.0. Sécurisation d'nginx

Pour vous faire gagner du temps, le travail de sécurisation du serveur nginx a déjà été réalisé. Cela signifie que ce certificat est déjà installé sur la VM et qu'nginx est configuré pour l'utiliser.

Vous n'avez rien à faire pour passer nginx en HTTPS. **Pour vérifier, vous devez pouvoir requêter directement l'IP de votre VM**, et être redirigé vers la page d'accueil d'nginx, qui sera récupérée en HTTPS (si vous avez toujours le certificat racine `root-ca` installé sur votre client).

_Remarque :_ à la première connexion, il est possible que vous receviez une erreur de certificat dûe à un problème de synchronisation de l'horloge interne de la VM. Dans ce cas, actualisez simplement la page, et cette erreur devrait disparaître.

### 1.1. Sécurisation de Tomcat

Comme en M1IF03, Tomcat est installé, pré-configuré, et lancé en tant que service. Il doit être accessible directement par le port 8080 de votre VM.

_Rappel :_ vous pouvez notamment accéder à l'application manager avec les credentials que vous trouverez dans `/opt/tomcat/conf/tomcat-users.xml`.

Dans cette UE, vous devrez utiliser Tomcat en HTTPS car il sera accédé directement par les différents clients de votre application, qui seront eux servis en HTTPS par nginx (et il est interdit de "downgrader" une connexion, c'est-à-dire d'envoyer des requêtes asynchrones à un serveur en HTTP depuis un script dont l'origine est en HTTPS). Pour cela, nous avons commencé pour vous le travail de configuration (voir la [page de configuration SSL/TLS de Tomcat](https://tomcat.apache.org/tomcat-11.0-doc/ssl-howto.html)) :

- Tomcat est déjà configuré pour fonctionner en HTTPS sur le port 8443, mais avec un certificat auto-signé (votre navigateur va crier, mais si vous lui dites d'accepter ce certificat, vous pourrez accéder au site).
- Pour utiliser un certificat fourni par une autre autorité à travers la bibliothèque OpenSSL, il faut "faire le pont" entre le monde Java de Tomcat, et la bibliothèque OpenSSL, écrite en C et installée localement sur la VM. Cela a été fait pour vous, mais pour mémoire, ce fonctionnement nécessite d'installer la bibliothèque [Apache Portable Runtime (APR)](https://apr.apache.org/), à l'aide de cette [doc](https://tomcat.apache.org/tomcat-11.0-doc/apr.html).

Dans les deux cas, Tomcat place ses certificats dans un "keystore". Nous en avons créé un qui contient le certificat auto-généré, et qui se trouve dans le fichier `/opt/tomcat/conf/.keystore`. 
 Pour remplacer ce certificat généré "à la mode Java" par un certificat "propre" généré avec `openssl`, il vous reste plusieurs manipulations à réaliser :

- sauvegarder l'ancien keystore (au cas où) :<br> `sudo mv /opt/tomcat/conf/.keystore /opt/tomcat/conf/.keystore.backup`
- utiliser openssl pour générer un nouveau keystore à partir du matériel cryptographique spécifique à votre VM :<br>
`sudo openssl pkcs12 -export -in /etc/ssl/certs/server.cert -inkey /etc/ssl/private/server.key -out /opt/tomcat/conf/.keystore -name 192.168.75.XXX -CAfile /etc/ssl/certs/server-chain.cert -caname m1if-ca -chain`<br>
Remarque : il vous sera demandé un password que Tomcat devra connaître pour s'y connecter ; vous pouvez soit remettre celui qui est déjà dans le fichier `/opt/tomcat/conf/server.xml`, soit en choisir un autre et modifier ce fichier pour le mettre à jour.
- modifier les droits et les propriétaires du nouveau fichier pour que Tomcat puisse y accéder : `sudo chmod 600 /opt/tomcat/conf/.keystore` et `sudo chown tomcat:tomcat /opt/tomcat/conf/.keystore`
- modifier le fichier `server.xml` dans le répertoire `conf` de Tomcat :
  - repérez l'élément `Connector` sur le port 8443 actuellement actif, et commentez-le
  - décommentez l'autre élément `Connector` sur le même port, et possédant une implémentation de type `OpenSSLImplementation`
- redémarrer le service tomcat

Cela fait, testez (à l'aide de l'application manager) le déploiement du war de votre projet Spring et vérifiez que vous y accédez à l'URL : https://192.168.75.XXX:8443/users/

## 2. Lancement d'une application sous Express

Node et NPM sont pré-installés sur votre VM. Vous pouvez commencer à préparer l'infrastructure pour le serveur de l'API que vous allez réaliser aux prochains TPs. Pour cela :

- créez un nouveau sous-répertoire de `/tmp` et placez-vous dedans
- initialisez un projet NPM nommé "game-express" (node et NPM sont déjà installés) : `npm init`
- ajoutez une dépendance vers le serveur Express : `npm install express`
- lancez l'application de base située [ici](https://expressjs.com/fr/starter/hello-world.html) sur le port 3376
- vérifiez que vous pouvez accéder à votre serveur Express à l'URL : http://192.168.75.xxx:3376
- nginx est déjà configuré en proxy HTTPS pour Express ; vérifiez que vous y accédez aussi à l'URL : https://192.168.75.xxx/api/
- arrêtez cette application

Forcément, une fois que vous arrêtez l'application, ou que vous vous déconnectez de votre VM, le serveur Express s'arrête également, et vous ne pouvez plus accéder à l'application. Comme Express fait partie des dépendances de l'application, vous ne pouvez pas lancer le serveur en tant que service, comme c'est le cas pour nginx et pour Tomcat.

Pour résoudre ce problème, vous allez utiliser [PM2](https://pm2.keymetrics.io/), un "process manager", qui permet notamment de garder un processus actif sur une machine :

- installez PM2 en global (n'oubliez pas le `sudo` qui n'est pas dans la doc)
- lancez votre application
- déconnectez-vous de votre VM
- retestez
- reconnectez-vous
- utilisez la doc de PM2 pour arrêter et supprimer votre application du gestionnaire de processus

## 3. Déploiement continu et tests de l'infrastructure

Dans cette partie, vous allez vérifier que tous les éléments de votre infrastructure fonctionnent et surtout, qu'ils peuvent fonctionner ensemble.

Le scénario que vous allez mettre en place est le suivant : un client HTML en SPA et servi directement par nginx se logue sur le serveur d'authentification Spring, récupère un token, puis transmet ce token à une application Express, qui va de son côté le valider auprès de Spring.

Pour cela :

### 3.1. CI/CD

Commencez par déployer votre application Spring sur le contexte "users" du Tomcat de votre VM. Tant qu'à faire, mettez en place un script de CI/CD, comme vous l'avez fait en M1IF01 et M1IF03, qui le fait automatiquement.

**Attention : bug dans le code du filtre d'authentification du projet Spring**. Désolé... Remplacer la ligne :<br>
`String url = request.getRequestURI().replace(request.getContextPath(), "");` par<br>
`String url = request.getRequestURI().replaceFirst(request.getContextPath(), "");`<br>
sans quoi la route `/users` sera ignorée par le filtre si elle est déployée sur le contexte `/users` du serveur Tomcat.

### 3.2. Test de l'API Express

Initialisez un nouveau projet Node + Express. Rajoutez-y des dépendances vers [Axios](https://www.npmjs.com/package/axios) et  [jwt-decode](https://www.npmjs.com/package/jwt-decode).

Créez un serveur Express, avec une route qui reçoit une requête simple (GET) sans paramètre et qui :

- récupère les headers `Authorization` et `origin`
- valide le token JWT en fonction de l'origine de la requête (ou de l'origine par défaut du serveur Express...)
- si la validation renvoie un code 204 (No Content), lit le contenu du token (avec jwt-decode), et renvoie "Bonjour" + l'identifiant de l'utilisateur contenu dans le token
- sinon, renvoie le même code d'erreur que la validation

Déployez ce code sur votre VM dans un sous-répertoire de `/opt/express` et démarrez le serveur avec PM2.

_Remarque :_ le répertoire `/opt/express` est destiné à ce que votre CI déploie dans ce répertoire avec l'utilisateur `gitlabci`, mais il est la propriété de l'utilisateur `root`. C'est dû au fait que le répertoire a été créé avant la création de l'utilisateur. Vous devrez donc faire un `chown` pour que `gitlabci` puisse écrire dans ce dossier.

### 3.3. Client SPA

Créez un fichier HTML avec un formulaire d'authentification, et les scripts nécessaires pour :

- envoyer le contenu du formulaire en JSON à l'application Spring déployée sur votre serveur Tomcat
- si l'authentification a réussi, récupérer le token dans le header `Authorization`, le mémoriser dans une variable et afficher un bouton "continuer"
- lorsque l'utilisateur clique sur "continuer", renvoyer le token dans un header `Authorization` une autre requête asynchrone à l'API Express
- si le serveur Express renvoie un contenu, l'afficher sur la page

Déployez ce code dans le répertoire `/usr/share/nginx/html` pour qu'il soit servi directement par nginx. Testez.

Une fois le code fonctionnel, modifiez-le pour traiter les éventuelles erreurs (notamment d'authentification, mais aussi d'indisponibilité d'un des deux serveurs).

Testez en modifiant le token, et en déconnectant l'utilisateur avant d'appuyer sur "continuer".