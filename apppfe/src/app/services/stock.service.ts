import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockDTO } from '../Model/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = 'http://localhost:8070/api/inventory/stocks';

  constructor(private http: HttpClient) { }

  /**
   * 📊 Créer une entrée de stock pour un article spécifique
   */
  creerStock(articleId: number, stock: StockDTO): Observable<StockDTO> {
    return this.http.post<StockDTO>(`${this.apiUrl}/article/${articleId}`, stock);
  }

  /**
   * 🔄 Mettre à jour directement la quantité en stock (Ajustement/Inventaire)
   */
  mettreAJourQuantite(stockId: number, nouvelleQuantite: number): Observable<{ message: string }> {
    const params = new HttpParams().set('nouvelleQuantite', nouvelleQuantite.toString());
    return this.http.put<{ message: string }>(`${this.apiUrl}/${stockId}/quantite`, {}, { params });
  }

  /**
   * ⚠️ Récupérer la liste des stocks en état de faiblesse ou critique
   */
  getStocksFaibles(): Observable<StockDTO[]> {
    return this.http.get<StockDTO[]>(`${this.apiUrl}/faibles`);
  }

  /**
 * 📋 Récupérer l'intégralité du stock physique
 */
getAllStocks(): Observable<StockDTO[]> {
  return this.http.get<StockDTO[]>(this.apiUrl); 
  // Envoie une requête GET sur http://localhost:8070/api/inventory/stocks
}
}