export const mockTasks = [
  {
    id: 1,
    title: "Préparation du sol pour la saison",
    description: "Préparer les champs pour les nouvelles plantations",
    type: "collective",
    assignee: "Marie Dupont",
    status: "in-progress",
    progress: 60,
    comments: ["Sol presque prêt", "Engrais à ajouter"],
    createdAt: "2024-01-15",
    dueDate: "2024-02-01"
  },
  {
    id: 2,
    title: "Commander les semences",
    description: "Commander les semences bio pour le printemps",
    type: "personal",
    assignee: "Vous",
    status: "pending",
    progress: 0,
    comments: [],
    createdAt: "2024-01-10",
    dueDate: "2024-01-25"
  },
  {
    id: 3,
    title: "Réunion d'équipe hebdomadaire",
    description: "Point sur l'avancement des projets en cours",
    type: "collective",
    assignee: "Toute l'équipe",
    status: "completed",
    progress: 100,
    comments: ["Réunion productive", "Nouveaux objectifs définis"],
    createdAt: "2024-01-08",
    dueDate: "2024-01-12"
  },
  {
    id: 4,
    title: "Maintenance des équipements",
    description: "Vérifier et entretenir le matériel agricole",
    type: "personal",
    assignee: "Pierre Martin",
    status: "in-progress",
    progress: 30,
    comments: ["Tracteur en révision"],
    createdAt: "2024-01-05",
    dueDate: "2024-01-30"
  },
  {
    id: 5,
    title: "Analyse du sol - Parcelle Nord",
    description: "Effectuer l'analyse complète du sol de la parcelle Nord avant plantation",
    type: "personal",
    assignee: "Sophie Lambert",
    status: "pending",
    progress: 0,
    comments: [],
    createdAt: "2024-01-20",
    dueDate: "2024-02-05"
  },
  {
    id: 6,
    title: "Installation système d'irrigation",
    description: "Installer le nouveau système d'irrigation automatisé",
    type: "collective",
    assignee: "Équipe technique",
    status: "in-progress",
    progress: 45,
    comments: ["Matériel livré", "Installation en cours"],
    createdAt: "2024-01-18",
    dueDate: "2024-02-10"
  }
];

export const teamMembers = [
  "Vous",
  "Marie Dupont",
  "Pierre Martin",
  "Sophie Lambert",
  "Alice Moreau",
  "Équipe technique",
  "Toute l'équipe"
];
