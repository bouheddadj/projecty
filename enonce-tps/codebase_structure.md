# Structure du Projet MIF-13

## 📁 Organisation Générale
```
mif-13/
├── 🎯 admin/           # Interface d'administration (TypeScript/Webpack)
├── 🌐 api/             # API Node.js + Express 
├── 💻 client/          # Application frontend Vue.js
└── 👥 users/           # Microservice utilisateurs Java Spring Boot
```

## 🎯 Admin (Interface Administration)
```
admin/
├── src/
│   ├── *.html          # Pages admin
│   ├── *.ts            # Scripts TypeScript (auth, forms, maps)
│   ├── css/            # Styles et polices
│   └── img/            # Assets graphiques
├── spec/               # Tests Jasmine
└── webpack.config.js   # Configuration build
```

## 🌐 API (Backend Node.js)
```
api/
├── server.js           # Point d'entrée Express
├── routes/
│   ├── adminRouter.js  # Routes administration  
│   └── gameRouter.js   # Routes de jeu
├── utils/
│   ├── fileHandler.js  # Gestion fichiers
│   ├── geo.js          # Utilitaires géolocalisation
│   └── ttlManager.js   # Gestion TTL/cache
├── public/             # Assets statiques
└── config.json         # Configuration
```

## 💻 Client (Frontend Vue.js)
```
client/
├── src/
│   ├── main.js         # Bootstrap Vue
│   ├── App.vue         # Composant racine
│   ├── components/     # Composants Vue
│   │   ├── Login.vue, Register.vue
│   │   ├── MyMap.vue   # Carte interactive
│   │   └── ProfileForm.vue
│   ├── views/          # Pages/vues
│   ├── router/         # Configuration routing
│   └── stores/         # State management (Pinia)
├── public/             # Assets statiques + PWA
└── vite.config.js      # Configuration build
```

## 👥 Users (Microservice Java)
```
users/
├── src/main/java/fr/univlyon1/m1if/m1if13/users/
│   ├── controller/     # Contrôleurs REST
│   ├── service/        # Logique métier
│   ├── dao/            # Accès données
│   ├── model/          # Entités (User, Species)
│   ├── dto/            # Objets de transfert
│   ├── filter/         # Filtres auth/autorisation
│   └── util/           # Utilitaires (tokens, URL)
├── src/test/           # Tests unitaires
└── pom.xml             # Configuration Maven
```

## 🔧 Technologies Clés

| Composant | Technologies | Port/URL |
|-----------|-------------|----------|
| **Admin** | TypeScript, Webpack, Leaflet | - |
| **API** | Node.js, Express, PM2 | :3000 |
| **Client** | Vue.js 3, Vite, Pinia, PWA | :5173 |
| **Users** | Java 17, Spring Boot, Maven | :8080 |

## 🚀 Points d'Entrée
- **API**: `api/server.js`
- **Client**: `client/src/main.js` 
- **Users**: `users/src/main/java/.../UsersApplication.java`
- **Admin**: `admin/src/index.html`

## 📦 Scripts de Déploiement
- `ci/setup-mvn-proxy.sh` - Configuration proxy Maven
- Configurations PM2 pour production (`ecosystem.config.cjs`)

## 🗂️ Fichiers de Configuration
- `.env` - Variables d'environnement
- `config.json` - Configuration API
- `application.properties` - Configuration Spring Boot
- `package.json` - Dépendances Node.js/Vue
- `pom.xml` - Dépendances Java

Cette structure suggère une **architecture microservices** avec :
- Frontend moderne (Vue.js + PWA)
- API Node.js pour la logique de jeu
- Microservice Java pour la gestion utilisateurs
- Interface d'administration séparée