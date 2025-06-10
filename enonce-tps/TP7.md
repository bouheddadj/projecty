# TP 7 - Web Mobile

## Objectifs

  - Adapter votre application web pour une utilisation en contexte mobile
  - Accéder aux capteurs et actionneurs d'un smartphone
  - Terminer l'implémentation de votre jeu

## Pointeurs

  - [Les règles du jeu](https://forge.univ-lyon1.fr/m1if13/m1if13-2025/-/blob/main/pitch.md)
  - Capteurs
    - [Simuler sa localisation](https://developers.google.com/web/tools/chrome-devtools/device-mode/geolocation)
    - [Generic Sensor Demos](https://intel.github.io/generic-sensor-demos/) à tester avec différents dispositifs et navigateurs
  - Tester 
    - [Simulation mobile des Chrome Dev Tools](https://developers.google.com/web/tools/chrome-devtools/device-mode)
    - [Remote debugging toujours avec les Chrome Dev Tools](https://developers.google.com/web/tools/chrome-devtools/remote-debugging)
    - [Responsive Design Mode de Firefox](https://developer.mozilla.org/en-US/docs/Tools/Responsive_Design_Mode)

## Application

Cet énoncé part du principe que l'API côté serveur et le client fonctionnent :

- Votre client est une application Vue.js destinée aux joueurs, avec un store pour la gestion des états et un routeur qui permet de gérer les différentes vues de votre application.
- Votre client a été packagé par Vite et déployé sous la forme d'un ensemble de fichiers statiques sur nginx (si ce n'est pas le cas, il est possible que votre navigateur vous refuse l'utilisation de certains capteurs car votre orgine ne sera pas en HTTPS).
- Une route côté serveur permet d'accéder à l'API contenant le métier de l'application pour les joueurs "normaux".

## 1. Capteurs et géolocalisation

### 1.1. Utilisation du GPS

&Agrave; l'aide de la [Geolocation API](https://www.w3.org/TR/geolocation-API/), créez une page avec un script simple (indépendant de votre application) qui récupère et affiche dans la console la position de l'utilisateur. Déployez ce script sur votre VM ou sur un serveur accessible de l'extérieur, et sortez pour vérifier que cela correspond à peu près (voir plus bas) à votre position.

### 1.2. Intégration à votre application

- mettez en place la récupération de la position dans l'application joueur de votre jeu
- faites patienter l'utilisateur tant que sa position n'est pas présente (affichez une erreur au bout d'une minute)
- remplacez la position mockée par celle récupérée depuis le GPS de l'appareil

Plutôt que d'interroger le GPS toutes les 5 secondes, découplez l'utilisation du capteur du reste de l'application à l'aide du store Pinia :

- récupérez la position courante et utilisez [`watchPosition`](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition) pour être notifié d'un changement de position
- à l'aide d'actions, tenez le store à jour de la position de l'utilisateur
- utilisez les informations stockées dans le store pour mettre à jour la carte et envoyer la position au serveur
- vérifiez que les positions des différents joueurs s'affichent sur la carte

<div class="bleu">&Agrave; ce stade, votre application de jeu doit déjà être complètement fonctionnelle.</div>

### 1.3. Correction des erreurs de données de capteur

Pour corriger les problèmes de précision du GPS, vous allez ajouter un mécanisme d'étalonnage votre application qui corrige les erreurs systématiques :

- ajoutez une fonction JS qui s'interface entre la remontée de données GPS et le store, et qui ajoute aux coordonnées une translation par un vecteur stocké en mémoire
- créez une seconde fonction qui met à jour ce vecteur en calculant la différence entre les coordonnées captées et d'autres coordonnées passées en paramètre
- faites en sorte de déclencher cette fonction lors d'un appui long ( > 1 seconde) sur un point de la carte Leaflet (exemple de code [ici](https://stackoverflow.com/questions/6139225/how-to-detect-a-long-touch-pressure-with-javascript-for-android-and-iphone))

## 2. Vibreur

Une vue spéciale (modale) permettra d'afficher le fait que l'utilisateur local vient d' "attraper" un autre joueur :

- Affichez un texte approprié
- Faites [vibrer le téléphone](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API). 

## 3. API JS mobile : blocage du passage en veille

Un autre grand malheur qui pourrait arriver aux joueurs serait que leur téléphone passe en veille en pleine course vers la victoire. Pour éviter une telle catastrophe, vous pouvez bloquer le passage en veille, à l'aide de l'API [Screen Wake Lock](https://w3c.github.io/screen-wake-lock/#the-wakelocksentinel-interface). Pour plus de documentation sur cette API, vous pouvez aussi consulter cette [page MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) et cet article sur [Chrome developpers][https://developer.chrome.com/docs/capabilities/web-apis/wake-lock?hl=fr]. Toutefois, il convient d'économiser de l'énergie lorsque les joueurs ne sont pas en train de courir, de façon à ce que le téléphone ne tombe pas en panne de batterie à là prochaine utilisation de l'application.

Vous allez donc bloquer et débloquer successivement la mise en veille, en fonction de la vue affichée et donc de l'activité de l'utilisateur :

- Récupérez (aka requêtez) une `WakeLockSentinel` lorsque l'application passe en mode "jeu" (c'est-à-dire affiche la vue avec la carte),
- Libérez cette sentinelle lorsqu'elle change de mode et affiche une autre vue (aide : vous pouvez utiliser les [hooks](https://fr.vuejs.org/guide/essentials/lifecycle) appropriés).

## 4. En bonus

Pour aller plus loin, vous pouvez implémenter une ou plusieurs des fonctionnalités suggérées ci-dessous.

### 4.1. Thème et luminosité

Compte tenu de l'importance de cette application pour les joueurs, il est important qu'ils puissent continuer à l'utiliser dans le noir. Vous allez donc :

- créer un second thème de l'application avec un fond plus sombre
- utiliser le capteur de [luminosité ambiante](https://www.w3.org/TR/ambient-light/) et définir une valeur seuil qui déclenchera le passage d'un thème à l'autre

**Aide** : pour cela vous devrez peut-être autoriser l'accès aux generic sensors sur vore téléphone : [chrome://flags/#enable-generic-sensor-extra-classes](chrome://flags/#enable-generic-sensor-extra-classes)

### 4.2. Direction des joueurs

Quand le joueur bouge, indiquer leur direction. Plusieurs approches sont possibles:

- calculer la direction en se basant sur la position courante et la position passée 
- utiliser la boussole (le magnétomètre) du téléphone. Le magnétomètre est protégé pour des raisons de protection de la vie privée. Il faut également activer l'[accès aux generic sensors](chrome://flags/#enable-generic-sensor-extra-classes) dans les options de Chrome.
- d'autres approches s'appuyant sur les valeurs de l'accéléromètre sont possibles.

## Déploiement

(Re)buildez votre client Vue et déployez les fichiers générés à la racine de votre serveur nginx.


