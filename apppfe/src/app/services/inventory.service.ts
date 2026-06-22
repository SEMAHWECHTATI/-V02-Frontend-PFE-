import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../Model/article';
import { Stock } from '../Model/stock';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private http = inject(HttpClient); // Utilisation d'inject() moderne (optionnel, selon vos préférences)

  private apiUrl = 'http://localhost:8070/api/inventory';
  private apiConsommationsUrl = 'http://localhost:8070/api/consommations-pieces';
  private apiUrlarticles = 'http://localhost:8070/api/inventory/articles';

  constructor() { }

  getToutesLesConsommations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiConsommationsUrl);
  }



 
  /**
   * Récupère l'historique d'évolution pour le graphique
   */
  getEvolutionFinanciere(dateDebut: string, dateFin: string): Observable<{ labels: string[], valeurs: number[] }> {
    return this.http.get<{ labels: string[], valeurs: number[] }>(
      `${this.apiUrlarticles}/inventory/evolution-financiere?dateDebut=${dateDebut}&dateFin=${dateFin}`
    );
  }

  /**
   * ➕ POST : Enregistrer une nouvelle consommation de pièce (Ex: lors de la résolution)
   * URL correspondante : POST http://localhost:8070/api/consommations-pieces
   */
  creerConsommation(consommationPayload: any): Observable<any> {
    return this.http.post<any>(this.apiConsommationsUrl, consommationPayload);
  }

  /**
   * 🔍 GET : Récupérer toutes les pièces consommées sur un ticket spécifique via sa référence
   * URL correspondante : GET http://localhost:8070/api/consommations-pieces/ticket/{reference}
   */
  getConsommationsParTicket(referenceTicket: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiConsommationsUrl}/ticket/${referenceTicket}`);
  }


  /**
   * 🗑️ DELETE : Annuler ou supprimer une consommation par son ID unique
   * URL correspondante : DELETE http://localhost:8070/api/consommations-pieces/{id}
   */
  supprimerConsommation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiConsommationsUrl}/${id}`);
  }


  /**
 * Récupère la valeur financière cumulée groupée par type d'article
 * Cible : GET /api/inventory/articles/inventory/valeur-par-type
 */
getValueByType(): Observable<any> {
  return this.http.get<any>(`${this.apiUrlarticles}/inventory/valeur-par-type`);
}
  // ==========================================
  // 📋 ARTICLES
  // ==========================================

  creerArticle(article: Article): Observable<any> {
    console.log('📝 Création article:', article.designation);
    return this.http.post(`${this.apiUrl}/articles`, article);
  }

 enregistrerEntreeStock(articleId: number, stockPayload: any): Observable<any> {
    console.log(`📦 Envoi du stock DTO pour l'article ID ${articleId}`);
    return this.http.post(`${this.apiUrl}/stocks/article/${articleId}`, stockPayload);
  }


  modifierArticle(id: number, article: Article): Observable<any> {
    console.log('✏️ Modification article:', id);
    return this.http.put(`${this.apiUrl}/articles/${id}`, article);
  }

  getAllArticles(): Observable<any> {
    console.log('📋 Récupération tous les articles');
    return this.http.get(`${this.apiUrl}/articles`);
  }

  getArticleById(id: number): Observable<any> {
    console.log('🔍 Récupération article:', id);
    return this.http.get(`${this.apiUrl}/articles/${id}`);
  }

  getArticleByReference(reference: string): Observable<any> {
    console.log('🔍 Recherche référence:', reference);
    return this.http.get(`${this.apiUrl}/articles/reference/${reference}`);
  }

  getArticleByCodeBarres(codeBarres: string): Observable<any> {
    console.log('🔍 Recherche code-barres:', codeBarres);
    return this.http.get(`${this.apiUrl}/articles/barcode/${codeBarres}`);
  }

  getArticlesWithLowStock(): Observable<any> {
    console.log('⚠️ Récupération articles stock faible');
    return this.http.get(`${this.apiUrl}/articles/stock/faible`);
  }

  getArticlesWithCriticalStock(): Observable<any> {
    console.log('🔴 Récupération articles stock critique');
    return this.http.get(`${this.apiUrl}/articles/stock/critique`);
  }

  getTotalInventoryValue(): Observable<any> {
    console.log('💰 Récupération valeur totale');
    return this.http.get(`${this.apiUrl}/articles/inventory/valeur-totale`);
  }

  getInventoryStatistics(): Observable<any> {
    console.log('📊 Récupération statistiques');
    return this.http.get(`${this.apiUrl}/articles/inventory/statistiques`);
  }

  searchArticles(keyword: string): Observable<any> {
    console.log('🔍 Recherche articles:', keyword);
    let params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/articles/search`, { params });
  }

  archiveArticle(id: number): Observable<any> {
    console.log('🗑️ Archivage article:', id);
    return this.http.delete(`${this.apiUrl}/articles/${id}/archive`);
  }

  // ==========================================
  // 📊 STOCKS
  // ==========================================

  creerStock(articleId: number, stock: Stock): Observable<any> {
    console.log('📊 Création stock');
    return this.http.post(`${this.apiUrl}/stocks?articleId=${articleId}`, stock);
  }

  mettreAJourStock(id: number, stock: Stock): Observable<any> {
    console.log('🔄 Mise à jour stock:', id);
    return this.http.put(`${this.apiUrl}/stocks/${id}`, stock);
  }

  getAllStocks(): Observable<any> {
    console.log('📊 Récupération tous les stocks');
    return this.http.get(`${this.apiUrl}/stocks`);
  }

  getStockByArticleId(articleId: number): Observable<any> {
    console.log('📊 Récupération stock article:', articleId);
    return this.http.get(`${this.apiUrl}/stocks/article/${articleId}`);
  }

  mettreAJourQuantite(stockId: number, quantite: number): Observable<any> {
  let params = new HttpParams().set('quantite', quantite.toString()); // ❌ 'quantite' au lieu de 'nouvelleQuantite'
  return this.http.put(`${this.apiUrl}/stocks/${stockId}/quantite`, {}, { params });
}

// Exemple dans votre inventory.service.ts
augmenterQuantite(stockId: number, quantite: number): Observable<any> {
  console.log(`📊 Service - Augmentation quantité pour le Stock ID: ${stockId}, Qté: ${quantite}`);
  
  // 🎯 Option 1 : Si votre backend attend un paramètre URL (?quantite=X)
  return this.http.put(`${this.apiUrl}/stocks/${stockId}/augmenter?quantite=${quantite}`, {});

  // 🎯 Option 2 (À tester si l'Option 1 donne un 404) : Si le backend utilise une URL différente, ex :
  // return this.http.put(`${this.apiUrl}/stocks/augmenter/${stockId}`, { quantite });
}
  diminuerQuantite(stockId: number, quantite: number): Observable<any> {
  let params = new HttpParams().set('quantite', quantite.toString()); // 🔄 OK ! Correspond au @RequestParam Integer quantite
  return this.http.put(`${this.apiUrl}/stocks/${stockId}/diminuer`, {}, { params });
}

  getStocksFaibles(): Observable<any> {
    console.log('⚠️ Récupération stocks faibles');
    return this.http.get(`${this.apiUrl}/stocks/status/faible`);
  }

  getStocksCritiques(): Observable<any> {
    console.log('🔴 Récupération stocks critiques');
    return this.http.get(`${this.apiUrl}/stocks/status/critique`);
  }

  // ==========================================
  // 🔄 MOUVEMENTS (Alignés sur MouvementStockController)
  // ==========================================

  enregistrerEntree(payload: { stockId: number; quantite: number; justification: string; responsableId: number; referenceTicket?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mouvements/entree`, payload);
  }

  enregistrerSortie(payload: { stockId: number; quantite: number; justification: string; responsableId: number; referenceTicket?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mouvements/sortie`, payload);
  }

  enregistrerTransfert(payload: { stockId: number; quantite: number; locSource: string; locDest: string; justification: string; responsableId: number; referenceTicket?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mouvements/transfert`, payload);
  }

  lierMouvementATicket(id: number, referenceTicket: string): Observable<any> {
    const params = new HttpParams().set('referenceTicket', referenceTicket);
    return this.http.put<any>(`${this.apiUrl}/mouvements/${id}/lier-ticket`, {}, { params });
  }

  getHistoriqueMouvements(stockId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mouvements/historique/${stockId}`);
  }

  getMouvementsPeriod(debut: string, fin: string): Observable<any[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<any[]>(`${this.apiUrl}/mouvements/period`, { params });
  }
  // ==========================================
  // ⚠️ ALERTES
  // ==========================================

  getAlerteNonTraitees(): Observable<any> {
    console.log('⚠️ Récupération alertes non traitées');
    return this.http.get(`${this.apiUrl}/alertes/non-traitees`);
  }

  getAlerteCritique(): Observable<any> {
    console.log('🔴 Récupération alertes critiques');
    return this.http.get(`${this.apiUrl}/alertes/critiques`);
  }

  marquerCommeLue(alerteId: number): Observable<any> {
    console.log('👁️ Marquage alerte lue:', alerteId);
    return this.http.put(`${this.apiUrl}/alertes/${alerteId}/marquer-lue`, {});
  }

  marquerCommeTraitee(alerteId: number): Observable<any> {
    console.log('✅ Marquage alerte traitée:', alerteId);
    return this.http.put(`${this.apiUrl}/alertes/${alerteId}/marquer-traitee`, {});
  }

  getAlertesDashboard(): Observable<any> {
    console.log('📊 Récupération dashboard alertes');
    return this.http.get(`${this.apiUrl}/alertes/dashboard`);
  }
}