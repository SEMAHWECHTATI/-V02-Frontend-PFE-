import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Equipement, Localisation, StatutArticle } from '../Model/article';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
// Remplacer par l'URL de votre backend Spring Boot
  private apiUrl = 'http://localhost:8070/api/equipements'; 
  private locUrl = 'http://localhost:8070/api/localisations'; // Optionnel si vous listez les locs

  constructor(private http: HttpClient) { }
  getTousLesEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.apiUrl);
  }

  // À ajouter dans equipement.service.ts
ajouterEquipement(equipementData: any): Observable<Equipement> {
  return this.http.post<Equipement>(this.apiUrl, equipementData);
}

// Ajoutez aussi une méthode pour charger les articles dans le formulaire
getArticles(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8070/api/inventory/articles'); 
}

getEquipmentStatistics(): Observable<any> {
  return this.http.get(`${this.apiUrl}/statistics`);
}

getEquipmentsByStatus(status: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/equipements/statut/${status}`);
}
  // Obtenir par ID
  getDetailsEquipement(id: number): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
  }

  // Obtenir par scan de Code-barres
  getParCodeBarres(codeBarres: string): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.apiUrl}/scan/${codeBarres}`);
  }

  // Mettre à jour le statut et la localisation (PATCH)
  modifierStatutEtLocalisation(id: number, statut?: StatutArticle, localisationId?: number): Observable<Equipement> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    if (localisationId) params = params.set('localisationId', localisationId.toString());

    return this.http.patch<Equipement>(`${this.apiUrl}/${id}/statut-localisation`, {}, { params });
  }

  // Optionnel : Récupérer toutes les localisations pour remplir un menu déroulant (Select)
  getLocalisations(): Observable<Localisation[]> {
    return this.http.get<Localisation[]>(this.locUrl);
}
}