import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Localisation } from '../Model/Entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalisationService {

// Ajuste le port selon ton backend (8070 d'après tes commentaires, ou 8070)
  private apiUrl = 'http://localhost:8070/api/localisations'; 

  constructor(private http: HttpClient) {}

  getAllLocalisations(): Observable<Localisation[]> {
    return this.http.get<Localisation[]>(this.apiUrl);
  }

  creerLocalisation(localisation: Localisation): Observable<Localisation> {
    return this.http.post<Localisation>(this.apiUrl, localisation);
  }

  modifierLocalisation(id: number, localisation: Localisation): Observable<Localisation> {
    return this.http.put<Localisation>(`${this.apiUrl}/${id}`, localisation);
  }

  supprimerLocalisation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
