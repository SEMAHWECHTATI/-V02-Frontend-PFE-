import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fournisseur } from '../Model/Entity';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {

  
  // 💡 Assure-toi que l'URL correspond au port de ton backend Spring Boot
  private apiUrl = 'http://localhost:8070/api/fournisseurs';


  constructor(private http: HttpClient) { }

  // Récupérer la liste de tous les fournisseurs
  getAllFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(this.apiUrl);
  }

  // Créer un fournisseur
  createFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.apiUrl, fournisseur);
  }

  /**
   * 🗑️ Supprimer un fournisseur par son ID
   * @param id L'identifiant du fournisseur à supprimer
   */
  deleteFournisseur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * ✏️ Mettre à jour un fournisseur existant
   */
  updateFournisseur(id: number, fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.put<Fournisseur>(`${this.apiUrl}/${id}`, fournisseur);
  }
}
