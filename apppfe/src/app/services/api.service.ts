import { Injectable } from '@angular/core';
import { environment } from '../../environement/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { ApprobationDTO, DemandeCreationDTO, DemandeReponseDTO, Groupe, LoginRequest, Utilisateur } from '../Model/Entity';

@Injectable({
  providedIn: 'root'
})
export class ApiService {



  // Remplacez par l'URL de votre backend Spring Boot
  private apiUrl = 'http://localhost:8082/user'; 
  private loginUrl = 'http://localhost:8082/authentification';
  private demandeUrl = 'http://localhost:8082/api/demandes';
  private groupeUrl = 'http://localhost:8082/api/groupes';
  private referencesUrl = 'http://localhost:8082/api/references';

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  login(data: LoginRequest): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.loginUrl}/login`, data, { headers, responseType: 'text' as 'json' });
  }
    changerMotDePasse(data: { email: string, motDePasse: string }): Observable<any> {
    return this.http.post(`${this.loginUrl}/changer-mdp`, data,{ 
    responseType: 'text' // 👈 AJOUTEZ CECI POUR ÉVITER L'ERREUR DE PARSING
  });
  }

 

  /**
   * 1. Envoyer une nouvelle demande (Côté Demandeur)
   * Correspond à : @PostMapping("/envoyer")
   */
  envoyerDemande(dto: DemandeCreationDTO): Observable<DemandeReponseDTO> {
    // Par défaut, Angular s'attend à du JSON, et votre endpoint renvoie bien du JSON (DemandeReponseDTO)
    return this.http.post<DemandeReponseDTO>(`${this.demandeUrl}/envoyer`, dto);
  }

  /**
   * 2. Voir toutes les demandes (Côté Admin)
   * Correspond à : @GetMapping("/all")
   */
  getAllDemandes(): Observable<DemandeReponseDTO[]> {
    return this.http.get<DemandeReponseDTO[]>(`${this.demandeUrl}/all`);
  }

  /**
   * 3. Approuver une demande (Côté Admin)
   * Correspond à : @PutMapping("/approuver/{id}")
   */
 approuverDemande(id: number, approbation: ApprobationDTO): Observable<string> {
    // En mettant simplement responseType: 'text', le HttpClient d'Angular 
    // comprend nativement qu'il doit retourner un Observable<string>.
    return this.http.put(`${this.demandeUrl}/approuver/${id}`, approbation, {
      responseType: 'text'
    });
  }

  /**
   * 4. Refuser une demande avec un motif (Côté Admin)
   * Correspond à : @PutMapping("/refuser/{id}?motif=...")
   */
 refuserDemande(id: number, motif: string): Observable<string> {
    let params = new HttpParams().set('motif', motif);

    return this.http.put(`${this.demandeUrl}/refuser/${id}`, {}, {
      params: params,
      responseType: 'text' // <-- On retire "as 'json'" ici aussi
    });
  }

  // Dans api.service.ts
public getGroupes() {
  // Remplacez l'URL par celle de votre contrôleur Spring Boot qui liste les groupes
  return this.http.get<Groupe[]>(`${this.groupeUrl}/all`);
}
// ==========================================
  //     RÉCUPÉRATION DES ÉNUMÉRATIONS
  // ==========================================

  public getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/roles`);
  }

  public getDepartements(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/departements`);
  }

  public getActionAudit(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/actionAudit`);
  }

  public getGroupeTechnicien(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/groupeTechnicien`);
  }

  public getStatutDemandeInscri(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/statutDemandeInscri`);
  }

  public getTypeAlerte(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/Typealerte`);
  }

  public getStatutUtilisateur(): Observable<string[]> {
    return this.http.get<string[]>(`${this.referencesUrl}/statutUtilisateur`);
  }

}
