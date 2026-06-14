export enum MethodeValuation {
  FIFO = 'FIFO',                // Premier entré, premier sorti
  LIFO = 'LIFO',                // Dernier entré, premier sorti
  CMP = 'CMP',                  // Coût moyen pondéré
  PRIX_COURANT = 'PRIX_COURANT' // Prix courant du marché
}

export interface ValuationArticle {
  articleId: string;
  methode: MethodeValuation;
  
  // Valeurs
  prixUnitaire: number;
  prixMoyenPondere: number;
  valeurBrutale: number;        // quantite * prix
  valeurNette: number;          // Après dépréciation
  
  // Historique
  dateEvaluation: Date;
  prochainREvaluation: Date;
  taux_depreciation: number;    // % par an (ex: 20% pour informatique)
}

export interface InventaireValeur {
  id: string;
  dateCreation: Date;
  
  // Totaux
  valeurTotaleBrutale: number;
  valeurTotaleNette: number;
  nombreArticles: number;
  nombreReferences: number;
  
  // Détails
  articles: ValuationArticle[];
  
  // Rapport
  dateDerniereEvaluation: Date;
  evaluePar: string;
}