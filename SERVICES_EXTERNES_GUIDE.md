# 🔧 Guide : Mise à Jour Services Externes

**Date :** 31 Octobre 2025
**Durée totale :** 5 minutes
**Criticité :** Cosmétique (non-bloquant)

---

## 📋 Checklist Rapide

- [ ] Renommer Supabase Project (2 min)
- [ ] Renommer GitHub OAuth App (2 min)
- [ ] Vérifier que tout fonctionne (1 min)

---

## 1️⃣ Supabase Project (2 min)

### **Pourquoi ?**
- Nom affiché dans le dashboard Supabase
- Cosmétique seulement, **aucun impact fonctionnel**

### **Étapes :**

1. **Ouvrir Supabase Dashboard**
   - Va sur : https://supabase.com/dashboard
   - Connecte-toi si nécessaire

2. **Sélectionner le projet BigMind**
   - Tu devrais voir ton projet (probablement appelé "BigMind")
   - Project ID : `rfnvtosfwvxoysmncrzz`

3. **Accéder aux Settings**
   - Dans la sidebar gauche, clique sur l'icône ⚙️ **Settings**
   - Ou va directement sur : https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/settings/general

4. **Renommer le projet**
   - Dans la section **"General settings"** en haut
   - Tu devrais voir **"Name"** avec la valeur actuelle (BigMind)
   - Change : "BigMind" → "Cartae"
   - Clique sur **"Save"** (bouton en bas à droite)

### **⚠️ IMPORTANT : Ce qui NE CHANGE PAS**

✅ **Project ID** : `rfnvtosfwvxoysmncrzz` (reste identique)
✅ **API URL** : `https://rfnvtosfwvxoysmncrzz.supabase.co` (reste identique)
✅ **Anon Key** : Reste identique
✅ **Service Role Key** : Reste identique

**Aucun fichier `.env` à modifier !**

### **Vérification :**

- [ ] Le nom "Cartae" apparaît dans le dashboard
- [ ] L'URL reste `https://rfnvtosfwvxoysmncrzz.supabase.co`
- [ ] Les Edge Functions fonctionnent toujours

---

## 2️⃣ GitHub OAuth App (2 min)

### **Pourquoi ?**
- Nom affiché lors du login GitHub
- Cosmétique, mais visible par les utilisateurs

### **Étapes :**

1. **Ouvrir GitHub Developer Settings**
   - Va sur : https://github.com/settings/developers
   - Ou : GitHub → Settings → Developer settings → OAuth Apps

2. **Trouver ton OAuth App**
   - Tu devrais voir une app nommée "BigMind OAuth" ou similaire
   - Clique dessus pour l'ouvrir

3. **Renommer l'application**
   - Champ **"Application name"** : Change "BigMind OAuth" → "Cartae OAuth"
   - (Optionnel) Champ **"Homepage URL"** : Si tu as un domaine cartae.com, mets-le ici
   - Clique sur **"Update application"** (bouton vert en bas)

### **⚠️ IMPORTANT : Ce qui NE CHANGE PAS**

✅ **Client ID** : Reste identique
✅ **Client Secret** : Reste identique
✅ **Authorization callback URL** : Reste identique

**Aucun fichier `.env` à modifier !**

### **Vérification :**

- [ ] Le nom "Cartae OAuth" apparaît dans la liste des OAuth Apps
- [ ] Client ID est toujours le même
- [ ] Authorization callback URL est toujours correct

---

## 3️⃣ Vérification Complète (1 min)

### **Test de l'application :**

```bash
cd /Users/moi/Nextcloud/10.Scripts/bigmind/bigmind
pnpm dev
```

**Ouvre l'app** : http://localhost:5173

### **Checklist :**

