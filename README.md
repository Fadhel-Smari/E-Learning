# 🎓 API E-Learning — Plateforme d'Apprentissage en Ligne

# Partie backend

Bienvenue sur l'API de notre plateforme **E-Learning**. Ce service Web permet de gérer des cours en ligne, des leçons structurées, des inscriptions d'étudiants avec suivi de progression, ainsi que la génération automatique de quiz de validation de compétences grâce à l'intégration de l'API externe **OpenTDB** (Open Trivia Database).

---

## 👥 Équipe de développement
* **Membre 1** : Fadhel Smari
* **Membre 2** : Gabriel Cadieux

---

## 🚀 Lancement du projet

Suivez ces étapes dans votre terminal pour configurer et lancer l'application locale :

### 1. Installation des dépendances
À la racine du backend du projet, téléchargez les paquets requis :
```bash
cd backend
npm install
```
### 2. Configuration de la base de données sur Neon

- Rendez-vous sur Neon.tech et créez un projet PostgreSQL gratuit.

- Récupérez votre chaîne de connexion (Connection String).

### 3. Fichier de variables d'environnement (.env)
- Créez un fichier nommé .env à la racine de votre backend du projet et ajoutez-y la configuration suivante.

- Pour générer une clé de sécurité JWT_SECRET robuste, exécutez la commande suivante dans votre terminal :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- Copiez le résultat obtenu et complétez votre fichier .env :

```bash
# Connexion à la base de données Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:.....................................................=require"

# Secret de chiffrement pour les jetons d'accès JWT
JWT_SECRET="COLLEZ_ICI_LA_CLE_GENEREE_AVEC_NODE"

# Port d'écoute du serveur
PORT=3000
```

### 4. Migration de la base de données et génération de Prisma
- Créez les tables correspondantes dans votre instance Neon et générez votre client Prisma personnalisé :

```bash
npx prisma migrate dev --name init
npx prisma generate
```
### 5. Démarrage de l'application
- Démarrez le serveur de développement:

```bash
npm run dev
```

---

## 📋 Liste des Routes

```text
===================================================================
1. AUTHENTIFICATION & UTILISATEURS
===================================================================
POST   /auth/register          -> Inscription d'un nouvel utilisateur
POST   /auth/login             -> Connexion (Génère le Token JWT)
GET    /auth/me                -> Profil de l'utilisateur connecté

===================================================================
2. GESTION DES COURS & LEÇONS
===================================================================
GET    /cours                  -> Liste des cours (Filtres & Pagination)
GET    /cours/:id              -> Détails d'un cours avec ses leçons
POST   /cours                  -> Créer un cours
PATCH  /cours/:id              -> Modifier un cours
DELETE /cours/:id              -> Supprimer un cours
POST   /cours/:id/lecons       -> Créer une leçon pour un cours
DELETE /cours/lecons/:leconId  -> Supprimer une leçon

===================================================================
3. INSCRIPTIONS & SUIVI DE PROGRESSION
===================================================================
GET    /inscriptions       -> Voir toutes mes inscriptions
POST   /inscriptions       -> S'inscrire à un cours (coursId dans body)
PATCH  /inscriptions/:id   -> Mettre à jour progression ou statut

===================================================================
4. QUIZ & ÉVALUATIONS DYNAMIQUES
===================================================================
GET    /cours/:coursId/quizs   -> Obtenir les quiz d'un cours
POST   /quiz/generer/:coursId  -> Générer un quiz de 5 questions (OpenTDB)
POST   /quiz/:quizId/evaluer   -> Évaluer les réponses et enregistrer le score
===================================================================
```