import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Groupe } from '../Model/Entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {

    private groupeUrl = 'http://localhost:8070/api/groupes';
  constructor(private http: HttpClient) { }


  // ==================== GROUPES ====================

  /**
   * 👥 Lister tous les groupes
   * GET /api/groupes/all
   */
  getGroupes(): Observable<Groupe[]> {
    console.log('👥 Récupération des groupes');
    return this.http.get<Groupe[]>(`${this.groupeUrl}/all`);
  }

  /**
   * ➕ Créer un groupe
   * POST /api/groupes/creer
   */
  creerGroupe(groupe: any): Observable<any> {
    console.log('➕ Création groupe:', groupe.nomGroupes);
    return this.http.post(`${this.groupeUrl}/creer`, groupe);
  }

  /**
   * 🗑️ Supprimer un groupe
   * DELETE /api/groupes/supprimer/{id}
   */
  supprimerGroupe(id: number): Observable<any> {
    console.log('🗑️ Suppression groupe ID:', id);
    return this.http.delete(`${this.groupeUrl}/supprimer/${id}`);
  }

  /**
   * ✏️ Modifier un groupe
   * PUT /api/groupes/{id}
   */
  modifierGroupe(id: number, groupe: any): Observable<any> {
    console.log('✏️ Modification groupe ID:', id);
    return this.http.put(`${this.groupeUrl}/${id}`, groupe);
  }

}
