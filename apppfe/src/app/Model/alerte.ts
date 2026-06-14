export interface Alerte {
  id?: number;
  type: TypeAlerte;
  message: string;
  severite: Severite;
  statut: StatutAlerte;
  dateCreation?: Date;
  dateAcquittement?: Date;
  articleIds?: number[];
  articleDesignations?: string[];
}

export enum TypeAlerte {
  RUPTURE_STOCK = 'RUPTURE_STOCK',
  SEUIL_CRITIQUE = 'SEUIL_CRITIQUE',
  SEUIL_MINIMUM = 'SEUIL_MINIMUM',
  EXPIRATION = 'EXPIRATION',
  AUTRE = 'AUTRE'
}

export enum Severite {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  CRITIQUE = 'CRITIQUE'
}

export interface DashboardFinance {
  valeurGlobale: number;
  totalStocksFaibles: number;
  totalRuptures: number;
}

export enum StatutAlerte {
  NOUVELLE = 'NOUVELLE',
  LUE = 'LUE',
  TRAITEE = 'TRAITEE'
}