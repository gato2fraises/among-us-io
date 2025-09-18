# 📋 Instructions pour mettre le projet sur GitHub

## 🎯 **Étape 1 : Créer le Repository sur GitHub.com**

### **1.1 Aller sur GitHub**
1. Ouvrez votre navigateur web
2. Allez sur **[github.com](https://github.com)**
3. Connectez-vous à votre compte GitHub

### **1.2 Créer un nouveau repository**
1. Cliquez sur le bouton **"New"** (vert) ou **"+"** en haut à droite
2. Sélectionnez **"New repository"**

### **1.3 Configurer le repository**
- **Repository name** : `among-us-io` ou `amongus-io-game`
- **Description** : `🚀 Complete Among Us .io multiplayer game with advanced features - Solo/Multiplayer, Map Editor, Tournaments, Replays`
- **Public** ou **Private** : Selon votre préférence
- **⚠️ NE PAS cocher** "Add a README file" (nous en avons déjà un)
- **⚠️ NE PAS cocher** "Add .gitignore" (nous en avons déjà un)
- **⚠️ NE PAS cocher** "Choose a license" (pour l'instant)

4. Cliquez sur **"Create repository"**

## 🔗 **Étape 2 : Connecter votre projet local**

GitHub va vous montrer une page avec des instructions. **Utilisez la section "...or push an existing repository from the command line"**.

### **2.1 Copier l'URL de votre repository**
L'URL sera quelque chose comme :
```
https://github.com/VOTRE-USERNAME/among-us-io.git
```

### **2.2 Exécuter les commandes suivantes**

Copiez et exécutez ces commandes **une par une** dans PowerShell :

```powershell
# Renommer la branche principale (recommandé)
git branch -M main

# Ajouter le repository distant
git remote add origin https://github.com/VOTRE-USERNAME/among-us-io.git

# Pousser le code vers GitHub
git push -u origin main
```

**⚠️ Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub réel !**

## 🎯 **Étape 3 : Finalisation**

### **3.1 Vérification**
1. Retournez sur la page de votre repository GitHub
2. Actualisez la page (F5)
3. Vous devriez voir tous vos fichiers !

### **3.2 Ajouter des topics (optionnel)**
1. Sur la page du repository, cliquez sur l'engrenage ⚙️ à côté de "About"
2. Ajoutez des topics comme : `among-us`, `javascript`, `html5-game`, `multiplayer`, `canvas`, `game`

### **3.3 Activer GitHub Pages (optionnel)**
1. Allez dans **Settings** > **Pages**
2. Sélectionnez **"Deploy from a branch"**
3. Choisissez **"main"** et **"/ (root)"**
4. Votre jeu sera accessible à : `https://VOTRE-USERNAME.github.io/among-us-io/`

## ✅ **Commandes à exécuter maintenant :**

```powershell
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/among-us-io.git
git push -u origin main
```

## 🚀 **Une fois sur GitHub, vous pourrez :**

- **Partager** : Envoyer le lien à vos amis
- **Collaborer** : Inviter d'autres développeurs
- **Déployer** : Utiliser GitHub Pages pour l'hébergement gratuit
- **Versioning** : Gérer les mises à jour avec Git
- **Issues** : Tracker les bugs et nouvelles fonctionnalités

## 🎮 **Demo en ligne**
Si vous activez GitHub Pages, votre jeu sera disponible publiquement !

**Lien de demo** : `https://VOTRE-USERNAME.github.io/among-us-io/`

---

**🎯 Prêt ? Créez votre repository sur GitHub et exécutez les commandes !**