export interface KPIInterventionDTO {
  totalInterventions: number;
  tempsMoyenResolution: number; // En heures
  tauxCloture: number;         // En pourcentage
  interventionsEnRetardSLA: number;
  interventionsParPeriode: {
    jour: number;
    semaine: number;
    mois: number;
  };
  repartitionParDomaine: Record<string, number>;   // Clé : Nom Catégorie, Valeur : Count
  repartitionParDemandeur: Record<string, number>; // Clé : Nom + Prénom, Valeur : Count
  tempsMoyenParDomaine: Record<string, number>;    // Clé : Nom Catégorie, Valeur : Moyenne
  tempsMoyenParTechnicien: Record<string, number>; // Clé : Email, Valeur : Moyenne
}

export interface KPIInventoryDTO {
  rotationStock: number;
  tauxDisponibilite: number;
  valeurTotalePatrimoineIT: number;
  articlesEnRupture: number;
  tauxUtilisationMateriel: number;
}

export interface KPIPerformanceDTO {
  interventionsParTechnicien: Record<string, number>; // Clé : Email, Valeur : Count
  domaineLePlusDemande: string;
  coutMoyenIntervention: number;
  scoreSatisfactionMoyen: number;
}