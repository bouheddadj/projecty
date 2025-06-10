# TP1 - Spring "avancé"

Dans ce TP, vous allez utiliser le framework Spring pour générer une API qui permettra de gérer les utilisateurs de votre application. Cette API sera entièrement séparée de celle qui gèrera le jeu.

Nous vous fournissons une implémentation de base de cette API, presque fonctionnelle, codée en Spring MVC, dans le projet [M1IF13-2025-base](https://forge.univ-lyon1.fr/m1if13/m1if13-2025-base). L'objectif de ce TP est de la compléter et d'utiliser différents projets Spring et bibliothèques Java pour l'améliorer.

**Forkez ce projet dans un nouveau projet que vous complèterez tout au long de l'UE.**

Rappel : n'oubliez pas de rajouter Lionel Médini comme reporter de votre projet.

## 1. Prise en main de l'API de base

Vous trouverez le code de base du TP1 dans le répertoire `users` (et le laisserez dans ce répertoire).

Cette API s'appuie sur 2 contrôleurs :

- un contrôleur REST qui permet de gérer les utilisateurs (CRUD)
- un contrôleur d'opérations qui permet :
  - aux utilisateurs enregistrés de se loguer et de se déloguer (JWT)
  - au serveur de gestion du jeu de vérifier le token d'un utilisateur

_Remarque :_ cette API est destinée à être utilisée par un client découplé de l'API (en clair, une autre application, avec une autre origine). Outre la mise en place d'un contrôle des origines avec CORS qui sera abordée plus loin, l'information concernant l'origine de l'utilisateur est utilisée par l'API pour valider un token. L'origine de la requête de login est utilisée, et conservée dans le token, et ce token ne pourra être ré-authentifié par l'API que s'il est renvoyé dans une requête depuis la même origine.

### 1.1. Lancement avec Spring Boot

Compilez et lancez cette API avec le goal Maven approprié.

Pour tester le fonctionnement de votre API, vous trouverez dans le répertoire `users` une **collection de requêtes Postman très basique**. Quelques précisions à propos de cette collection :

- Les requêtes testent une API déployée à la racine du Tomcat embarqué dans Spring. En clair : sur http://localhost:8080
- Vous pouvez utiliser les requêtes une par une, mais elles ne correspondent pas à un scénario, comme en M1IF03.
- Les tests des requêtes sont essentiellement là pour stoker le token, et il se peut que votre API fonctionne parfaitement même si un test ne passe pas (par exemple, si vous changez le mot de passe avec la requête PUT, le login ne passera plus, et si vous vous déloguez, vous recevrez des codes 401 au lieu des 20x attendus dans les tests). N'hésitez pas à modifier / compléter cette collection en fonction de vos besoins.

### 1.2. Déploiement sur un serveur Tomcat

Comme vous aurez à le faire sur une VM à partir du TP2, testez le déploiement de votre API sur un serveur Tomcat sur votre machine locale :

- packagez le projet en .war : le fichier obtenu doit avoir un nom à rallonge, qu'il ne sera pas simple d'utiliser.

Pour éviter cela, dans l'élément build de votre pom.xml, rajoutez la ligne suivante :

```xml
<finalName>${artifactId}</finalName>
```

(cela vous permettra de générer un fichier war avec le nom "simple" de votre application : users et de déployer dans Tomcat avec ce nom de contexte).

- déployez le fichier `users.war` obtenu sur Tomcat

- avec votre navigateur, requêtez la liste des utilisateurs pour vérifier qu'il fonctionne correctement

## 2. Complétion du code

Pour comprendre le fonctionnement de cette API, vous allez en compléter le code.

### 2.1. Requête de validation d'un token d'authentification

La requête `/authenticate` n'est pas fonctionnelle. C'est à vous de la mettre en place.

_Remarque :_ l'API est inspirée de ce qui vous avait été donné en M1IF03, mais nous avons retiré la couche d'abstraction du `ConnectionManager` qui n'était plus nécessaire ici. Les services et les filtres s'appuient directement sur `UserTokenProvider` (dans le package `util`).

### 2.2. Vérification de la déconnexion

Actuellement, si un utilisateur se déconnecte (`/logout`), rien n'empêche l'API de continuer à fonctionner avec son ancien token, si celui-ci est renvoyé par un client malicieux. Dans la collection Postman, le token est supprimé des variables de collection pour empêcher ce comportement, mais vous pouvez aisément le tester en commentant le code de la fin du test de cette requête.

À vous de faire en sorte que ce ne soit plus possible.

_Aide :_ chaque instance de la classe `User` met à jour un booléen en cas de (dé)connexion...

### 2.3. Gestion des erreurs

Spring offre plusieurs possibilités pour la gestion des erreurs. Vous choisirez l'une de celles-ci :

- la gestion des erreurs dans les contrôleurs, comme indiqué dans [la solution 4 de ce tuto](https://www.baeldung.com/exception-handling-for-rest-with-spring)
- un contrôleur commun dont la responsabilité sera de renvoyer les erreurs HTTP correspondant aux exceptions dans le code, comme indiqué dans [ce tuto](https://spring.io/blog/2013/11/01/exception-handling-in-spring-mvc)

### 2.4. Préparation des TPs suivants

Ajoutez "en dur" (dans un bean) un utilisateur ayant pour espèce `ADMIN`, qui vous servira à partir du TP4...

Testez.

## 3. Affinage du contrôle des origines

Dans le code actuel, le mécanisme CORS est mis en place pour le contrôle des requêtes cross-origine, pour toutes les routes de l'API. Vous le trouvrez dans la classe `WebMvcConfig` (répertoire `config`). Dans cette partie, vous allez mettre en place un contrôle plus fin, tenant notamment compte des requêtes qui peuvent être accédées en CORS et de celles qui ne le doivent pas.

Utilisez les annotations fournies par le [CORS support](https://github.com/spring-projects/spring-framework/issues/13916) de Spring pour supporter CORS de la façon suivante :
- Autoriser les origines `http://localhost`, `http://192.168.75.XX`, et `https://192.168.75.XX`, où XX est la fin de l'IP de votre VM, pour les requêtes :
  - `POST /login`
  - `POST /logout`
  - `GET /users/{login}`

**Aide :** Pour autoriser les scripts d'un client CORS à récupérer le header "Authorization" qui contient le token JWT, vous devrez ajouter un header [Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers) aux réponses avec succès aux POST sur `/login`.

Ressources :
- [Tutoriel](https://spring.io/guides/gs/rest-service-cors/) (trop) complet
- [Billet de blog](https://spring.io/blog/2015/06/08/cors-support-in-spring-framework) limité aux annotations, mais pas à jour

Testez avec la collection Postman.

## 4. Génération de la documentation

&Agrave; l'aide d'annotations OpenAPI, générez une documentation de l'API du serveur.

Ressources :
- [Page d'accueil de SpringDoc](https://springdoc.org/)
- [Spécifications / Getting started](https://github.com/springdoc/springdoc-openapi)
- [Exemple de tutoriel assez complet](https://github.com/swagger-api/swagger-core/wiki/Swagger-2.X---Annotations)
- [Javadoc](http://docs.swagger.io/swagger-core/v2.2.20/apidocs/)

**Indications** :

- Pour "supprimer" le type de contenu de la documentation d'une erreur HTTP, il faut rajouter explicitement une annotation `@Content()` vide
- Si vous utilisez plusieurs fois la même annotation, seule la dernière sera prise en compte. En conséquence, pour pouvoir documenter deux méthodes répondant à la même URL (et par exemple générant différents types de contenus), il faut mettre toute la documentation dans une seule annotation.
- Voir [cette FAQ](https://springdoc.org/#can-i-customize-openapi-object-programmatically) pour grouper plusieurs contrôleurs dans la même documentation

**Testez** en vérifiant que Springdoc vous permet bien de récupérer un fichier OpenAPI complet de votre API, et d'accéder au site Swagger permettant de tester les différentes requêtes sur votre serveur Tomcat.

Sauvegardez le fichier OpenAPI (au format YAML) à la racine de votre projet Spring sous le nom `users-api.yaml`.

Rajoutez à votre README une section "TP1 & TP2", contenant les liens vers :
  - les fichiers OpenAPI et Postman sur le dépôt
  - le Swagger généré par Spring et déployé sur votre VM (et qui doit permettre de tester votre serveur)

## 5. Tests des contrôleurs MVC

### 5.1. Tests unitaires

Spring MVC propose un outil de test assez simple à utiliser : [MockMVC](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#spring-mvc-test-framework). Vous trouverez [ici](https://spring.io/guides/gs/testing-web/) un tuto pour démarrer, et [là](https://www.baeldung.com/integration-testing-in-spring) des exemples pour aller plus loin.

- Créez des tests unitaires de vos contrôleurs en utilisant Spring MockMVC.
- Documentez vos tests

### 5.2. Tests d'intégration

Créez un test MockMVC correspondant au scénario ci-dessous :

1. création d'un utilisateur (-> success)
2. login (-> success)
3. authentification du token d'une requête (-> success)
4. modification du password de l'utilisateur (-> success)
5. login avec l'ancien mot de passe (-> error)
6. authentification d'un token erroné (-> error)
7. login avec le nouveau mot de passe (-> success)
8. récupération des informations sur l'utilisateur (-> success)
9. logout de l'utilisateur (-> success)
10. récupération des informations sur l'utilisateur avec le même token (-> error)
11. suppression de l'utilisateur (-> success)
12. récupération des informations sur l'utilisateur (-> error)

_Remarque :_ les différentes requêtes de l'API (sauf celle d'authentification des tokens) doivent être testées en CORS.

## 6. Fonctionnalités Spring "avancées"

Dans cette partie, vous allez modifier une partie du code qui vous a été fourni - sans changer le comportement de l'API - à l'aide d'autres projets Spring parmi ceux mentionnés en cours.

### 2.4. _Interceptor_

La méthode `generateToken()` de `UserTokenProvider` est appelée à plusieurs reprises dans le code, dans des éléments différents. Pourtant, dans chacun d'eux, elle fait le même travail. De plus, elle nécessite d'accéder à la réponse et de rajouter le token obtenu dans un header dans des éléments dont ce n'est pas nécessairement l'objet, obligeant à "promener" un objet `HttpServletResponse` entre les appels.

Vous allez factoriser ce comportement en utilisant le pattern d'[Interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html). 

- En vous inspirant de la doc et du cours, créez un composant qui implémente l'interface `HandlerInterceptor` et ne possède qu'une méthode "intéressante" : `postHandle`. Implémentez le contenu de cette méthode en fonction de vos besoins.
- Enregistrez cet intercepteur dans la classe de configuration, comme indiqué [dans la doc](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html).

Testez.

### 2.5. _Functional Endpoint_

Spring MVC peut fonctionner de la même façon soit avec des contrôleurs annotés, soit avec une interface fonctionnelle (cf. cours).

Remplacez le contrôleur de ressources par un [Functional Endpoint](https://docs.spring.io/spring-framework/reference/web/webmvc-functional.html#page-title).

Testez.
