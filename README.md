BigMind
=======

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



