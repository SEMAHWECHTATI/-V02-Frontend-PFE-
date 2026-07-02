import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export interface DemandeAchatRequest {
  nomMateriel: string;
  categorie: string;
  quantite: number;
  justification: string;
  serviceDemandeur: string;
  niveauUrgence: string;
  coutEstime: number;
  demandeur: string;
  dateDemande: string;
}
@Injectable({
  providedIn: 'root'
})
export class DemandeAchatService {
  private baseUrl = 'http://localhost:8070/api/demandes-achat';

  constructor(private http: HttpClient) {}

  create(payload: DemandeAchatRequest): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  resend(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/send`, {});
  }

  search(statut?: string, demandeur?: string, dateDebut?: string, dateFin?: string): Observable<any[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (demandeur) params = params.set('demandeur', demandeur);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<any[]>(`${this.baseUrl}/search`, { params });
  }
}