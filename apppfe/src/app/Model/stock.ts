export interface Stock {
  id?: number;
  codeBarresArticle?: string;
  quantiteEnStock: number;
  quantiteCritique: number;
  quantiteMinimum: number;
  prixUnitaire: number;
  articleId: number;
  articleReference?: string;
  articleDesignation?: string;
  articleTypeArticle?: string;
  articleStatut?: string;
  valeurTotale?: number;
  estFaible?: boolean;
  estCritique?: boolean;
}

export interface StockDTO {
  id?: number;
  codeBarresArticle: string;
  quantiteEnStock: number;
  quantiteMinimum: number;
  quantiteCritique: number;
  prixUnitaire: number;
  
  // Relations issues du mapping Article
  articleId: number;
  articleReference?: string;
  articleDesignation?: string;
  articleTypeArticle?: string;
  articleStatut?: string;
  
  // Champs calculés par le backend
  valeurTotale?: number;
  estFaible?: boolean;
  estCritique?: boolean;
}