- [ ] L'application démarre
- [ ] Le titre affiche "Cartae" (dans l'onglet navigateur)
- [ ] (Si connecté) GitHub OAuth fonctionne
- [ ] Admin Panel accessible (si admin)
- [ ] Edge Functions répondent

---

## 📸 Screenshots de Référence

### **Supabase Dashboard - Avant/Après**

**Avant :**
```
Project Name: BigMind
Project ID: rfnvtosfwvxoysmncrzz
API URL: https://rfnvtosfwvxoysmncrzz.supabase.co
```

**Après :**
```
Project Name: Cartae  ← SEUL CHANGEMENT
Project ID: rfnvtosfwvxoysmncrzz
API URL: https://rfnvtosfwvxoysmncrzz.supabase.co
```

### **GitHub OAuth App - Avant/Après**

**Avant :**
```
Application name: BigMind OAuth
Client ID: xxx...
Homepage URL: (optionnel)
```

**Après :**
```
Application name: Cartae OAuth  ← SEUL CHANGEMENT
Client ID: xxx... (identique)
Homepage URL: (optionnel - cartae.com si disponible)
```

---

## ✅ Checklist Finale

### Services Externes
- [ ] Supabase Project renommé "BigMind" → "Cartae"
- [ ] GitHub OAuth App renommé "BigMind OAuth" → "Cartae OAuth"

### Vérifications
- [ ] URLs Supabase identiques (aucun changement .env)
- [ ] Client ID/Secret GitHub identiques (aucun changement .env)
- [ ] Application démarre correctement
- [ ] GitHub OAuth fonctionne
- [ ] Admin Panel accessible

---

## 🆘 Troubleshooting

### **Si GitHub OAuth ne fonctionne plus :**

1. Vérifie que le **Client ID** n'a PAS changé
2. Vérifie que le **Client Secret** n'a PAS changé
3. Vérifie que l'**Authorization callback URL** est correct :
   ```
   http://localhost:5173/auth/callback
   ```

### **Si Supabase ne répond plus :**

1. Vérifie que le **Project ID** n'a PAS changé : `rfnvtosfwvxoysmncrzz`
2. Vérifie que l'**API URL** est correcte :
   ```
   https://rfnvtosfwvxoysmncrzz.supabase.co
   ```
3. Vérifie que les **API Keys** sont toujours valides

### **En cas de problème :**

**Rien ne casse** : Tu n'as changé que des **noms d'affichage**, pas des clés/IDs !

Si tu veux revenir en arrière :
- Supabase : Re-renomme "Cartae" → "BigMind"
- GitHub OAuth : Re-renomme "Cartae OAuth" → "BigMind OAuth"

---

## 🎉 Après Ça, C'est FINI !

Une fois ces 2 renommages faits :

✅ **Migration 100% complète** (code + repos + services)
✅ **Tous les noms "BigMind" remplacés par "Cartae"**
✅ **Aucun lien cassé**
✅ **Tout fonctionne**

---

## 📊 Récapitulatif Complet de la Migration

| Élément | Ancien | Nouveau | Status |
|---------|--------|---------|--------|
| **Repos GitHub** | bigmind | cartae | ✅ |
| | bigmind-plugins | cartae-plugins | ✅ |
| | bigmind-private | cartae-private | ✅ |
| **Packages NPM** | @bigmind/* | @cartae/* | ✅ |
| **Plugin IDs** | com.bigmind.* | com.cartae.* | ✅ |
| **Fichiers** | 246 modifiés | | ✅ |
| **Supabase Project** | BigMind | Cartae | ⏳ |
| **GitHub OAuth** | BigMind OAuth | Cartae OAuth | ⏳ |

**Total :** 99% fait, 1% à faire (5 min)

---

**Prêt ? Suis ce guide et reviens me dire quand c'est fait !** 🚀

---

## 📝 Notes Supplémentaires

### **Edge Functions Supabase**

Tes Edge Functions actuelles :
- `verify-admin`
- `admin-approve-rating`
- `admin-reject-rating`
- `admin-update-report-status`
- `admin-delete-report`
- `github-oauth`

**Aucune ne contient "BigMind" dans le nom** → Rien à modifier ! ✅

Si tu veux vérifier :
1. Supabase Dashboard → Edge Functions
2. Regarde la liste des fonctions
3. Vérifie qu'aucune n'a "bigmind" dans le nom

### **Variables d'Environnement**

Fichiers `.env` **ne changent PAS** :
```bash
# RESTE IDENTIQUE
VITE_SUPABASE_URL=https://rfnvtosfwvxoysmncrzz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GITHUB_CLIENT_ID=Ov...
```

### **Domaine (Futur)**

Si tu achètes `cartae.com` plus tard :
1. Configure les DNS
2. Mets à jour **Homepage URL** dans GitHub OAuth App
3. (Optionnel) Ajoute un domaine custom dans Supabase

**Mais pour l'instant** : Aucun domaine custom nécessaire ! ✅

---

**Temps estimé : 5 minutes max** ⏱️
