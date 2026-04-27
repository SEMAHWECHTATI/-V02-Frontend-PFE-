import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CreateTicketPageComponent } from '../create-ticket-page/create-ticket-page.component';
import { TicketService } from '../services/ticket.service';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-espace-demandeur',
  standalone: true,
  imports: [CommonModule, CreateTicketPageComponent],
  templateUrl: './espace-demandeur.component.html',
  styleUrl: './espace-demandeur.component.css'
})
export class EspaceDemandeurComponent implements OnInit {
  
  private ticketService = inject(TicketService);
  private authService = inject(AuthServiceService);
  private router = inject(Router);

  currentUser: any = {};
  mesTickets: any[] = [];
  ticketSelectionne: any = null;
  vueActuelle: string = 'dashboard';
  today: Date = new Date();
  
  // ✅ Nouveaux états
  enChargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';

  ngOnInit(): void {
    console.log('🚀 Initialisation EspaceDemandeur');
    
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const userStr = localStorage.getItem('utilisateurConnecte');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
        console.log('👤 Utilisateur:', this.currentUser.prenom, this.currentUser.nom);
        this.chargerMesTickets();
      }
    }
  }

  /**
   * 📋 Charger mes tickets
   */
  chargerMesTickets(): void {
    console.log('📋 Chargement mes tickets...');
    
    this.ticketService.getAllTicket().subscribe({
      next: (reponseBackend: any) => {
        console.log('📦 Réponse API:', reponseBackend);

        let tousLesTickets: any[] = [];

        if (Array.isArray(reponseBackend)) {
          tousLesTickets = reponseBackend;
        } else if (reponseBackend && Array.isArray(reponseBackend.tickets)) {
          tousLesTickets = reponseBackend.tickets;
        } else if (reponseBackend && Array.isArray(reponseBackend.content)) {
          tousLesTickets = reponseBackend.content;
        } else if (reponseBackend && Array.isArray(reponseBackend.data)) {
          tousLesTickets = reponseBackend.data;
        } else {
          console.warn('⚠️ Format inattendu');
          return;
        }

        // ✅ Filtrer les tickets du demandeur
        this.mesTickets = tousLesTickets.filter((t: any) => t.demandeur?.id === this.currentUser.id);
        this.mesTickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('✅ Tickets chargés:', this.mesTickets.length);
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  /**
   * 🔍 Voir le détail d'un ticket
   */
  voirDetailTicket(ticket: any): void {
    console.log('🔍 Affichage détail ticket:', ticket.reference);
    this.ticketSelectionne = ticket;
    this.messageSucces = '';
    this.messageErreur = '';
    this.changerVue('detailTicket');
  }

  /**
   * 🔄 Changer de vue
   */
  changerVue(vue: string): void {
    this.vueActuelle = vue;
    if (vue !== 'detailTicket') {
      this.ticketSelectionne = null;
    }
  }

  /**
   * ✅ CLÔTURER LE TICKET (Demandeur)
   * 
   * Le demandeur clôture après que le technicien a résolu
   * Cela signifie : "Oui, le problème est résolu, je confirme"
   */
  cloturerTicketDemandeur(): void {
    console.log('🔒 Clôture du ticket par demandeur:', this.ticketSelectionne.reference);

    // ✅ Confirmation avant clôture
    const confirmation = confirm(
      '⚠️ Êtes-vous sûr que la solution apportée résout votre problème ?\n\n' +
      'Une fois clôturé, ce ticket ne pourra pas être modifié.'
    );

    if (!confirmation) {
      console.log('❌ Clôture annulée');
      return;
    }

    this.enChargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    // ✅ Appeler l'API pour clôturer
    this.ticketService.cloturerTicket(
      this.ticketSelectionne.idTicket,
      this.currentUser.id,
      'demandeur'
    ).subscribe({
      next: (response) => {
        console.log('✅ Ticket clôturé avec succès');
        
        this.enChargement = false;
        this.messageSucces = '✅ Ticket clôturé avec succès ! Merci d\'avoir confirmé la résolution.';

        // ✅ Mettre à jour le statut localement
        this.ticketSelectionne.statut = 'Cloture';
        
        // ✅ Mettre à jour la liste
        const index = this.mesTickets.findIndex(t => t.idTicket === this.ticketSelectionne.idTicket);
        if (index > -1) {
          this.mesTickets[index].statut = 'Cloture';
        }

        // ✅ Redirection vers la liste après 3 secondes
        setTimeout(() => {
          this.changerVue('mesTickets');
          this.chargerMesTickets();
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erreur clôture:', err);
        this.enChargement = false;
        
        if (err.error?.error) {
          this.messageErreur = `❌ ${err.error.error}`;
        } else if (err.error?.message) {
          this.messageErreur = `❌ ${err.error.message}`;
        } else {
          this.messageErreur = '❌ Erreur lors de la clôture du ticket.';
        }
      }
    });
  }

  /**
   * 🎨 Obtenir la classe CSS du statut
   */
  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Nouveau': 'bg-info',
      'En_Cours': 'bg-warning',
      'Resolu': 'bg-success',
      'Cloture': 'bg-secondary',
      'En Cours': 'bg-warning',
      'Résolu': 'bg-success',
      'Clôturé': 'bg-secondary'
    };
    return statusMap[statut] || 'bg-light';
  }

  /**
   * 🚪 Déconnexion
   */
  deconnexion(): void {
    console.log('🚪 Déconnexion');
    this.authService.logout();
  }

  /**
   * 📄 Ouvrir le formulaire de création
   */
  ouvrirFormulaireTicket(): void {
    this.changerVue('creerTicket');
  }
}