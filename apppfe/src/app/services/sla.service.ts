import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SLA } from '../Model/sla';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SLAService {

private apiUrl = 'http://localhost:8070/api/slas'; 

  constructor(private http: HttpClient) { }

  /**
   * 📄 GET - Récupérer tous les SLA configurés
   */
  getTousLesSLA(): Observable<SLA[]> {
    return this.http.get<SLA[]>(this.apiUrl);
  }

  /**
   * 🔍 GET - Trouver un SLA par son Identifiant unique
   */
  getSlaParId(id: number): Observable<SLA> {
    return this.http.get<SLA>(`${this.apiUrl}/${id}`);
  }

  /**
   * 🗂️ GET - Récupérer la liste des SLA rattachés à une catégorie spécifique
   */
  getSlasParCategorie(idCategorie: number): Observable<SLA[]> {
    return this.http.get<SLA[]>(`${this.apiUrl}/categorie/${idCategorie}`);
  }

  /**
   * ➕ POST - Enregistrer une nouvelle configuration de SLA (Création)
   */
  creerSLA(sla: SLA): Observable<SLA> {
    return this.http.post<SLA>(this.apiUrl, sla);
  }

  /**
   * ✏️ PUT - Mettre à jour / Modifier un SLA existant
   */
  modifierSLA(id: number, slaDetails: SLA): Observable<SLA> {
    return this.http.put<SLA>(`${this.apiUrl}/${id}`, slaDetails);
  }

  /**
   * ❌ DELETE - Supprimer une règle de SLA
   */
  supprimerSLA(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }}
