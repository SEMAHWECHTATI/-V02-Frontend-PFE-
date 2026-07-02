import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeActionService {
  private api = 'http://localhost:8070/api/demandes-actions';

  constructor(private http: HttpClient) {}

/**
   * 🔄 Récupère les actions (Optionnel : filtrées par ID de technicien)
   */
  getActions(technicienId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (technicienId) {
      // Correspond au @RequestParam(required = false) Long technicienId du Backend
      params = params.set('technicienId', technicienId.toString());
    }
    return this.http.get<any[]>(this.api, { params });
  }

  /**
   * 🚀 Envoie une nouvelle demande d'action au Back-end
   */
  createAction(payload: any): Observable<any> {
    return this.http.post<any>(this.api, payload);
  }

  /**
   * ✅ Valide une action spécifique (Appelle le PUT /api/demandes-actions/{id}/valider)
   */
  validerAction(id: number): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/valider`, {});
  }

  /**
   * ❌ Rejette une action spécifique (Appelle le PUT /api/demandes-actions/{id}/rejeter)
   */
  rejeterAction(id: number): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/rejeter`, {});
  }
}