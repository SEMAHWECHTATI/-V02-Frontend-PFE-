import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-liste-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TicketDetailComponent],
  templateUrl: './liste-tickets.component.html',
  styleUrl: './liste-tickets.component.css'
})
export class ListeTicketsComponent implements OnInit {

  @Input() filtreStatut: string = 'Tous';

  ticketsListe: any[] = [];
  ticketsFiltres: any[] = [];
  currentUser: any;
  userRole: string = '';
  userGroups: any[] = [];
  userGroupNames: string[] = [];
  isLoading: boolean = true;
  
  ticketToView: any = null;

  filterStatut: string = 'ALL';
  filterPriorite: string = 'ALL';
  searchTerm: string = '';

  selectedTicket: any = null;
  actionInProgress: boolean = false;
  noteResolution: string = '';
  showNoteInput: boolean = false;
  tempsIntervention: number = 0;
  tempsCalculeAuto: boolean = false;
  
  selectedTicketIds: number[] = [];

  constructor(private ticketservice: TicketService, private router: Router) {}


  tousLesTickets: any[] = []; // Sauvegarde de TOUS les tickets depuis l'API
  mesTickets: any[] = []; // La liste qui sera réellement affichée dans le HTML

  // ... (votre constructeur) ...

  // ✅ 3. On détecte les changements de filtre depuis le dashboard
  ngOnChanges(changes: SimpleChanges) {
    if (changes['filtreStatut']) {
      this.appliquerFiltre();
    }
  }

  // ✅ 4. Modifier l'endroit où vous récupérez vos tickets depuis l'API
  chargerMesTickets() { // (ou le nom de votre méthode existante)
    this.ticketservice.getAllTicket().subscribe({
      next: (data: any) => {
        // Au lieu de mettre directement dans mesTickets, on sauvegarde d'abord
        this.tousLesTickets = Array.isArray(data) ? data : (data.tickets || []);
        
        // Puis on applique le filtre (pour afficher la bonne liste)
        this.appliquerFiltre();
      },
      error: (err: any) => console.error(err)
    });
  }

  // ✅ 5. La méthode magique qui fait le filtrage
  appliquerFiltre() {
    // S'il n'y a pas de tickets chargés, on ne fait rien
    if (!this.tousLesTickets || this.tousLesTickets.length === 0) return;

    // Si le filtre est 'Tous', on affiche tout
    if (this.filtreStatut === 'Tous') {
      this.mesTickets = [...this.tousLesTickets];
    } 
    // Sinon, on gère les cas particuliers (ex: 'Resolu' englobe Résolu et Clôturé)
    else if (this.filtreStatut === 'Resolu') {
      this.mesTickets = this.tousLesTickets.filter((t: any) => t.statut === 'Resolu' || t.statut === 'Cloture');
    } 
    // Sinon, on filtre strictement sur le statut exact
    else {
      this.mesTickets = this.tousLesTickets.filter((t: any) => t.statut === this.filtreStatut);
    }
    
    // (Optionnel) On peut trier par date décroissante pour avoir les plus récents en haut
    this.mesTickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }


  ngOnInit(): void {
    this.chargerUtilisateur();
  }

