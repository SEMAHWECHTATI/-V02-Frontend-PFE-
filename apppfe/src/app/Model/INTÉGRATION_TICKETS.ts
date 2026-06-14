import { StatutArticle } from "./article";

export interface ArticleConsomme {
  articleId: string;
  quantite: number;
  numeroSerie?: string;
  statut: StatutArticle;
  dateConsommation: Date;
  justification: string;
}

export interface IntegrationTicket {
  ticketId: string;
  articleConsommes: ArticleConsomme[];
  
  // Valeur consommée
  valeurTotaleConsommee: number;
  
  // Dates
  dateConsommation: Date;
  dateClotureTicket: Date;
  
  // Responsabilité
  enregistrePar: string;
  confirmePar?: string;
}