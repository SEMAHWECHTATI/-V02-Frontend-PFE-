export interface Article {
  id?: number;
  reference: string;
  designation: string;
  description?: string;
  codeBarres?: string;
  typeArticle: TypeArticle;
  statut: StatutArticle;
  quantiteEnStock: number;
  prixUnitaire: number;
  fournisseur?: string;
  dateAchat?: Date;
  dateGarantie?: Date;
  seuilMinimum: number;
  seuilCritique: number;
  localisationId?: number;
  localisationLabel?: string;
  dateCreation?: Date;
  dateModification?: Date;
  valeurTotal?: number;
}

export enum TypeArticle {
  PIECE_RECHANGE = 'PIECE_RECHANGE',
  CONSOMMABLE = 'CONSOMMABLE',
  EQUIPEMENT = 'EQUIPEMENT',
  RESEAU = 'RESEAU',
  SERVEUR = 'SERVEUR',
  MATERIEL_ROULANT = 'MATERIEL_ROULANT',
  PERIPHERIQUE = 'PERIPHERIQUE'
}

export enum StatutArticle {
  ACTIF = 'ACTIF',
  EN_REPARATION = 'EN_REPARATION',
  EN_PANNE = 'EN_PANNE',
  ARCHIVÉ = 'ARCHIVÉ',
  A_RECYCLER = 'A_RECYCLER',
  OBSOLETE = 'OBSOLETE',
  RUPTURE = 'RUPTURE'
}

export const TypeArticleLabels: { [key in TypeArticle]: string } = {
  [TypeArticle.PIECE_RECHANGE]: 'Pièce de rechange',
  [TypeArticle.CONSOMMABLE]: 'Consommable',
  [TypeArticle.EQUIPEMENT]: 'Équipement',
  [TypeArticle.RESEAU]: 'Équipement réseau',
  [TypeArticle.SERVEUR]: 'Serveur',
  [TypeArticle.MATERIEL_ROULANT]: 'Matériel roulant',
  [TypeArticle.PERIPHERIQUE]: 'Périphérique'
};

export const StatutArticleLabels: { [key in StatutArticle]: string } = {
  [StatutArticle.ACTIF]: 'Actif',
  [StatutArticle.EN_REPARATION]: 'En réparation',
  [StatutArticle.EN_PANNE]: 'En panne',
  [StatutArticle.ARCHIVÉ]: 'Archivé',
  [StatutArticle.A_RECYCLER]: 'À recycler',
  [StatutArticle.OBSOLETE]: 'Obsolète',
  [StatutArticle.RUPTURE]: 'Rupture de stock'
};

export interface DemandeMateriel {
  nomDemandeur: string;
  email: string;
  telephone: string;
  departement: string;
  typeMateriel: string;
  sousTypeMateriel?: string;
  descriptionMateriel: string;
  quantite: number;
  estimBudget: number;
  justification: string;
  dateNecessite: string;
  urgent: boolean;
  piecesJointes?: File[];
  dateCreation?: Date;
  statut?: string;
}