  private chargerUtilisateur(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const userStr = localStorage.getItem('utilisateurConnecte');
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
          this.userRole = this.currentUser.role || '';
          if (this.currentUser.groupes && Array.isArray(this.currentUser.groupes)) {
            this.userGroups = this.currentUser.groupes;
            this.userGroupNames = this.userGroups.map((g: any) => g.nomGroupes || g.nomGroupe || '').filter((name: string) => name !== '');
          }
          this.chargerLesTickets();
        } catch (error) {
          this.isLoading = false;
        }
      } else {
        this.isLoading = false;
      }
    }
  }

  private chargerLesTickets(): void {
    this.isLoading = true;
    this.ticketservice.getAllTicket().subscribe({
      next: (response: any) => {
        this.ticketsListe = Array.isArray(response) ? response : (response.tickets || response || []);
        this.appliquerFiltrage();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private appliquerFiltrage(): void {
    const roleNormalise = this.userRole.toLowerCase();
    let filtered: any[] = [];

    if (roleNormalise === 'administrateur' || roleNormalise === 'admin') {
      filtered = this.ticketsListe;
    } else if (roleNormalise === 'technicien' || roleNormalise === 'gestionnaire_stock' || roleNormalise === 'gestionnaire') {
      filtered = this.ticketsListe.filter(ticket => {
        const ticketGroupe = ticket.groupeAssigne?.nomGroupes || ticket.groupe?.nomGroupes || ticket.categorie?.groupeResponsable?.nomGroupes || '';
        return ticketGroupe ? this.userGroupNames.some(userGroup => userGroup.toLowerCase() === ticketGroupe.toLowerCase()) : false;
      });
    }
    
    this.ticketsFiltres = filtered.filter(ticket => {
      if (this.filterStatut !== 'ALL' && ticket.statut !== this.filterStatut) return false;
      if (this.filterPriorite !== 'ALL' && ticket.priorite !== this.filterPriorite) return false;
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return ticket.titre?.toLowerCase().includes(term) || ticket.reference?.toLowerCase().includes(term) || ticket.description?.toLowerCase().includes(term);
      }
      return true;
    });
  }

  refresh(): void { 
    this.selectedTicketIds = [];
    this.chargerLesTickets(); 
  }

  onFilterChange(): void { this.appliquerFiltrage(); }

  isTechnicienOrAdmin(): boolean {
    const role = this.userRole.toLowerCase();
    return role === 'technicien' || role === 'administrateur' || role === 'admin';
  }

  isAdmin(): boolean {
    const role = this.userRole.toLowerCase();
    return role === 'administrateur' || role === 'admin';
  }

  viewDetails(ticket: any): void { 
    this.ticketToView = ticket; 
  }

  retourListe(): void { 
    this.ticketToView = null; 
    this.refresh(); 
  }

  // ✋ SCÉNARIO 1 : PRENDRE LA MAIN (Chrono Auto - Résout directement sans modale)
  prendreLaMain(ticket: any, event: Event): void {
    event.stopPropagation();
    if (!this.currentUser?.id) return;
    
    const idTicket = ticket.idTicket || ticket.id;
    this.actionInProgress = true;

    this.ticketservice.demarrerTicket(idTicket, this.currentUser.id).subscribe({
      next: () => {
        ticket.statut = 'En_Cours';
        // ⏱️ Démarrer le chrono
        localStorage.setItem(`ticket_start_${idTicket}`, Date.now().toString());
        alert('✅ Ticket pris en main ! Le chronomètre a démarré.');
        this.actionInProgress = false;
        this.refresh();
      },
      error: () => this.actionInProgress = false
    });
  }

  // Préparer la modale de résolution (depuis le tableau)
  preparerResolution(ticket: any, event: Event): void {
    event.stopPropagation();
    this.selectedTicket = ticket;
    const idTicket = ticket.idTicket || ticket.id;

    // Vérifier si on a pris la main avant
    const startStr = localStorage.getItem(`ticket_start_${idTicket}`);
    if (startStr) {
      const diffMs = Date.now() - parseInt(startStr, 10);
      this.tempsIntervention = Math.max(1, Math.round(diffMs / 60000));
      this.tempsCalculeAuto = true; // ✅ Cache le champ de saisie
    } else {
      this.tempsIntervention = 0;
      this.tempsCalculeAuto = false; // ✅ Affiche le champ de saisie
    }

    this.noteResolution = '';
    this.showNoteInput = true;
  }

  // Résoudre le ticket (depuis le tableau)
  resoudreTicket(ticket: any): void {
    if (!this.currentUser?.id || !this.noteResolution.trim() || this.tempsIntervention <= 0) return;
    
    this.actionInProgress = true;
    const idTicket = ticket.idTicket || ticket.id;
    const noteFinale = `${this.noteResolution}\n\n⏱️ Temps passé : ${this.tempsIntervention} minute(s).`;

    // ✅ ENVOIE LE TEMPS AU BACKEND (Statut = Resolu)
    this.ticketservice.resoudreTicket(idTicket, this.currentUser.id, noteFinale, this.tempsIntervention).subscribe({
      next: () => {
        ticket.statut = 'Resolu'; // ✅ Statut = RESOLU (pas Cloture)
        ticket.noteResolution = noteFinale;
        ticket.delaiResolution = this.tempsIntervention;
        ticket.dateResolution = new Date().toISOString().split('T')[0];
        
        localStorage.removeItem(`ticket_start_${idTicket}`);
        this.showNoteInput = false;
        alert('✅ Ticket résolu avec succès !');
        this.actionInProgress = false;
        this.refresh();
      },
      error: () => this.actionInProgress = false
    });
  }

  // ==================== SUPPRESSION ====================

  isTicketSelected(id: number): boolean {
    return this.selectedTicketIds.includes(id);
  }

  toggleSelection(id: number): void {
    const index = this.selectedTicketIds.indexOf(id);
    index > -1 ? this.selectedTicketIds.splice(index, 1) : this.selectedTicketIds.push(id);
  }

  toggleAll(event: any): void {
    this.selectedTicketIds = event.target.checked ? this.ticketsFiltres.map(t => t.idTicket || t.id) : [];
  }

  supprimerMultiples(): void {
    if (this.selectedTicketIds.length === 0) return;

    if (confirm(`Voulez-vous vraiment supprimer les ${this.selectedTicketIds.length} tickets sélectionnés ?`)) {
      this.isLoading = true;
      const suppressionRequests = this.selectedTicketIds.map(id => this.ticketservice.supprimerTicket(id));

      forkJoin(suppressionRequests).subscribe({
        next: () => {
          alert("✅ Tous les tickets ont été supprimés.");
          this.selectedTicketIds = [];
          this.chargerLesTickets();
        },
        error: () => {
          alert("Erreur lors de la suppression.");
          this.isLoading = false;
        }
      });
    }
  }

  // ==================== UI HELPERS ====================

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = { 'Nouveau': 'bg-danger', 'En_Cours': 'bg-warning text-dark', 'En_Attente': 'bg-info', 'Resolu': 'bg-success', 'Cloture': 'bg-secondary' };
    return statusMap[statut] || 'bg-light text-dark';
  }

  getRowStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = { 'Nouveau': 'status-nouveau', 'En_Cours': 'status-en-cours', 'En_Attente': 'status-en-attente', 'Resolu': 'status-resolu', 'Cloture': 'status-cloture' };
    return statusMap[statut] || '';
  }

  getPriorityClass(priorite: string): string {
    const priorityMap: { [key: string]: string } = { 'Haute': 'bg-danger', 'Critique': 'bg-dark', 'Moyenne': 'bg-warning text-dark', 'Basse': 'bg-success' };
    return priorityMap[priorite] || 'bg-secondary';
  }

  getTotalTickets(): number { return this.ticketsFiltres.length; }
  countByStatus(status: string): number { return this.ticketsFiltres.filter(t => t.statut === status).length; }
}