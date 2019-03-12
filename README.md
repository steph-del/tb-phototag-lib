
# TB PhotoTag

Le projet est composée de 3 applications :

- **tb-phototag-lib** : la librairie
- **tb-phototag-lib-app** : l'application qui fait tourner la librairie (test)
- **tb-phototag-lib-app-e2e** : les tests e2e (généré automatiquement par Angular)



Voir le fichier [**angular.json**](https://github.com/steph-del/tb-phototag-lib/blob/master/angular.json) à la racine du projet.

## Installation de la librairie

- `yarn add https://github.com/steph-del/tb-phototag-lib/releases/download/v0.1.0/tb-tsb-lib-0.1.0.tgz` (voir la dernière version)
- ou `npm install https://github.com/steph-del/tb-phototag-lib/releases/download/v0.1.0/tb-tsb-lib-0.1.0.tgz`
- Dasn l'appli principale, vérifier les versions des dépendances (peer dependencies) de la librairie (angular/common, /core, /material, /cdk et rxjs)
- Importer un thème angular material dans le fichier css de l'application principale
- Ajouter les icones Material dans l'index.html de l'application principale :
`<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`

Importer `TbPhototagLibModule` dans `app.module.ts` :`import { TbPhototagLibModule } from 'tb-phototag-lib'`

## Utilisation du composant `<tb-phototag>`

Exemple d'utilisation :
[**Application test**](https://github.com/steph-del/tb-phototag-lib/tree/master/src/app)


### Paramètres en entrée @Input


| Paramètre                 | Requis | Type              | Valeurs | Valeur par défaut | Description |
| ---                       | ---    | ---               | ---     | ---               | ---         |
| baseApiUrl                | Oui    | string            |         | 'http://localhost:8000/api' | |
| userId                    | Oui    | number            |         | /                 | identifiant de l'utilisateur. Utitlisé pour récupérer / ajouter / modifier ses tags |
| photoId                   | Oui    | number            |         | /                 | identifiant de la photo |
| basicTags                 | Non    | `[PhotoTagModel]` |         | /                 | liste de tags par défaut à afficher à l'utilisateur |


### Paramètres en sortie @Output

| Propriété          | Valeur(s)                     | Remarque |
| ---                | ---                           | ---         |
| log                | TbLogModel                    | revoie tous les évènements utiles pour l'utilisateur ou pour le déboguage |


TbLogModel :

| Propriété   | Type             | Commentaire |
| ---         | ---              | ---         |
| module      | string           | ici, toujours 'tb-phototag-module' |
| type        | string           | 'info' \| 'success' \| 'warning' \| 'error' |
| message_fr  | string           |
| description | string           | optionnel   |

Les logs avec le type 'info' ne sont pas à afficher à l'utilisateur. Ils peuvent par contre servir pour le déboguage.

PhotoTagModel : 

| Propriété   | Type             | Commentaire |
| ---         | ---              | ---         |
| id          | number           | 
| userId      | number           | 
| photoId     | number           |
| name        | string           |
| path        | string           | 

## Serveur de développement

Ne pas oublier de reconstruire la librairie avant de servir l'application (`npm run build_serve` fait les deux à la suite).

## Build
-  `npm run build_lib` pour construire la librairie
-  `npm run build_serve` pour construire la librairie et servir l'application principale
-  `npm run build_pack` for construire et packager la librairie


> The --prod meta-flag compiles with AOT by default.


Le build et la package sont dans le répertoire `dist/`.

## Tests unitaires
`ng test`

## Tests e2e
`ng e2e`
