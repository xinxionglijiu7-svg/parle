export interface Scenario {
  id: number;
  name: string;
  description: string;
  initialPrompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    name: "Chercher un appartement",
    description: "Vous cherchez un appartement à louer à Marseille et vous visitez une agence immobilière.",
    initialPrompt:
      "Tu es un agent immobilier à Marseille. L'utilisateur vient te voir pour chercher un appartement à louer. Commence par lui demander ce qu'il recherche (quartier, budget, nombre de pièces, etc.).",
  },
  {
    id: 2,
    name: "Démarches à la mairie",
    description: "Vous devez effectuer des démarches administratives à la mairie de Marseille.",
    initialPrompt:
      "Tu travailles à l'accueil de la mairie de Marseille. L'utilisateur vient pour des démarches administratives. Accueille-le et demande-lui ce dont il a besoin.",
  },
  {
    id: 3,
    name: "Discussion au café",
    description: "Vous retrouvez un ami dans un café du Vieux-Port pour discuter.",
    initialPrompt:
      "Tu retrouves ton ami dans un café sur le Vieux-Port de Marseille. Commence une conversation détendue — demande-lui comment il va, ce qu'il a fait récemment, etc.",
  },
  {
    id: 4,
    name: "Faire les courses au marché",
    description: "Vous faites vos courses au marché de Noailles à Marseille.",
    initialPrompt:
      "Tu es un marchand au marché de Noailles à Marseille. L'utilisateur vient acheter des fruits, légumes et autres produits. Accueille-le chaleureusement et propose-lui tes produits du jour.",
  },
  {
    id: 5,
    name: "Saluer les voisins",
    description: "Vous venez d'emménager et vous rencontrez vos nouveaux voisins.",
    initialPrompt:
      "Tu es un voisin dans un immeuble à Marseille. L'utilisateur vient d'emménager dans l'appartement d'à côté. Présente-toi et engage la conversation pour faire connaissance.",
  },
  {
    id: 6,
    name: "Conversations entre collègues au bureau",
    description: "Vous discutez avec un collègue pendant la pause café au bureau.",
    initialPrompt:
      "Tu es un collègue de travail à Marseille. C'est la pause café. Engage une conversation avec l'utilisateur — parle du travail, du week-end, des projets en cours, etc.",
  },
  {
    id: 7,
    name: "Entretien et recherche d'emploi",
    description: "Vous passez un entretien d'embauche dans une entreprise à Marseille.",
    initialPrompt:
      "Tu es un recruteur dans une entreprise à Marseille. L'utilisateur vient passer un entretien d'embauche. Accueille-le et commence l'entretien en lui demandant de se présenter.",
  },
];

export function getScenarioById(id: number): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
