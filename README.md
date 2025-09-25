BigMind
=======

L'objectif de cette application et de partager une application que je développe pour moi. Juste que tu utiliser des cartes mentales et les meilleures applications de carte mentale ou aujourd'hui des politiques de licensing, qui me conviennent pas. Je ne souhaite pas payer un abonnement, je veux que le logiciel m'appartienne (MErci Louis Rossman pour vos vidéo ✌️ ). 

Ce fichier readme sursera complété avant l'ouverture publique du repos.

Développement
-------------

1) Installer deps sans scripts (mode durci):

```
npm ci --ignore-scripts
```

2) Lancer en dev:

```
npm run dev
```

Sécurité
--------

- Scan secrets + audit npm:

```
npm run security:scan
```

- Détection scripts d'installation suspects dans node_modules:

```
npm run security:suspects
```

CI
--

Un workflow GitHub Actions `security.yml` exécute les scans à chaque push/PR.

Verrouillage versions
---------------------

Les versions sont épinglées (sans ^). Utiliser `npm ci` pour des installs reproductibles.



