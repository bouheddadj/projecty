## Binôme

- p2207446 (THIEBAUD)
- p2111020 (BOUHEDDADJ)

## Méthode de travail

Nous sommes deux à travailler sur ce projet et nous suivons une méthodologie basée sur l'utilisation des branches Git :

1. Branche par TP : Pour chaque TP, nous créons une branche spécifique.
2. Branche par section : Chaque section d'un TP possède sa propre branche dérivée de la branche du TP.
3. Fusion des sections : Lorsqu'une section X d'un TP Y est terminée, elle est fusionnée dans la branche du TP Y, puis supprimée.
4. Fusion du TP dans la branche principale : Une fois le TP Y finalisé, nous fusionnons sa branche dans la branche main. Toutefois, nous ne supprimons pas la branche du TP afin de conserver un historique des développements.
5. Restrictions sur la branche main : La branche main ne doit pas être modifiée directement, sauf pour quelques exceptions : Modifications du fichier .gitignore, Mise à jour du README.md, Ajout de fichiers liés à l'intégration et au déploiement continus (CI/CD) dans le futur...

Cette organisation nous permet de garder un historique clair et structuré tout en évitant les conflits sur la branche principale.

# M1IF13-2025-base

Ce projet contient les sources à utiliser pour les TP de M1IF13 pour l'année 2024-2025.

Il est demandé de l'utiliser comme base pour votre repo, en conservant notamment les noms des répertoires contenant les différents projets fournis.

Merci de modifier ce readme en indiquant :

- votre numéro de binôme
- vos noms
- pour chaque TP, les informations à connaître pour la correction, par exemple :
  - s'il a été fait (ou pas)
  - jusqu'où vous avez été
  - vos choix de conception s'ils ne sont pas évidents

## TP1 & TP2

/users/users-api.yaml -> le fichier qui contient la documentation de l'api users
/users/M1IF13-2025.postman_collection.json -> le fichier qui contient des tests de l'api users

- http://localhost:8080/swagger-ui/index.html -> la page web qui contient la documentation swagger pour l'api users
- https://192.168.75.33:8443/users/swagger-ui/index.html en https
