import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-liste-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './liste-tickets.component.html',
  styleUrl: './liste-tickets.component.css'
})
export class ListeTicketsComponent implements OnInit {

  // ==================== DONNÉES ====================
  ticketsListe: any[] = [];
  ticketsFiltres: any[] = [];
  currentUser: any;
  userRole: string = '';
  userGroups: any[] = [];
  userGroupNames: string[] = [];
  isLoading: boolean = true;

  // ==================== FILTRES ====================
  filterStatut: string = 'ALL';
  filterPriorite: string = 'ALL';
  searchTerm: string = '';

  // ==================== ACTIONS ====================
  selectedTicket: any = null;
  showActionsModal: boolean = false;
  actionInProgress: boolean = false;
  noteResolution: string = '';
  showNoteInput: boolean = false;

  constructor(
    private apiService: ApiService,  // ✅ UN SEUL SERVICE
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerUtilisateur();
  }

  /**
   * 👤 Charge l'utilisateur depuis le localStorage
   */
  private chargerUtilisateur(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const userStr = localStorage.getItem('utilisateurConnecte');

      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
          this.userRole = this.currentUser.role || '';

          if (this.currentUser.groupes && Array.isArray(this.currentUser.groupes)) {
            this.userGroups = this.currentUser.groupes;
            this.userGroupNames = this.userGroups.map((g: any) => {
              return g.nomGroupes || g.nomGroupe || '';
            }).filter((name: string) => name !== '');
          }

          console.log('👤 Utilisateur chargé:', {
            id: this.currentUser.id,
            nom: `${this.currentUser.prenom} ${this.currentUser.nom}`,
            role: this.userRole,
            groupes: this.userGroupNames,
            groupesTotal: this.userGroupNames.length
          });

          this.chargerLesTickets();
        } catch (error) {
          console.error('❌ Erreur parsing utilisateur:', error);
          this.isLoading = false;
        }
      } else {
        console.warn('⚠️ Utilisateur non trouvé dans localStorage');
        this.isLoading = false;
      }
    }
  }

  /**
   * 📋 Charge les tickets depuis ApiService
   */
  private chargerLesTickets(): void {
    console.log('📋 Chargement des tickets');

    // ✅ Utiliser ApiService directement
    this.apiService.getAllTicket().subscribe({
      next: (response: any) => {
        // 📍 Le service retourne un tableau ou { total, tickets }
        this.ticketsListe = Array.isArray(response) ? response : (response.tickets || response || []);

        console.log('📋 Tickets reçus:', {
          count: this.ticketsListe.length,
          premier: this.ticketsListe[0]?.reference
        });

        this.appliquerFiltrage();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement tickets:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🔍 Applique le filtrage des tickets
   */
  private appliquerFiltrage(): void {
    const roleNormalise = this.userRole.toLowerCase();

    console.log('🔍 FILTRAGE:', {
      role: roleNormalise,
      groupes: this.userGroupNames,
      totalTickets: this.ticketsListe.length
    });

    let filtered: any[] = [];

    if (roleNormalise === 'administrateur' || roleNormalise === 'admin') {
      // ✅ ADMIN : tous les tickets
      filtered = this.ticketsListe;
      console.log(`✅ ADMIN: ${filtered.length} tickets`);
    } else if (roleNormalise === 'technicien') {
      // 🔧 TECHNICIEN : tickets de ses groupes
      filtered = this.filtrerParGroupe();
      console.log(`🔧 TECHNICIEN: ${filtered.length} tickets`);
    } else if (roleNormalise === 'gestionnaire_stock' || roleNormalise === 'gestionnaire') {
      // 📦 GESTIONNAIRE : tickets de ses groupes
      filtered = this.filtrerParGroupe();
      console.log(`📦 GESTIONNAIRE: ${filtered.length} tickets`);
    } else {
      filtered = [];
      console.log(`⚠️ Rôle non reconnu: ${this.userRole}`);
    }

    // ✅ Appliquer les filtres additionnels
    this.ticketsFiltres = this.appliquerFiltresSupplementaires(filtered);
  }

  /**
   * 📍 Filtre par groupe
   */
  private filtrerParGroupe(): any[] {
    return this.ticketsListe.filter(ticket => {
      // 📍 Récupérer le groupe du ticket
      const ticketGroupe = ticket.groupeAssigne?.nomGroupes ||
                          ticket.groupe?.nomGroupes ||
                          ticket.categorie?.groupeResponsable?.nomGroupes ||
                          '';

      if (!ticketGroupe) {
        console.log(`⚠️ Ticket ${ticket.reference} sans groupe`);
        return false;
      }

      // 📍 Vérifier si le groupe du ticket appartient aux groupes de l'utilisateur
      const match = this.userGroupNames.some(userGroup =>
        userGroup.toLowerCase() === ticketGroupe.toLowerCase()
      );

      if (!match) {
        console.log(`❌ Ticket ${ticket.reference} groupe "${ticketGroupe}" non autorisé`);
      }

      return match;
    });
  }

  /**
   * 🔎 Applique les filtres statut, priorité et recherche
   */
  private appliquerFiltresSupplementaires(tickets: any[]): any[] {
    return tickets.filter(ticket => {
      // Filtre Statut
      if (this.filterStatut !== 'ALL' && ticket.statut !== this.filterStatut) {
        return false;
      }

      // Filtre Priorité
      if (this.filterPriorite !== 'ALL' && ticket.priorite !== this.filterPriorite) {
        return false;
      }

      // Filtre Recherche
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchTitre = ticket.titre?.toLowerCase().includes(term);
        const matchRef = ticket.reference?.toLowerCase().includes(term);
        const matchDesc = ticket.description?.toLowerCase().includes(term);

        if (!matchTitre && !matchRef && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 🔄 Rafraîchir la liste
   */
  refresh(): void {
    console.log('🔄 Rafraîchissement de la liste');
    this.isLoading = true;
    this.chargerLesTickets();
  }

  /**
   * 🎯 Re-appliquer les filtres (changement de filtre)
   */
  onFilterChange(): void {
    console.log('🎯 Changement de filtre');
    this.appliquerFiltrage();
  }

  // ==================== ACTIONS SUR TICKETS ====================

  /**
   * 👁️ Voir les détails d'un ticket
   */
  viewDetails(ticket: any): void {
    console.log('👁️ Voir détails ticket:', ticket.idTicket);
    this.selectedTicket = ticket;
    
    // ✅ Utiliser ApiService pour définir le ticket sélectionné
    this.apiService.setCurrentTicket(ticket);
    
    // Naviguer vers les détails
    this.router.navigate(['/tickets', ticket.idTicket]);
  }

  /**
   * ▶️ Démarrer un ticket
   */
  demarrerTicket(ticket: any): void {
    if (!this.currentUser?.id) {
      console.error('❌ Utilisateur non identifié');
      alert('❌ Utilisateur non identifié');
      return;
    }

    console.log('▶️ Démarrage ticket:', ticket.idTicket);
    this.actionInProgress = true;

    this.apiService.demarrerTicket(ticket.idTicket, this.currentUser.id).subscribe({
      next: (res) => {
        console.log('✅ Ticket démarré:', res);
        ticket.statut = 'En_Cours';
        this.showActionsModal = false;
        alert('✅ Ticket démarré avec succès');
        this.actionInProgress = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('❌ Erreur: ' + (err.error?.error || err.message));
        this.actionInProgress = false;
      }
    });
  }

  /**
   * ✅ Résoudre un ticket
   */
  resoudreTicket(ticket: any): void {
    if (!this.currentUser?.id) {
      console.error('❌ Utilisateur non identifié');
      alert('❌ Utilisateur non identifié');
      return;
    }

    if (!this.noteResolution.trim()) {
      alert('⚠��� Veuillez entrer une note de résolution');
      return;
    }

    console.log('✅ Résolution ticket:', ticket.idTicket);
    this.actionInProgress = true;

    this.apiService.resoudreTicket(
      ticket.idTicket,
      this.currentUser.id,
      this.noteResolution
    ).subscribe({
      next: (res) => {
        console.log('✅ Ticket résolu:', res);
        ticket.statut = 'Resolu';
        ticket.noteResolution = this.noteResolution;
        ticket.slaRespecte = res.slaRespecte;
        this.noteResolution = '';
        this.showNoteInput = false;
        this.showActionsModal = false;
        alert('✅ Ticket résolu avec succès');
        this.actionInProgress = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('❌ Erreur: ' + (err.error?.error || err.message));
        this.actionInProgress = false;
      }
    });
  }

  /**
   * 🔒 Clôturer un ticket
   */
  cloturerTicket(ticket: any): void {
    if (!this.currentUser?.id) {
      console.error('❌ Utilisateur non identifié');
      alert('❌ Utilisateur non identifié');
      return;
    }

    if (ticket.statut !== 'Resolu') {
      alert('⚠️ Le ticket doit être résolu avant clôture');
      return;
    }

    console.log('🔒 Clôture ticket:', ticket.idTicket);
    this.actionInProgress = true;

    this.apiService.cloturerTicket(
      ticket.idTicket,
      this.currentUser.id,
      this.userRole
    ).subscribe({
      next: (res) => {
        console.log('✅ Ticket clôturé:', res);
        ticket.statut = 'Cloture';
        this.showActionsModal = false;
        alert('✅ Ticket clôturé avec succès');
        this.actionInProgress = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('❌ Erreur: ' + (err.error?.error || err.message));
        this.actionInProgress = false;
      }
    });
  }

  /**
   * 🔄 Réouvrir un ticket
   */
  reouvrirTicket(ticket: any): void {
    if (!this.currentUser?.id) {
      console.error('❌ Utilisateur non identifié');
      alert('❌ Utilisateur non identifié');
      return;
    }

    console.log('🔄 Réouverture ticket:', ticket.idTicket);
    this.actionInProgress = true;

    // 📍 Implémenter si l'endpoint existe
    alert('ℹ️ Fonctionnalité en développement');
    this.actionInProgress = false;
  }

  /**
   * 📝 Ajouter une note
   */
  ajouterNote(ticket: any, contenu: string): void {
    if (!this.currentUser?.id || !contenu.trim()) {
      alert('⚠️ Contenu requis');
      return;
    }

    console.log('📝 Ajout note:', ticket.idTicket);
    this.actionInProgress = true;

    const noteDTO = {
      contenu: contenu.trim(),
      type: 'COMMENTAIRE',
      idTicket: ticket.idTicket,
      idUtilisateur: this.currentUser.id
    };

    this.apiService.ajouterNote(noteDTO).subscribe({
      next: (res) => {
        console.log('✅ Note ajoutée:', res);
        if (!ticket.notes) {
          ticket.notes = [];
        }
        ticket.notes.push(res);
        alert('✅ Note ajoutée');
        this.actionInProgress = false;
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('❌ Erreur: ' + (err.error?.error || err.message));
        this.actionInProgress = false;
      }
    });
  }

  // ==================== AFFICHAGE ====================

  /**
   * 🎨 Récupérer la couleur du statut
   */
  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Nouveau': 'bg-danger',
      'En_Cours': 'bg-warning text-dark',
      'En_Attente': 'bg-info',
      'Resolu': 'bg-success',
      'Cloture': 'bg-secondary'
    };
    return statusMap[statut] || 'bg-light text-dark';
  }

  /**
   * 🎨 Récupérer la classe CSS de la ligne selon le statut
   */
  getRowStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Nouveau': 'status-nouveau',
      'En_Cours': 'status-en-cours',
      'En_Attente': 'status-en-attente',
      'Resolu': 'status-resolu',
      'Cloture': 'status-cloture'
    };
    return statusMap[statut] || '';
  }

  /**
   * 🎨 Récupérer la couleur de la priorité
   */
  getPriorityClass(priorite: string): string {
    const priorityMap: { [key: string]: string } = {
      'Haute': 'bg-danger',
      'Critique': 'bg-dark',
      'Moyenne': 'bg-warning text-dark',
      'Basse': 'bg-success'
    };
    return priorityMap[priorite] || 'bg-secondary';
  }

  /**
   * 📊 Obtenir le total de tickets filtrés
   */
  getTotalTickets(): number {
    return this.ticketsFiltres.length;
  }

  /**
   * 📊 Compter les tickets par statut
   */
  countByStatus(status: string): number {
    return this.ticketsFiltres.filter(t => t.statut === status).length;
  }

  /**
   * 📍 Obtenir les groupes formatés
   */
  getGroupesFormatted(): string {
    return this.userGroupNames.length > 0
      ? this.userGroupNames.join(', ')
      : 'Aucun groupe assigné';
  }

  /**
   * 🔤 Obtenir l'avatar du groupe
   */
  getGroupAvatar(): string {
    if (this.userGroupNames.length > 0) {
      const groupe = this.userGroupNames[0];
      const words = groupe.split('_');
      return words.map(w => w[0]).join('').toUpperCase();
    }
    return '?';
  }

  /**
   * 🎯 Obtenir les actions possibles pour un ticket
   */
  getAvailableActions(ticket: any): string[] {
    const actions: string[] = [];

    if (ticket.statut === 'Nouveau') {
      actions.push('Démarrer');
    } else if (ticket.statut === 'En_Cours') {
      actions.push('Résoudre');
      actions.push('Mettre en attente');
    } else if (ticket.statut === 'Resolu') {
      actions.push('Clôturer');
      actions.push('Réouvrir');
    }

    return actions;
  }
}