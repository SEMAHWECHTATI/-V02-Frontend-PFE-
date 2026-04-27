import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnumerationService {

private referencesUrl = 'http://localhost:8070/api/enumerations';

  constructor(private http: HttpClient) {}
// ==================== ÉNUMÉRATIONS ====================

  /**
   * 📋 Récupérer les rôles
   * GET /api/enumerations/roles
   */
  getRoles(): Observable<string[]> {
    console.log('📋 Récupération rôles');
    return this.http.get<string[]>(`${this.referencesUrl}/roles`);
  }

  /**
   * 📋 Récupérer les départements
   * GET /api/enumerations/departements
   */
  getDepartements(): Observable<string[]> {
    console.log('📋 Récupération départements');
    return this.http.get<string[]>(`${this.referencesUrl}/departements`);
  }

  /**
   * 📋 Récupérer les actions d'audit
   * GET /api/enumerations/actionAudit
   */
  getActionAudit(): Observable<string[]> {
    console.log('📋 Récupération actions audit');
    return this.http.get<string[]>(`${this.referencesUrl}/actionAudit`);
  }

  /**
   * 📋 Récupérer les groupes de techniciens
   * GET /api/enumerations/groupeTechnicien
   */
  getGroupeTechnicien(): Observable<string[]> {
    console.log('📋 Récupération groupes techniciens');
    return this.http.get<string[]>(`${this.referencesUrl}/groupeTechnicien`);
  }

  /**
   * 📋 Récupérer les statuts de demande d'inscription
   * GET /api/enumerations/statutDemandeInscri
   */
  getStatutDemandeInscri(): Observable<string[]> {
    console.log('📋 Récupération statuts demandes inscription');
    return this.http.get<string[]>(`${this.referencesUrl}/statutDemandeInscri`);
  }

  /**
   * 📋 Récupérer les types d'alerte
   * GET /api/enumerations/Typealerte
   */
  getTypeAlerte(): Observable<string[]> {
    console.log('📋 Récupération types alertes');
    return this.http.get<string[]>(`${this.referencesUrl}/Typealerte`);
  }

  /**
   * 📋 Récupérer les statuts d'utilisateur
   * GET /api/enumerations/statutUtilisateur
   */
  getStatutUtilisateur(): Observable<string[]> {
    console.log('📋 Récupération statuts utilisateurs');
    return this.http.get<string[]>(`${this.referencesUrl}/statutUtilisateur`);
  }

  /**
   * 📋 Récupérer les statuts de ticket
   * GET /api/enumerations/StatutTicket
   */
  getStatutTicket(): Observable<string[]> {
    console.log('📋 Récupération statuts tickets');
    return this.http.get<string[]>(`${this.referencesUrl}/StatutTicket`);
  }

  /**
   * 📋 Récupérer les types de note
   * GET /api/enumerations/TypeNote
   */
  getTypeNote(): Observable<string[]> {
    console.log('📋 Récupération types notes');
    return this.http.get<string[]>(`${this.referencesUrl}/TypeNote`);
  }

  /**
   * 📋 Récupérer les types de ticket
   * GET /api/enumerations/TypeTicket
   */
  getTypeTicket(): Observable<string[]> {
    console.log('📋 Récupération types tickets');
    return this.http.get<string[]>(`${this.referencesUrl}/TypeTicket`);
  }

  /**
   * 📋 Récupérer les priorités
   * GET /api/enumerations/Priorite
   */
  getPriorite(): Observable<string[]> {
    console.log('📋 Récupération priorités');
    return this.http.get<string[]>(`${this.referencesUrl}/Priorite`);
  }


}
