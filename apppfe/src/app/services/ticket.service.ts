import { Injectable } from '@angular/core';
import { Ticket } from '../Model/Entity';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators'; // ✅ Ajout indispensable pour transformer la réponse du backend

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private ticketUrl = 'http://localhost:8070/api/tickets';
  private notesUrl = 'http://localhost:8070/api/notes';
  private historiqueUrl = 'http://localhost:8070/api/historique';
  private fichiersUrl = 'http://localhost:8070/api/fichiers';

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

  constructor(private http: HttpClient) { }

  /* 🎫 Créer un ticket
   * POST /api/tickets/creer/{categorieId}
   */
  creerTicket(ticket: any, idCategorie: number): Observable<Ticket> {
    console.log('🎫 Création ticket:', ticket.titre);
    return this.http.post<Ticket>(`${this.ticketUrl}/creer/${idCategorie}`, ticket);
  }

  /**
   * 📋 Récupérer TOUS les tickets (API complète)
   * GET /api/tickets/all
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
   */
  setCurrentTicket(ticket: Ticket | null): void {
    console.log('🎫 Ticket sélectionné:', ticket?.reference);
    this.currentTicketSubject.next(ticket);
  }

  /**
   * 🎫 Obtenir le ticket actuellement sélectionné
   */
  getCurrentTicket(): Ticket | null {
    return this.currentTicketSubject.value;
  }

  /**
   * 🎫 Obtenir l'Observable du ticket actuellement sélectionné
   */
  getCurrentTicket$(): Observable<Ticket | null> {
    return this.currentTicket$;
  }
  
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
  resoudreTicket(idTicket: number, idUtilisateur: number, noteResolution: string, delaiResolution: number): Observable<any> {
    const params = new HttpParams()
      .set('idUtilisateur', idUtilisateur.toString())
      .set('noteResolution', noteResolution)
      .set('delaiResolution', delaiResolution.toString());

    return this.http.put<any>(`${this.ticketUrl}/${idTicket}/resoudre`, {}, { params });
  }

  /**
   * 🔒 Clôturer un ticket
   * PUT /api/tickets/{id}/cloturer
   */
  cloturerTicket(idTicket: number, idUtilisateur: number, roleUtilisateur: string): Observable<any> {
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

  // ==================== NOTES / COMMENTAIRES ====================

  /**
   * 📝 Ajouter une note
   * POST /api/notes/ajouter
   */
  ajouterNote(note: any): Observable<any> {
    console.log('📝 Ajout note ticket ID:', note.idTicket);
    return this.http.post<any>(`${this.notesUrl}/ajouter`, note);
  }

  /**
   * 💬 Récupérer toutes les notes d'un ticket spécifique
   * GET /api/notes/ticket/{idTicket}
   * ✅ NOUVEAU : Extrait le tableau "notes" de la réponse du backend
   */
  getNotesByTicket(idTicket: number): Observable<any[]> {
    console.log(`📡 GET ${this.notesUrl}/ticket/${idTicket}`);
    return this.http.get<any>(`${this.notesUrl}/ticket/${idTicket}`).pipe(
      map(response => response.notes || []) // Transforme { total: X, notes: [...] } en [...]
    );
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

  // ==================== PIÈCES JOINTES ====================

/**
 * 📎 Uploader un fichier pour un ticket
 * POST /api/fichiers/upload/ticket/{idTicket}
 */
// uploadPieceJointe(idTicket: number, file: File): Observable<any> {
//   console.log(`📎 Upload du fichier ${file.name} pour le ticket ID: ${idTicket}`);
  
//   // Utilisation de FormData pour envoyer des données binaires (MultipartFile)
//   const formData: FormData = new FormData();
//   formData.append('file', file, file.name);

//   return this.http.post<any>(`${this.fichiersUrl}/upload/ticket/${idTicket}`, formData);
// }

/**
 * 📎 Uploader un fichier avec ID utilisateur
 */
uploadPieceJointe(idTicket: number, file: File, idUtilisateur: number): Observable<any> {
  console.log(`📎 Upload ${file.name} - Ticket: ${idTicket} - User: ${idUtilisateur}`);
  
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  // Ajouter l'ID utilisateur en query parameter
  let url = `${this.fichiersUrl}/upload/ticket/${idTicket}`;
  if (idUtilisateur) {
    url += `?idUtilisateur=${idUtilisateur}`;
  }

  return this.http.post<any>(url, formData);
}

/**
 * 📎 Uploader sans ID utilisateur (compatibilité)
 */
uploadPieceJointeSimple(idTicket: number, file: File): Observable<any> {
  console.log(`📎 Upload ${file.name} - Ticket: ${idTicket}`);
  
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<any>(`${this.fichiersUrl}/upload/ticket/${idTicket}`, formData);
}

/**
 * 📋 Récupérer les pièces d'un ticket
 */
getPiecesByTicket(idTicket: number): Observable<any> {
  return this.http.get<any>(`${this.fichiersUrl}/ticket/${idTicket}`);
}

/**
 * 👤 Récupérer les pièces d'un utilisateur
 */
getPiecesByUtilisateur(idUtilisateur: number): Observable<any> {
  return this.http.get<any>(`${this.fichiersUrl}/utilisateur/${idUtilisateur}`);
}

/**
 * 🗑️ Supprimer une pièce jointe
 */
deletePieceJointe(idPieceJointe: number): Observable<any> {
  return this.http.delete<any>(`${this.fichiersUrl}/${idPieceJointe}`);
}

/**
 * 📥 TÉLÉCHARGER UN FICHIER PAR ID
 */
downloadPieceJointe(idPieceJointe: number): Observable<Blob> {
  console.log(`📥 Téléchargement fichier ID: ${idPieceJointe}`);
  
  const url = `${this.fichiersUrl}/download/${idPieceJointe}`;
  
  // ✅ Récupérer le fichier en tant que blob
  return this.http.get(url, { 
    responseType: 'blob' 
  });
}
}