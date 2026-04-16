import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { CreateTicketPageComponent } from '../create-ticket-page/create-ticket-page.component';

@Component({
  selector: 'app-espace-demandeur',
  standalone: true,
  imports: [CommonModule,CreateTicketPageComponent ],
  templateUrl: './espace-demandeur.component.html',
  styleUrl: './espace-demandeur.component.css'
})
export class EspaceDemandeurComponent implements OnInit {
  currentUser: any = {};
  mesTickets: any[] = [];
  ticketSelectionne: any = null;
  vueActuelle: string = 'dashboard';
  today: Date = new Date();

  constructor(private apiService: ApiService, private route: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const userStr = localStorage.getItem('utilisateurConnecte');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
        this.chargerMesTickets();
      }
    }
  }

  chargerMesTickets(): void {
    this.apiService.getAllTicket().subscribe({
      next: (tousLesTickets: any[]) => {
        this.mesTickets = tousLesTickets.filter(t => t.demandeur?.id === this.currentUser.id);
      },
      error: (err) => console.error("Erreur API :", err)
    });
  }

  changerVue(vue: string): void {
    this.vueActuelle = vue;
    if (vue !== 'detailTicket') {
      this.ticketSelectionne = null;
    }
  }

  voirDetailTicket(ticket: any): void {
    this.ticketSelectionne = ticket;
    this.changerVue('detailTicket');
  }

  ouvrirFormulaireTicket(): void {
    this.changerVue('creerTicket');
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Nouveau': 'bg-info',
      'En Cours': 'bg-warning',
      'Résolu': 'bg-success',
      'Clôturé': 'bg-secondary'
    };
    return statusMap[statut] || 'bg-light';
  }

  getBorderClass(statut: string): string {
    const borderMap: { [key: string]: string } = {
      'Nouveau': 'border-nouveau',
      'En Cours': 'border-encours',
      'Résolu': 'border-resolu'
    };
    return borderMap[statut] || '';
  }

  deconnexion(): void {
    localStorage.removeItem('utilisateurConnecte');
    // window.location.reload();
    this.route.navigate(['/login']);
  }
}