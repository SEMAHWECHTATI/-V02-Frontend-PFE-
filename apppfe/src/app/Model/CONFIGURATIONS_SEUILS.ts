import { Article } from "./article";
import { MethodeValuation } from "./VALUATION_FINANCES";

export interface ConfigurationSeuils {
  id: string;
  
  // Seuils globaux (par défaut)
  seuilMinimumDefaut: number;
  seuilCritiqueDefaut: number;
  
  // Méthodes
  methodeValuationDefaut: MethodeValuation;
  tauxDepreciationDefaut: number;
  
  // Délai alertes
  delaiAvertissement: number;   // Jours avant expiration
  
  // Paramètres
  autoriserStockNegatif: boolean;
  genererAlerteAutomatique: boolean;
  demandeConfirmationSortie: boolean;
  
  dateCreation: Date;
  dateModification: Date;
  modifiePar: string;
}

export interface StatistiquesStock {
  dateGeneree: Date;
  
  // Quantités
  totalArticles: number;
  totalQuantite: number;
  articlesEnRupture: number;
  articlesStockFaible: number;
  
  // Finances
  valeurTotaleBrutale: number;
  valeurTotaleNette: number;
  valeurEnReparation: number;
  valeurARecycler: number;
  
  // Mouvements
  nombreMouvementsJour: number;
  nombreMouvementsMois: number;
  nombreAlertes: number;
  
  // Top articles
  topArticlesValeur: Article[];
  topArticlesConsommation: Article[];
}