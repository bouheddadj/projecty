# TP 8 - Progressive Web Apps

## Objectifs

Transformer une application Web existante en Progressive Web App

  - Structurer un App Shell et le mettre en cache
  - Utiliser des Services Workers pour mettre en cache du contenu de manière dynamique
  - Rendre l'application "installable" 
  - Permettre les notifications

## Pointeurs

- Service Workers
  - [Spec W3C](https://www.w3.org/TR/service-workers/)
  - [API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
  - [Workbox](https://developer.chrome.com/docs/workbox/)
- Progressive Web Apps (en général)
  - [MDN Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
  - [Web.dev Progressive Web Apps](https://web.dev/progressive-web-apps/)
  - [Plugin PWA pour Vite](https://github.com/vite-pwa/vite-plugin-pwa)
  - [Exemple d'utilisation du plugin avec Vue](https://github.com/vite-pwa/vite-plugin-pwa/tree/main/examples/vue-router)
- Web Application Manifest
  - [Spec W3C](https://www.w3.org/TR/appmanifest/)
  - [Doc MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
  - [Doc Google](https://web.dev/add-manifest/)
  - [PWA Builder](https://www.pwabuilder.com/) (pour générer un manifest)
- [App shell](https://developer.chrome.com/blog/app-shell/)
- Tester
  - [LightHouse](https://developers.google.com/web/tools/lighthouse)

## Application

Dans ce TP, vous continuerez de travailler sur l'application des TPs précédents. Cet énoncé part du principe que le client et l'API côté serveur fonctionnent :

- Votre client doit être packagé et déployé **en HTTPS** sur nginx.
- Votre client est une application Vue avec gestion des états et un routeur (côté client) qui permette de gérer les différentes vues de votre application.
- Une route côté serveur doit permettre d'accéder à l'API contenant le métier (actuel) de l'application.
- La partie mobile a été implémentée 

## Travail à réaliser

### 1. Transformation de votre projet en PWA

comme vous avez réalisé votre application avec Vite et Vue, vous allez continuer avec cette stack. Vite fournit un plugin "framework-agnostic" pour créer des PWA : [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa).

- Installez ce plugin en DevDependency : `npm i vite-plugin-pwa --save-dev`
- Configurez Vite pour qu'il puisse utiliser ce plugin (en plus de ceux déjà présents) :

```javascript
...
import { VitePWA } from 'vite-plugin-pwa'
...
export default {
  plugins: [
    ...
    VitePWA()
    ...
  ]
}
```
([Source](https://github.com/vite-pwa/vite-plugin-pwa#-usage))

Remarque : si vous choisissez d'ajouter l'option pour générer la PWA avec le serveur de dev (voir la [fin de cette section](https://developer.chrome.com/blog/app-shell/)), vous pourrez voir qu'un manifest un SW ont bien été générés dès que vous sauverez le fichier de config.

C'est bon, le TP est fini. Non, je blague... &#x1F60E;

### 2. Ficher Manifest

Le fichier manifest généré par défaut est assez basique. Vous pouvez y accéder en faisant _view source_ dans votre navigateur et en suivant le lien vers le manifest. Vous allez l'enrichir à l'aide des pointeurs donnés plus haut. Référez-vous à l'exemple pour comprendre comment l'indiquer au plugin.

Spécifiez _a minima_ un nom, un _short name_, un icone, une url, une orientation, et des éléments descriptifs.

### 3. Service worker

Le plugin PWA pour Vite inclut [Workbox](https://developer.chrome.com/docs/workbox/) comme dépendance. Par défaut, il va automatiquement mettre en place un service worker avec la méthode [`generateSW`](https://developer.chrome.com/docs/workbox/the-ways-of-workbox/#generatesw-vs-injectmanifest).

Vous pouvez (et devez) toutefois en configurer les options.

**Aide pour cette partie** :

- Vous trouverez ici la [liste des options de configuration de `generateSW`](https://developer.chrome.com/docs/workbox/reference/workbox-build/#method-generateSW).
- Vous trouverez ici une [description de caching sans regex basée sur le type des contenus demandés](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/).
- Cet [exemple de PWA Vue avec Workbox](https://github.com/pimhooghiemstra/plintpwa-vue-1) permet d'explorer un projet fonctionnel plus en détail.

&#x26a0; **Remarque :** Pour pouvoir utiliser le service worker de l'app (en HTTPS sur votre VM) depuis votre PC ou téléphone, vous devez installer le certificat racine.
- Sur PC, cela s'installe dans les paramètres du navigateur ; sur un téléphone, ça s'installe directement au niveau de l'OS.
- Pour Android : en s'envoyant le fichier par mail et en ouvrant la PJ, Android propose de l'installer directement.
- Pour IOS : suivre [ce lien](https://apple.stackexchange.com/questions/123988/how-to-add-a-crt-certificate-to-iphones-keychain).

Le certificat racine est dans le répertoire /Certificats depuis [la page d'accueil de l'UE](https://perso.liris.cnrs.fr/lionel.medini/enseignement/M1IF13/).

#### 3.1. Precaching

La première chose à faire est de spécifier les fichiers qui devront être pré-cachés automatiquement. Par exemple :

```javascript
import { VitePWA } from 'vite-plugin-pwa'
...
export default ({
  plugins: [
    ...
    VitePWA({
      ...
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
      ...
    })
  ]
})
```

- Identifiez les fichiers qui constituent l'app shell de votre application et placez leurs chemins relatifs dans une variable du fichier de config.
- Faites en sorte de cacher les fichiers de l'app shell, ainsi que les images dont vous aurez besoin durant le jeu.

#### 3.2. Stratégie de cache

Choisissez une [stratégie](https://developer.chrome.com/docs/workbox/caching-strategies-overview/) adaptée à l'application. La spécification de ce choix se fait avec l'option [StrategyName](https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-StrategyName).

**Attention** : lisez la question suivante avant de vous décider...

#### 3.3. Caching à la volée

Pour éviter de recharger les "tuiles" de la carte quand vous vous déplacez, faites en sorte de les ajouter dynamiquement au cache quand vous les avez téléchargées et de les afficher directement quand vous zoomez sur la carte ou la déplacez.

### 4. Notifications

Utiliser l'[API de notifications](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Re-engageable_Notifications_Push) pour notifier un joueur qu'il vient d'en attraper un autre, ou qu'il vient de se faire attraper.

### 5. Création d'un SW (facultatif)

Si vous voulez pouvoir cacher les notifications push (_cf._ question suivante), vous allez devoir utiliser la méthode "manuelle" [`injectManifest`](https://developer.chrome.com/docs/workbox/the-ways-of-workbox/#generatesw-vs-injectmanifest). Dans ce cas, vous pouvez rajouter une "mémorisation des scores" des joueurs indiquant combien de vitrines il.elle a ouvert/fermé...

### 6. Push serveur (facultatif)

Vous pouvez utiliser l'API de push pour que le serveur signale chaque action sur une vitrine à tous les participants. Pour gérer le push il sera nécessaire d'utiliser le service worker "custom" défini à la section précédente.

## Critères pour la démo

- un manifeste correctement défini et permettant d'installer l'application 
- une page offline disponible. Voir [la recette Workbox associée](https://developer.chrome.com/docs/workbox/managing-fallback-responses/#offline-page-only).
- une notification push pour la fin de la partie