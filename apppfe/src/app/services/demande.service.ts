import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApprobationDTO, DemandeCreationDTO, DemandeReponseDTO } from '../Model/Entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

    private demandeUrl = 'http://localhost:8070/api/demandes';
    constructor(private http: HttpClient) { }

    // ==================== DEMANDES ====================
  
    /**
     * 📤 Envoyer une demande
     * POST /api/demandes/envoyer
     */
    envoyerDemande(dto: DemandeCreationDTO): Observable<DemandeReponseDTO> {
      console.log('📤 Envoi demande:', dto);
      return this.http.post<DemandeReponseDTO>(`${this.demandeUrl}/envoyer`, dto);
    }
  
    /**
     * 📋 Récupérer toutes les demandes
     * GET /api/demandes/all
     */
    getAllDemandes(): Observable<DemandeReponseDTO[]> {
      console.log('📋 Récupération toutes les demandes');
      return this.http.get<DemandeReponseDTO[]>(`${this.demandeUrl}/all`);
    }
  
    /**
     * ✅ Récupérer les demandes actives
     * GET /api/demandes/actives
     */
    getDemandesActives(): Observable<DemandeReponseDTO[]> {
      console.log('✅ Récupération demandes actives');
      return this.http.get<DemandeReponseDTO[]>(`${this.demandeUrl}/actives`);
    }
  
    /**
     * 📦 Récupérer les demandes archivées
     * GET /api/demandes/archives
     */
    getDemandesArchivees(): Observable<DemandeReponseDTO[]> {
      console.log('📦 Récupération demandes archivées');
      return this.http.get<DemandeReponseDTO[]>(`${this.demandeUrl}/archives`);
    }
  
    /**
     * ✔️ Approuver une demande
     * PUT /api/demandes/approuver/{id}
     */
    approuverDemande(id: number, approbation: ApprobationDTO): Observable<string> {
      console.log('✔️ Approbation demande ID:', id);
      return this.http.put(`${this.demandeUrl}/approuver/${id}`, approbation, {
        responseType: 'text'
      });
    }
  
    /**
     * ❌ Refuser une demande
     * PUT /api/demandes/refuser/{id}
     */
    refuserDemande(id: number, motif: string): Observable<string> {
      console.log('❌ Refus demande ID:', id);
      let params = new HttpParams().set('motif', motif);
      return this.http.put(`${this.demandeUrl}/refuser/${id}`, {}, {
        params: params,
        responseType: 'text'
      });
    }
  
    /**
     * 📦 Archiver une demande
     * PUT /api/demandes/archiver/{id}
     */
    archiverDemande(id: number): Observable<string> {
      console.log('📦 Archivage demande ID:', id);
      return this.http.put(`${this.demandeUrl}/archiver/${id}`, {}, {
        responseType: 'text'
      });
    }
  
}
