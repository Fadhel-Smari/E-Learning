import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import type { Utilisateur, Cours } from '../generated/prisma/client.js';

async function main() {

  const motDePasseHache = await bcrypt.hash('1234', 10);

  // 1. Création de l'Administrateur
  await prisma.utilisateur.upsert({
    where: { email: 'admin@ecole.com' },
    update: {},
    create: {
      nom: 'Admin Système',
      email: 'admin@ecole.com',
      motDePasse: motDePasseHache,
      role: 'ADMIN',
    },
  });

  // 2. Création des Étudiants (8 étudiants)
  const etudiantsData = [
    { nom: 'Alice Tremblay', email: 'alice@etudiant.com' },
    { nom: 'Bob Gagnon', email: 'bob@etudiant.com' },
    { nom: 'Charlie Roy', email: 'charlie@etudiant.com' },
    { nom: 'Diana Bouchard', email: 'diana@etudiant.com' },
    { nom: 'Etienne Gauthier', email: 'etienne@etudiant.com' },
    { nom: 'Fiona Fortin', email: 'fiona@etudiant.com' },
    { nom: 'Gabriel Lavoie', email: 'gabriel@etudiant.com' },
    { nom: 'Helene Morin', email: 'helene@etudiant.com' },
  ];

  const etudiants: Utilisateur[] = [];
  for (const e of etudiantsData) {
    const etudiant = await prisma.utilisateur.upsert({
      where: { email: e.email },
      update: {},
      create: {
        nom: e.nom,
        email: e.email,
        motDePasse: motDePasseHache,
        role: 'ETUDIANT',
      },
    });
    etudiants.push(etudiant);
  }

  // 3. Création des Formateurs (4 formateurs)
  const formateursData = [
    { nom: 'Prof. Jean Dupont', email: 'jean.dupont@formateur.com' },
    { nom: 'Prof. Marie Curie', email: 'marie.curie@formateur.com' },
    { nom: 'Prof. Alan Turing', email: 'alan.turing@formateur.com' },
    { nom: 'Prof. Grace Hopper', email: 'grace.hopper@formateur.com' },
  ];

  const formateurs: Utilisateur[] = [];
  for (const f of formateursData) {
    const formateur = await prisma.utilisateur.upsert({
      where: { email: f.email },
      update: {},
      create: {
        nom: f.nom,
        email: f.email,
        motDePasse: motDePasseHache,
        role: 'FORMATEUR',
      },
    });
    formateurs.push(formateur);
  }

  // 4. Catalogue des Cours et Leçons (7 cours)
  const catalogue = [
    {
      formateurId: formateurs[0]!.id,
      cours: [
        {
          titre: 'Introduction à TypeScript',
          description: 'Apprenez les bases du typage statique en JavaScript.',
          niveauCours: 'DEBUTANT' as const,
          lecons: [
            { ordre: 1, titre: 'Les types primitifs', contenu: 'Introduction aux types string, number, et boolean.' },
            { ordre: 2, titre: 'Interfaces et Types', contenu: 'Définir des structures de données solides.' },
            { ordre: 3, titre: 'Les Generics', contenu: 'Rendre vos fonctions et classes réutilisables.' },
          ],
        },
        {
          titre: 'Node.js et Express Avancé',
          description: 'Créez des API REST sécurisées et performantes.',
          niveauCours: 'INTERMEDIAIRE' as const,
          lecons: [
            { ordre: 1, titre: 'Architecture en couches', contenu: 'Séparer routes, contrôleurs et services.' },
            { ordre: 2, titre: 'Middlewares et JWT', contenu: 'Sécuriser vos routes avec JSON Web Tokens.' },
            { ordre: 3, titre: 'Gestion des erreurs', contenu: 'Centraliser le traitement des exceptions.' },
          ],
        },
      ],
    },
    {
      formateurId: formateurs[1]!.id,
      cours: [
        {
          titre: 'Bases de Données avec Prisma & PostgreSQL',
          description: 'Maîtrisez les ORM modernes et l orchestration des modèles.',
          niveauCours: 'DEBUTANT' as const,
          lecons: [
            { ordre: 1, titre: 'Introduction au Schema Prisma', contenu: 'Définir vos modèles et énumérations.' },
            { ordre: 2, titre: 'Relations entre tables', contenu: 'Gérer le 1-to-N et N-to-N avec clés étrangères.' },
            { ordre: 3, titre: 'Migrations et Client', contenu: 'Appliquer des migrations et exécuter des requêtes.' },
          ],
        },
        {
          titre: 'Développement Web Frontend React',
          description: 'Créez des interfaces réactives et modernes.',
          niveauCours: 'INTERMEDIAIRE' as const,
          lecons: [
            { ordre: 1, titre: 'Composants et Hooks', contenu: 'Comprendre useState, useEffect et JSX.' },
            { ordre: 2, titre: 'Gestion du State Global', contenu: 'Context API et gestion de l authentification.' },
            { ordre: 3, titre: 'Consommation d API avec Axios', contenu: 'Relier le frontend au serveur Node.js.' },
          ],
        },
      ],
    },
    {
      formateurId: formateurs[2]!.id,
      cours: [
        {
          titre: 'Algorithmique et Data Structures',
          description: 'Optimisez vos programmes avec les bonnes structures de données.',
          niveauCours: 'AVANCE' as const,
          lecons: [
            { ordre: 1, titre: 'Analyse de complexité (Big O)', contenu: 'Mesurer le temps d exécution et la mémoire.' },
            { ordre: 2, titre: 'Listes chaînées et Arbres', contenu: 'Structures de données hiérarchiques.' },
            { ordre: 3, titre: 'Algorithmes de tri', contenu: 'QuickSort, MergeSort et recherche binaire.' },
          ],
        },
        {
          titre: 'Bases du DevOps et Docker',
          description: 'Conteneurisez vos applications pour le déploiement.',
          niveauCours: 'INTERMEDIAIRE' as const,
          lecons: [
            { ordre: 1, titre: 'Concepts fondamentaux de Docker', contenu: 'Différence entre VM et conteneurs.' },
            { ordre: 2, titre: 'Écrire un Dockerfile', contenu: 'Créer une image pour Node.js et React.' },
            { ordre: 3, titre: 'Docker Compose', contenu: 'Orchestrer une API, un Frontend et une DB.' },
          ],
        },
      ],
    },
    {
      formateurId: formateurs[3]!.id,
      cours: [
        {
          titre: 'Sécurité Web et OWASP Top 10',
          description: 'Identifiez et corrigez les vulnérabilités courantes des applications web.',
          niveauCours: 'AVANCE' as const,
          lecons: [
            { ordre: 1, titre: 'Injections SQL et XSS', contenu: 'Comprendre et prévenir les failles d injection.' },
            { ordre: 2, titre: 'Gestion des rôles et autorisations', contenu: 'Éviter les escalades de privilèges et la cassure de contrôle d accès.' },
            { ordre: 3, titre: 'Sécurisation des mots de passe', contenu: 'Bonnes pratiques de hachage avec bcrypt et salage.' },
          ],
        },
      ],
    },
  ];

  // 5. Insertion des cours et récupération des instances créées
  const coursCrees: Cours[] = [];

  for (const groupe of catalogue) {
    for (const c of groupe.cours) {
      let coursExistant = await prisma.cours.findFirst({ where: { titre: c.titre } });
      
      if (!coursExistant) {
        coursExistant = await prisma.cours.create({
          data: {
            titre: c.titre,
            description: c.description,
            niveauCours: c.niveauCours,
            formateurId: groupe.formateurId,
            lecons: {
              create: c.lecons,
            },
          },
        });
      }
      coursCrees.push(coursExistant);
    }
  }

  // 6. Création des Inscriptions pour les tests
  const inscriptionsData = [
    // Alice
    { etudiantId: etudiants[0]!.id, coursId: coursCrees[0]!.id, statut: 'EN_COURS' as const, progression: 33.3 },
    { etudiantId: etudiants[0]!.id, coursId: coursCrees[2]!.id, statut: 'TERMINEE' as const, progression: 100.0 },
    // Bob
    { etudiantId: etudiants[1]!.id, coursId: coursCrees[0]!.id, statut: 'TERMINEE' as const, progression: 100.0 },
    { etudiantId: etudiants[1]!.id, coursId: coursCrees[1]!.id, statut: 'EN_COURS' as const, progression: 66.6 },
    { etudiantId: etudiants[1]!.id, coursId: coursCrees[3]!.id, statut: 'EN_COURS' as const, progression: 0.0 },
    // Charlie
    { etudiantId: etudiants[2]!.id, coursId: coursCrees[2]!.id, statut: 'EN_COURS' as const, progression: 50.0 },
    { etudiantId: etudiants[2]!.id, coursId: coursCrees[4]!.id, statut: 'ABANDONNEE' as const, progression: 15.0 },
    // Diana
    { etudiantId: etudiants[3]!.id, coursId: coursCrees[3]!.id, statut: 'TERMINEE' as const, progression: 100.0 },
    { etudiantId: etudiants[3]!.id, coursId: coursCrees[6]!.id, statut: 'EN_COURS' as const, progression: 33.3 },
    // Etienne
    { etudiantId: etudiants[4]!.id, coursId: coursCrees[5]!.id, statut: 'EN_COURS' as const, progression: 20.0 },
  ];

  for (const ins of inscriptionsData) {
    await prisma.inscription.upsert({
      where: {
        etudiantId_coursId: {
          etudiantId: ins.etudiantId,
          coursId: ins.coursId,
        },
      },
      update: {},
      create: {
        etudiantId: ins.etudiantId,
        coursId: ins.coursId,
        statut: ins.statut,
        progression: ins.progression,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });