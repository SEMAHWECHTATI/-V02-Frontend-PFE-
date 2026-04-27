import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../Model/article';
import { Stock } from '../Model/stock';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = 'http://localhost:8070/api/inventory';

  constructor(private http: HttpClient) { }

  // ==========================================
  // 📋 ARTICLES
  // ==========================================

  /**
   * ✅ Créer article
   */
  creerArticle(article: Article): Observable<any> {
    console.log('📝 Création article:', article.designation);
    return this.http.post(`${this.apiUrl}/articles`, article);
  }

  /**
   * ✅ Modifier article
   */
  modifierArticle(id: number, article: Article): Observable<any> {
    console.log('✏️ Modification article:', id);
    return this.http.put(`${this.apiUrl}/articles/${id}`, article);
  }

  /**
   * ✅ Récupérer tous les articles
   */
  getAllArticles(): Observable<any> {
    console.log('📋 Récupération tous les articles');
    return this.http.get(`${this.apiUrl}/articles`);
  }

  /**
   * ✅ Récupérer article par ID
   */
  getArticleById(id: number): Observable<any> {
    console.log('🔍 Récupération article:', id);
    return this.http.get(`${this.apiUrl}/articles/${id}`);
  }

  /**
   * ✅ Rechercher par référence
   */
  getArticleByReference(reference: string): Observable<any> {
    console.log('🔍 Recherche référence:', reference);
    return this.http.get(`${this.apiUrl}/articles/reference/${reference}`);
  }

  /**
   * ✅ Rechercher par code-barres
   */
  getArticleByCodeBarres(codeBarres: string): Observable<any> {
    console.log('🔍 Recherche code-barres:', codeBarres);
    return this.http.get(`${this.apiUrl}/articles/barcode/${codeBarres}`);
  }

  /**
   * ✅ Articles avec stock faible
   */
  getArticlesWithLowStock(): Observable<any> {
    console.log('⚠️ Récupération articles stock faible');
    return this.http.get(`${this.apiUrl}/articles/stock/faible`);
  }

  /**
   * ✅ Articles avec stock critique
   */
  getArticlesWithCriticalStock(): Observable<any> {
    console.log('🔴 Récupération articles stock critique');
    return this.http.get(`${this.apiUrl}/articles/stock/critique`);
  }

  /**
   * ✅ Valeur totale inventaire
   */
  getTotalInventoryValue(): Observable<any> {
    console.log('💰 Récupération valeur totale');
    return this.http.get(`${this.apiUrl}/articles/inventory/valeur-totale`);
  }

  /**
   * ✅ Statistiques inventaire
   */
  getInventoryStatistics(): Observable<any> {
    console.log('📊 Récupération statistiques');
    return this.http.get(`${this.apiUrl}/articles/inventory/statistiques`);
  }

  /**
   * ✅ Rechercher articles
   */
  searchArticles(keyword: string): Observable<any> {
    console.log('🔍 Recherche articles:', keyword);
    let params = new HttpParams().set('keyword', keyword);
    return this.http.get(`${this.apiUrl}/articles/search`, { params });
  }

  /**
   * ✅ Archiver article
   */
  archiveArticle(id: number): Observable<any> {
    console.log('🗑️ Archivage article:', id);
    return this.http.delete(`${this.apiUrl}/articles/${id}/archive`);
  }

  // ==========================================
  // 📊 STOCKS
  // ==========================================

  /**
   * ✅ Créer stock
   */
  creerStock(articleId: number, stock: Stock): Observable<any> {
    console.log('📊 Création stock');
    return this.http.post(`${this.apiUrl}/stocks?articleId=${articleId}`, stock);
  }

  /**
   * ✅ Mettre à jour stock
   */
  mettreAJourStock(id: number, stock: Stock): Observable<any> {
    console.log('🔄 Mise à jour stock:', id);
    return this.http.put(`${this.apiUrl}/stocks/${id}`, stock);
  }

  /**
   * ✅ Récupérer tous les stocks
   */
  getAllStocks(): Observable<any> {
    console.log('📊 Récupération tous les stocks');
    return this.http.get(`${this.apiUrl}/stocks`);
  }

  /**
   * ✅ Récupérer stock par article
   */
  getStockByArticleId(articleId: number): Observable<any> {
    console.log('📊 Récupération stock article:', articleId);
    return this.http.get(`${this.apiUrl}/stocks/article/${articleId}`);
  }

  /**
   * ✅ Mettre à jour quantité
   */
  mettreAJourQuantite(stockId: number, quantite: number): Observable<any> {
    console.log('🔄 Mise à jour quantité:', quantite);
    let params = new HttpParams().set('quantite', quantite.toString());
    return this.http.put(`${this.apiUrl}/stocks/${stockId}/quantite`, {}, { params });
  }

  /**
   * ✅ Augmenter quantité
   */
  augmenterQuantite(stockId: number, quantite: number): Observable<any> {
    console.log('➕ Augmentation quantité:', quantite);
    let params = new HttpParams().set('quantite', quantite.toString());
    return this.http.put(`${this.apiUrl}/stocks/${stockId}/augmenter`, {}, { params });
  }

  /**
   * ✅ Diminuer quantité
   */
  diminuerQuantite(stockId: number, quantite: number): Observable<any> {
    console.log('➖ Diminution quantité:', quantite);
    let params = new HttpParams().set('quantite', quantite.toString());
    return this.http.put(`${this.apiUrl}/stocks/${stockId}/diminuer`, {}, { params });
  }

  /**
   * ✅ Stocks faibles
   */
  getStocksFaibles(): Observable<any> {
    console.log('⚠️ Récupération stocks faibles');
    return this.http.get(`${this.apiUrl}/stocks/status/faible`);
  }

  /**
   * ✅ Stocks critiques
   */
  getStocksCritiques(): Observable<any> {
    console.log('🔴 Récupération stocks critiques');
    return this.http.get(`${this.apiUrl}/stocks/status/critique`);
  }

  // ==========================================
  // 🔄 MOUVEMENTS
  // ==========================================

  /**
   * 📥 Enregistrer entrée
   */
  enregistrerEntree(stockId: number, quantite: number, justification: string): Observable<any> {
    console.log('📥 Enregistrement entrée');
    let params = new HttpParams()
      .set('stockId', stockId.toString())
      .set('quantite', quantite.toString())
      .set('justification', justification);
    return this.http.post(`${this.apiUrl}/mouvements/entree`, {}, { params });
  }

  /**
   * 📤 Enregistrer sortie
   */
  enregistrerSortie(stockId: number, quantite: number, justification: string): Observable<any> {
    console.log('📤 Enregistrement sortie');
    let params = new HttpParams()
      .set('stockId', stockId.toString())
      .set('quantite', quantite.toString())
      .set('justification', justification);
    return this.http.post(`${this.apiUrl}/mouvements/sortie`, {}, { params });
  }

  /**
   * 🔄 Enregistrer transfert
   */
  enregistrerTransfert(stockId: number, quantite: number, locSource: string, 
                       locDest: string, justification: string): Observable<any> {
    console.log('🔄 Enregistrement transfert');
    let params = new HttpParams()
      .set('stockId', stockId.toString())
      .set('quantite', quantite.toString())
      .set('locSource', locSource)
      .set('locDest', locDest)
      .set('justification', justification);
    return this.http.post(`${this.apiUrl}/mouvements/transfert`, {}, { params });
  }

  /**
   * 🔗 Lier mouvement à ticket
   */
  lierMouvementATicket(mouvementId: number, referenceTicket: string): Observable<any> {
    console.log('🔗 Liaison mouvement ticket:', referenceTicket);
    let params = new HttpParams().set('referenceTicket', referenceTicket);
    return this.http.put(`${this.apiUrl}/mouvements/${mouvementId}/lier-ticket`, {}, { params });
  }

  /**
   * 📋 Historique mouvements
   */
  getHistoriqueMouvements(stockId: number): Observable<any> {
    console.log('📋 Récupération historique mouvements');
    return this.http.get(`${this.apiUrl}/mouvements/historique/${stockId}`);
  }

  // ==========================================
  // ⚠️ ALERTES
  // ==========================================

  /**
   * ⚠️ Alertes non traitées
   */
  getAlerteNonTraitees(): Observable<any> {
    console.log('⚠️ Récupération alertes non traitées');
    return this.http.get(`${this.apiUrl}/alertes/non-traitees`);
  }

  /**
   * 🔴 Alertes critiques
   */
  getAlerteCritique(): Observable<any> {
    console.log('🔴 Récupération alertes critiques');
    return this.http.get(`${this.apiUrl}/alertes/critiques`);
  }

  /**
   * 👁️ Marquer alerte comme lue
   */
  marquerCommeLue(alerteId: number): Observable<any> {
    console.log('👁️ Marquage alerte lue:', alerteId);
    return this.http.put(`${this.apiUrl}/alertes/${alerteId}/marquer-lue`, {});
  }

  /**
   * ✅ Marquer alerte comme traitée
   */
  marquerCommeTraitee(alerteId: number): Observable<any> {
    console.log('✅ Marquage alerte traitée:', alerteId);
    return this.http.put(`${this.apiUrl}/alertes/${alerteId}/marquer-traitee`, {});
  }

  /**
   * 📊 Dashboard alertes
   */
  getAlertesDashboard(): Observable<any> {
    console.log('📊 Récupération dashboard alertes');
    return this.http.get(`${this.apiUrl}/alertes/dashboard`);
  }
}