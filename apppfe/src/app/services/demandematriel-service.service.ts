import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandematrielServiceService {

  private apiUrl = 'http://localhost:8070/api/demandes-materiel';

  constructor(private http: HttpClient) { }

  /**
   * 📝 Créer demande
   */
  creerDemande(demande: any, utilisateurId: number): Observable<any> {
    console.log('📝 Création demande');
    
    // Convertir les valeurs en types corrects
    const demandeFormatee = {
      articleId: Number(demande.articleId), // Convertir en nombre
      quantiteDemandee: Number(demande.quantiteDemandee),
      type: demande.type,
      justification: demande.justification,
      referenceTicket: demande.referenceTicket || null
    };
    
    console.log('📦 Données formatées:', demandeFormatee);
    let params = new HttpParams().set('utilisateurId', utilisateurId.toString());
    return this.http.post(this.apiUrl, demandeFormatee, { params });
  }

  /**
   * ✅ Valider par Gestionnaire
   */
  validerParGestionnaire(demandeId: number, gestionnaireId: number): Observable<any> {
    console.log('✅ Validation gestionnaire:', demandeId);
    let params = new HttpParams().set('gestionnaireId', gestionnaireId.toString());
    return this.http.put(`${this.apiUrl}/${demandeId}/valider-gestionnaire`, {}, { params });
  }

  /**
   * ✅ Valider par Admin
   */
  validerParAdmin(demandeId: number, adminId: number): Observable<any> {
    console.log('✅ Validation admin:', demandeId);
    let params = new HttpParams().set('adminId', adminId.toString());
    return this.http.put(`${this.apiUrl}/${demandeId}/valider-admin`, {}, { params });
  }

  /**
   * ❌ Rejeter demande
   */
  rejeterDemande(demandeId: number, validateurId: number, motifRejet: string): Observable<any> {
    console.log('❌ Rejet demande:', demandeId);
    let params = new HttpParams()
      .set('validateurId', validateurId.toString())
      .set('motifRejet', motifRejet);
    return this.http.put(`${this.apiUrl}/${demandeId}/rejeter`, {}, { params });
  }

  /**
   * 📋 Demandes en attente
   */
  getDemandesEnAttente(): Observable<any> {
    console.log('📋 Récupération demandes en attente');
    return this.http.get(`${this.apiUrl}/en-attente`);
  }

  /**
   * 📋 Demandes validées gestionnaire
   */
  getDemandesValideeGestionnaire(): Observable<any> {
    console.log('📋 Récupération demandes validées gestionnaire');
    return this.http.get(`${this.apiUrl}/validee-gestionnaire`);
  }

  /**
   * 📋 Mes demandes
   */
  getMesDemandes(utilisateurId: number): Observable<any> {
    console.log('📋 Récupération mes demandes');
    let params = new HttpParams().set('utilisateurId', utilisateurId.toString());
    return this.http.get(`${this.apiUrl}/mes-demandes`, { params });
  }

 getAllDemandeMAt(): Observable<any[]> {

  return this.http.get<any[]>(`${this.apiUrl}/demandes`);

}

/**
   * 📋 Détails d'une demande spécifique
   */
  getDemandeDetail(demandeId: number): Observable<any> {
    console.log('📋 Récupération détails demande:', demandeId);
    return this.http.get(`${this.apiUrl}/${demandeId}`);
  }
}