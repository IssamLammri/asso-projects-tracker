import { initDb, getDb } from './src/server/db.js';

initDb();
const db = getDb();

const projects = [
  {
    title: 'Achat de tapis pour la mosquée',
    description: 'Remplacement des anciens tapis de la salle de prière principale par des tapis de haute qualité, confortables et durables.',
    image: 'https://picsum.photos/seed/mosque-carpet/800/600',
    goal_amount: 20000,
    start_date: '2026-05-01',
    status: 'en cours'
  },
  {
    title: 'Achat d\'un véhicule pour le service de l\'association',
    description: 'Acquisition d\'un véhicule utilitaire pour faciliter les déplacements, le transport de matériel et l\'organisation des événements.',
    image: 'https://picsum.photos/seed/van/800/600',
    goal_amount: 15000,
    start_date: '2026-04-15',
    status: 'en cours'
  },
  {
    title: 'Travaux de rénovation des sanitaires',
    description: 'Rénovation complète des espaces d\'ablution pour offrir un meilleur confort aux fidèles.',
    image: 'https://picsum.photos/seed/renovation/800/600',
    goal_amount: 35000,
    start_date: '2026-01-10',
    status: 'terminé'
  }
];

const insertProject = db.prepare('INSERT INTO projects (title, description, image, goal_amount, start_date, status) VALUES (?, ?, ?, ?, ?, ?)');

projects.forEach(p => {
  const info = insertProject.run(p.title, p.description, p.image, p.goal_amount, p.start_date, p.status);
  const projectId = info.lastInsertRowid;

  if (p.title === 'Achat de tapis pour la mosquée') {
    const insertCollection = db.prepare('INSERT INTO collections (project_id, amount, date, description, source) VALUES (?, ?, ?, ?, ?)');
    insertCollection.run(projectId, 1250, '2026-05-02', 'Collecte après la prière du vendredi', 'Fidèles');
    insertCollection.run(projectId, 500, '2026-05-05', 'Don d\'un adhérent', 'Virement bancaire');
    insertCollection.run(projectId, 2000, '2026-05-10', 'Collecte événement', 'Dîner de charité');
  }

  if (p.title === 'Travaux de rénovation des sanitaires') {
    const insertCollection = db.prepare('INSERT INTO collections (project_id, amount, date, description, source) VALUES (?, ?, ?, ?, ?)');
    insertCollection.run(projectId, 35000, '2026-02-20', 'Clôture du financement', 'Divers');
  }
});

console.log('Database seeded successfully.');
