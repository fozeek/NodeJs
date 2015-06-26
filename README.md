# NodeJs


- Partage de fichiers éphémère

Site web basé sur NodeJS

- Page d’accueil avec le nom de chacun des participant et un descriptif du projet

- Page listant le nombre de répertoires créés depuis le début du lancement

http://www.snapfolder.com/nodes/

- Liste les répertoires actuels, si on clique sur un répertoire, on est dirigé vers la page correspondant au répertoire

- Les répertoires sont supprimantes

- Chaque répertoire est identifié par une icône, par son nom, le nombre de fichiers qu’il contient, et le nom de la personne qui l’a créé

- Un bouton permet de créer un répertoire de partage. Un répertoire est identifié par son nom, et le nom de la personne qui l’a créé

- chaque répertoire est présenté dans une page
    - la page présente l’ensemble des fichiers qu’il contient, la date d’ajout, le nombre de fois que le fichier a été téléchargé, une icône représente le type de fichier. Si on clique sur le fichier, il est proposé au téléchargement
    
     - la page contient un bouton permettant d’uploader un nouveau fichier

    - chaque fichier présenté est supprimable

- les répertoires de plus d’une heure, sont automatiquement supprimés

- Infos

Upload de fichier :

https://codeforgeek.com/2014/11/file-uploads-using-node-js/

Application web multipage templaté :

https://scotch.io/tutorials/use-ejs-to-template-your-node-application


//Lancer MongoDb
Télécharger les fichiers mongo.
Mettre le contenu de bin dans /data/db

Lancer la commande pour démarrer le serveur
./mongod --dbpath ./data/db


// commande pour base
// reset
node public/app.js --resetbase
// fill db
node public/app.js --filldb


