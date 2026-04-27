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