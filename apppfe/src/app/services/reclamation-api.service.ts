import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReclamationRequest {
  equipement: string;
  referenceArticle?: string;
  numeroSerie?: string;
  localisation?: string;
  serviceDemandeur?: string;
  symptomes: string;
  historique?: string;
  stockInfo?: string;
  criticite?: string;
  declarant?: string;
  langueRapport?: string;
}

@Injectable({ providedIn: 'root' })
export class ReclamationApiService {
  private baseUrl = 'http://localhost:8070/api/reclamations';

  constructor(private http: HttpClient) {}

  genererRapport(payload: ReclamationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/generer-rapport`, payload);
  }

  telechargerPdf(rapportId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/rapport/${rapportId}/pdf`, {
      responseType: 'blob'
    });
  }
}