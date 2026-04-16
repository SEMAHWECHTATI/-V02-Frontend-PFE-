import { Injectable } from '@angular/core';
import { environment } from '../../environement/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';  // ✅ Ajouter BehaviorSubject
import { 
  ApprobationDTO, 
  Categorie, 
  DemandeCreationDTO, 
  DemandeReponseDTO, 
  Groupe, 
  LoginRequest, 
  Ticket, 
  Utilisateur,
  NoteTicketDTO,
  TicketCreateDTO,
  Priorite,
  StatutTicket
} from '../Model/Entity';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ==================== URLs ====================
  private apiUrl = 'http://localhost:8070/user'; 
  private loginUrl = 'http://localhost:8070/authentification';
  private demandeUrl = 'http://localhost:8070/api/demandes';
  private groupeUrl = 'http://localhost:8070/api/groupes';
  private referencesUrl = 'http://localhost:8070/api/enumerations';
  private ticketUrl = 'http://localhost:8070/api/tickets';
  private categorieUrl = 'http://localhost:8070/api/categories';
  private notesUrl = 'http://localhost:8070/api/notes';
  private historiqueUrl = 'http://localhost:8070/api/historique';

  // ==================== SUBJECTS (Pour la gestion d'état) ====================
  
  /**
   * 🎫 Subject pour le ticket actuellement sélectionné
   */
  private currentTicketSubject = new BehaviorSubject<Ticket | null>(null);
  public currentTicket$ = this.currentTicketSubject.asObservable();

  /**
   * 📋 Subject pour la liste des tickets
   */
  private ticketsListSubject = new BehaviorSubject<any[]>([]);
  public ticketsList$ = this.ticketsListSubject.asObservable();

  /**
   * 📊 Subject pour les catégories
   */
  private categoriesSubject = new BehaviorSubject<Categorie[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('✅ ApiService initialisé');
  }

  // ==================== AUTHENTIFICATION ====================

  /**
   * 🔐 Connexion utilisateur
   * POST /authentification/login
   */
  login(data: LoginRequest): Observable<any> {
    console.log('🔐 Connexion utilisateur:', data.email);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.loginUrl}/login`, data, { 
      headers, 
      responseType: 'text' as 'json' 
    });
  }

  /**
   * 👤 Récupérer un utilisateur par ID (avec groupes)
   * GET /authentification/user/{id}
   */
  getUtilisateurById(id: number): Observable<any> {
    console.log('👤 Récupération utilisateur ID:', id);
    return this.http.get<any>(`${this.loginUrl}/user/${id}`);
  }

  /**
   * 🔑 Changer le mot de passe
   * POST /authentification/changer-mdp
   */
  changerMotDePasse(data: { email: string, motDePasse: string }): Observable<any> {
    console.log('🔑 Changement mot de passe:', data.email);
    return this.http.post(`${this.loginUrl}/changer-mdp`, data, { 
      responseType: 'text'
    });
  }

  // ==================== UTILISATEURS ====================

  /**
   * 👥 Lister tous les utilisateurs
   * GET /user
   */
  getUtilisateurs(): Observable<Utilisateur[]> {
    console.log('👥 Récupération de tous les utilisateurs');
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  /**
   * ✏️ Modifier un utilisateur
   * PUT /user/{id}
   */
  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    console.log('✏️ Modification utilisateur ID:', id);
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  /**
   * 🗑️ Supprimer un utilisateur
   * DELETE /user/{id}
   */
  deleteUtilisateur(id: number): Observable<void> {
    console.log('🗑️ Suppression utilisateur ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

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

  // ==================== CATÉGORIES ====================

  /**
   * 🔧 Initialiser les catégories par défaut
   * POST /api/categories/init
   */
  initialiserCategories(): Observable<any> {
    console.log('🔧 Initialisation des catégories');
    return this.http.post(`${this.categorieUrl}/init`, {});
  }

  /**
   * 📋 Lister toutes les catégories
   * GET /api/categories/all
   */
  getCategories(): Observable<any> {
    console.log('📋 Récupération des catégories');
    return this.http.get<any>(`${this.categorieUrl}/all`).pipe(
      // Mettre à jour le subject quand les catégories sont reçues
      (response) => {
        response.subscribe((res: any) => {
          const categories = res.categories || [];
          this.categoriesSubject.next(categories);
        });
        return response;
      }
    );
  }

  /**
   * 📋 Récupérer les types de tickets disponibles
   * GET /api/categories/types/all
   */
  getTypesDisponibles(): Observable<any> {
    console.log('📋 Récupération des types disponibles');
    return this.http.get<any>(`${this.categorieUrl}/types/all`);
  }

  /**
   * 🔍 Récupérer une catégorie par ID
   * GET /api/categories/{id}
   */
  getCategorieById(id: number): Observable<Categorie> {
    console.log('🔍 Récupération catégorie ID:', id);
    return this.http.get<Categorie>(`${this.categorieUrl}/${id}`);
  }

  /**
   * 🔍 Rechercher une catégorie par type
   * GET /api/categories/type/{type}
   */
  getCategorieParType(type: string): Observable<Categorie> {
    console.log('🔍 Recherche catégorie type:', type);
    return this.http.get<Categorie>(`${this.categorieUrl}/type/${type}`);
  }

  /**
   * ➕ Ajouter une nouvelle catégorie
   * POST /api/categories/ajouter
   */
  creerCategorie(categorie: any): Observable<any> {
    console.log('➕ Création catégorie:', categorie.nomCategorie);
    return this.http.post(`${this.categorieUrl}/ajouter`, categorie);
  }

  /**
   * ✏️ Modifier une catégorie
   * PUT /api/categories/{id}
   */
  modifierCategorie(id: number, categorie: any): Observable<any> {
    console.log('✏️ Modification catégorie ID:', id);
    return this.http.put(`${this.categorieUrl}/${id}`, categorie);
  }

  /**
   * 📦 Archiver une catégorie
   * DELETE /api/categories/{id}
   */
  archiverCategorie(id: number): Observable<any> {
    console.log('📦 Archivage catégorie ID:', id);
    return this.http.delete(`${this.categorieUrl}/${id}`);
  }

  /**
   * 📊 Obtenir les statistiques des catégories
   * GET /api/categories/stats
   */
  getCategoriesStatistiques(): Observable<any> {
    console.log('📊 Récupération statistiques catégories');
    return this.http.get<any>(`${this.categorieUrl}/stats`);
  }

  // ==================== TICKETS ====================

  /**
   * 🎫 Créer un ticket
   * POST /api/tickets/creer/{categorieId}
   */
  creerTicket(ticket: any, idCategorie: number): Observable<Ticket> {
    console.log('🎫 Création ticket:', ticket.titre);
    return this.http.post<Ticket>(`${this.ticketUrl}/creer/${idCategorie}`, ticket);
  }

  /**
   * 📋 Récupérer TOUS les tickets (API complète)
   * GET /api/tickets/all
   * ✅ NOUVEAU: Avec mise à jour du subject
   */
  getAllTicket(): Observable<any[]> {
    console.log('📋 Récupération de TOUS les tickets');
    
    const request = this.http.get<any[]>(`${this.ticketUrl}/all`);
    
    // Mettre à jour le subject quand les tickets sont reçus
    request.subscribe(
      (tickets) => {
        console.log('📊 Tickets reçus:', tickets.length);
        this.ticketsListSubject.next(tickets);
      },
      (error) => {
        console.error('❌ Erreur récupération tickets:', error);
      }
    );

    return request;
  }

  /**
   * 📋 Obtenir les tickets du subject (Observable)
   * ✅ NOUVEAU: Pour accéder à la liste des tickets de manière réactive
   */
  getTicketsFromSubject(): Observable<any[]> {
    return this.ticketsList$;
  }

  /**
   * 📋 Récupérer mes tickets (par demandeur)
   * GET /api/tickets/demandeur/{idDemandeur}
   */
  getMesTickets(idDemandeur: number): Observable<Ticket[]> {
    console.log('📋 Récupération mes tickets - demandeur ID:', idDemandeur);
    return this.http.get<Ticket[]>(`${this.ticketUrl}/demandeur/${idDemandeur}`);
  }

  /**
   * 📋 Récupérer les tickets par groupe
   * GET /api/tickets/groupe/{idGroupe}
   */
  getTicketsParGroupe(idGroupe: number): Observable<any[]> {
    console.log('📋 Récupération tickets groupe ID:', idGroupe);
    return this.http.get<any[]>(`${this.ticketUrl}/groupe/${idGroupe}`);
  }

  /**
   * 🔍 Récupérer un ticket par ID
   * GET /api/tickets/{id}
   */
  getTicketById(id: number): Observable<Ticket> {
    console.log('🔍 Récupération ticket ID:', id);
    return this.http.get<Ticket>(`${this.ticketUrl}/${id}`);
  }

  /**
   * 🗑️ Supprimer un ticket
   * DELETE /api/tickets/{id}
   */
  supprimerTicket(id: number): Observable<any> {
    console.log('🗑️ Suppression ticket ID:', id);
    return this.http.delete(`${this.ticketUrl}/${id}`);
  }

  /**
   * 🎫 Définir le ticket actuellement sélectionné
   * ✅ NOUVEAU: Mettre à jour le subject avec le ticket sélectionné
   */
  setCurrentTicket(ticket: Ticket | null): void {
    console.log('🎫 Ticket sélectionné:', ticket?.reference);
    this.currentTicketSubject.next(ticket);
  }

  /**
   * 🎫 Obtenir le ticket actuellement sélectionné
   * ✅ NOUVEAU: Récupérer la valeur actuelle du subject
   */
  getCurrentTicket(): Ticket | null {
    return this.currentTicketSubject.value;
  }

  /**
   * 🎫 Obtenir l'Observable du ticket actuellement sélectionné
   * ✅ NOUVEAU: Accès réactif au ticket sélectionné
   */
  getCurrentTicket$(): Observable<Ticket | null> {
    return this.currentTicket$;
  }

  // ==================== ACTIONS SUR TICKETS ====================

  /**
   * ▶️ Démarrer un ticket
   * PUT /api/tickets/{id}/demarrer
   */
  demarrerTicket(idTicket: number, idUtilisateur: number): Observable<any> {
    console.log('▶️ Démarrage ticket ID:', idTicket);
    const params = new HttpParams()
      .set('idUtilisateur', idUtilisateur.toString());
    
    return this.http.put<any>(
      `${this.ticketUrl}/${idTicket}/demarrer`,
      {},
      { params }
    );
  }

  /**
   * ✅ Résoudre un ticket
   * PUT /api/tickets/{id}/resoudre
   */
  resoudreTicket(
    idTicket: number,
    idUtilisateur: number,
    noteResolution: string
  ): Observable<any> {
    console.log('✅ Résolution ticket ID:', idTicket);
    const params = new HttpParams()
      .set('idUtilisateur', idUtilisateur.toString())
      .set('noteResolution', noteResolution);

    return this.http.put<any>(
      `${this.ticketUrl}/${idTicket}/resoudre`,
      {},
      { params }
    );
  }

  /**
   * 🔒 Clôturer un ticket
   * PUT /api/tickets/{id}/cloturer
   */
  cloturerTicket(
    idTicket: number,
    idUtilisateur: number,
    roleUtilisateur: string
  ): Observable<any> {
    console.log('🔒 Clôture ticket ID:', idTicket);
    const params = new HttpParams()
      .set('idUtilisateur', idUtilisateur.toString())
      .set('roleUtilisateur', roleUtilisateur);

    return this.http.put<any>(
      `${this.ticketUrl}/${idTicket}/cloturer`,
      {},
      { params }
    );
  }

  // ==================== NOTES ====================

  /**
   * 📝 Ajouter une note
   * POST /api/notes/ajouter
   */
  ajouterNote(note: any): Observable<any> {
    console.log('📝 Ajout note ticket ID:', note.idTicket);
    return this.http.post<any>(`${this.notesUrl}/ajouter`, note);
  }

  /**
   * 📝 Récupérer les notes d'un ticket
   * GET /api/notes/ticket/{idTicket}
   */
  getNotes(idTicket: number): Observable<any> {
    console.log('📝 Récupération notes ticket ID:', idTicket);
    return this.http.get<any>(`${this.notesUrl}/ticket/${idTicket}`);
  }

  /**
   * 🗑️ Supprimer une note
   * DELETE /api/notes/{idNote}
   */
  supprimerNote(idNote: number): Observable<any> {
    console.log('🗑️ Suppression note ID:', idNote);
    return this.http.delete<any>(`${this.notesUrl}/${idNote}`);
  }

  // ==================== HISTORIQUE ====================

  /**
   * 📜 Récupérer l'historique d'un ticket
   * GET /api/historique/ticket/{idTicket}
   */
  getHistorique(idTicket: number): Observable<any> {
    console.log('📜 Récupération historique ticket ID:', idTicket);
    return this.http.get<any>(`${this.historiqueUrl}/ticket/${idTicket}`);
  }

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