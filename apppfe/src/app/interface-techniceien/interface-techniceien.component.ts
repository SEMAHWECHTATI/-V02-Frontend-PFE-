import { Component, Inject, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../services/utilisateur.service';
import { TicketService } from '../services/ticket.service'; // ✅ NOUVEAU
import { ListeTicketsComponent } from '../liste-tickets/liste-tickets.component';
import { CreateTicketPageComponent } from '../create-ticket-page/create-ticket-page.component';
import { TicketDetailComponent } from "../ticket-detail/ticket-detail.component";
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DemandeActionService } from '../services/demande-action.service';
import { DemandeActionComponent } from "../demande-action/demande-action.component";

@Component({
  selector: 'app-interface-techniceien',
  standalone: true,
  imports: [CommonModule, FormsModule, ListeTicketsComponent, CreateTicketPageComponent, TicketDetailComponent, NgChartsModule, DemandeActionComponent],
  templateUrl: './interface-techniceien.component.html',
  styleUrl: './interface-techniceien.component.css'
})
export class InterfaceTechniceienComponent implements OnInit, OnDestroy {
  vueActuelle: string = 'dashboard'; // Par défaut, on affiche le dashboard
  user: any = null;

  filtreSelectionne: string = 'Tous';

  listeActions: any[] = [];

  // ✅ On ajoute 'nouveau' pour les notifications
  stats = {
    total: 0,
    enCours: 0,
    resolus: 0,
    enAttente: 0,
    nouveaux: 0
  };

  private intervalId: any; // Pour rafraîchir les notifs

  constructor(
    private apiService: UtilisateurService,
    private actionService: DemandeActionService,
    private ticketService: TicketService, // ✅ INJECTION
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✅ NOUVELLE MÉTHODE : Appelée quand on clique sur une carte KPI
  voirTicketsFiltres(statut: string) {
    this.filtreSelectionne = statut;
    this.vueActuelle = 'liste-tickets'; // On bascule sur la vue de la liste
  }

  ngOnInit() {
    this.loadUser();
    this.loadStats();
    this.loadActions();

    // Optionnel : Rafraîchir les stats toutes les minutes pour les notifications
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => {
        this.loadStats();
        this.loadActions();
      }, 60000); 
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changerVue(nouvelleVue: string) {
    this.vueActuelle = nouvelleVue;
    if (nouvelleVue === 'liste-tickets') {
      this.loadStats(); // On met à jour les stats quand on revient sur la liste
    }
  }

  loadUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('utilisateurConnecte');
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    }
  }

//  loadStats() {
//     this.ticketService.getAllTicket().subscribe({
//       next: (response: any) => {
//         const tickets = Array.isArray(response) ? response : (response.tickets || []);
        
//         this.stats.total = tickets.length;
        
//         // ✅ CORRECTION ICI : on ajoute (t: any) au lieu de juste t
//         this.stats.nouveaux = tickets.filter((t: any) => t.statut === 'Nouveau').length;
//         this.stats.enCours = tickets.filter((t: any) => t.statut === 'En_Cours').length;
//         this.stats.enAttente = tickets.filter((t: any) => t.statut === 'En_Attente').length;
//         this.stats.resolus = tickets.filter((t: any) => t.statut === 'Resolu' || t.statut === 'Cloture').length;
//       },
//       error: (err) => {
//         console.error("Erreur lors du chargement des statistiques:", err);
//       }
//     });
//   }


  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateurConnecte');
      window.location.href = '/login';
    }
  }

  // ==========================================
  // 📊 CONFIGURATION DU GRAPHIQUE DES STATUTS
  // ==========================================
  public chartStatutType: ChartType = 'doughnut';
  public chartStatutData: ChartData<'doughnut'> = {
    labels: [ 'Nouveaux', 'En Cours', 'En Attente', 'Résolus' ],
    datasets: [{ 
      data: [0, 0, 0, 0], // Sera remplacé par les vraies données
      backgroundColor: ['#dc3545', '#ffc107', '#0dcaf0', '#198754']
    }]
  };
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // ==========================================
  // 📊 CONFIGURATION DU GRAPHIQUE DES PRIORITÉS
  // ==========================================
  public chartPrioriteType: ChartType = 'bar';
  public chartPrioriteData: ChartData<'bar'> = {
    labels: [ 'Basse', 'Moyenne', 'Haute', 'Critique' ],
    datasets: [{ 
      data: [0, 0, 0, 0], 
      label: 'Nombre de tickets',
      backgroundColor: '#4f46e5',
      borderRadius: 5
    }]
  };

  // ... (Gardez votre constructor et ngOnInit existants) ...

  loadStats() {
    this.ticketService.getAllTicket().subscribe({
      next: (response: any) => {
        const tickets = Array.isArray(response) ? response : (response.tickets || []);
        
        // 1. Mise à jour de vos cartes KPI (ce que vous aviez déjà)
        this.stats.total = tickets.length;
        this.stats.nouveaux = tickets.filter((t: any) => t.statut === 'Nouveau').length;
        this.stats.enCours = tickets.filter((t: any) => t.statut === 'En_Cours').length;
        this.stats.enAttente = tickets.filter((t: any) => t.statut === 'En_Attente').length;
        this.stats.resolus = tickets.filter((t: any) => t.statut === 'Resolu' || t.statut === 'Cloture').length;

        // 2. Mise à jour du Graphe Circulaire (Statuts)
        // On recrée l'objet pour forcer Angular à rafraîchir le visuel
        this.chartStatutData = {
          labels: this.chartStatutData.labels,
          datasets: [{
            ...this.chartStatutData.datasets[0],
            data: [this.stats.nouveaux, this.stats.enCours, this.stats.enAttente, this.stats.resolus]
          }]
        };

        // 3. Mise à jour du Graphe en Barres (Priorités)
        const basse = tickets.filter((t: any) => t.priorite === 'Basse').length;
        const moyenne = tickets.filter((t: any) => t.priorite === 'Moyenne').length;
        const haute = tickets.filter((t: any) => t.priorite === 'Haute').length;
        const critique = tickets.filter((t: any) => t.priorite === 'Critique').length;

        this.chartPrioriteData = {
          labels: this.chartPrioriteData.labels,
          datasets: [{
            ...this.chartPrioriteData.datasets[0],
            data: [basse, moyenne, haute, critique]
          }]
        };

        // (Optionnel) Vous pouvez aussi calculer un temps moyen ici si vous avez un champ 'delaiResolution'
      },
      error: (err) => console.error("Erreur stats:", err)
    });
  }

  /**
 * 📊 Calculer le taux de résolution
 */
getTauxResolution(): number {
  if (this.stats.total === 0) return 0;
  return Math.round((this.stats.resolus / this.stats.total) * 100);
}

/**
 * ⚡ Nombre de tickets urgents (Haute + Critique)
 */
// getTicketsUrgents(): number {
//   // À adapter selon tes données
//   return 0; // À calculer depuis l'API
// }

/**
 * ✅ Tickets résolus aujourd'hui
 */
// getResolvedToday(): number {
//   // À adapter selon tes données
//   return 0; // À calculer depuis l'API
// }
validerAction(action: any) {
  if (confirm(`Voulez-vous vraiment valider l'action : "${action.objet}" ?`)) {
    this.actionService.validerAction(action.id).subscribe({
      next: (res) => {
        console.log("Action validée avec succès !", res);
        this.loadActions(); // 🔄 Rafraîchit instantanément la table
        this.loadStats();   // 📊 Recharge les compteurs KPI globaux
      },
      error: (err) => console.error("⚠️ Erreur lors de la validation", err)
    });
  }
}

rejeterAction(action: any) {
  if (confirm(`Voulez-vous vraiment rejeter l'action : "${action.objet}" ?`)) {
    this.actionService.rejeterAction(action.id).subscribe({
      next: (res) => {
        console.log("Action rejetée avec succès !", res);
        this.loadActions(); // 🔄 Rafraîchit la table
        this.loadStats();   // 📊 Recharge les compteurs
      },
      error: (err) => console.error("⚠️ Erreur lors du rejet", err)
    });
  }
}

getTicketsUrgents(): number {
  return this.listeActions.filter((action: any) => action.criticite === 'HIGH').length;
}

/**
 * ✅ Demandes d'action résolues ou closes affectées à ce technicien
 */
getResolvedToday(): number {
  // Compte les actions qui ne sont plus au statut BROUILLON ou EN_COURS
  return this.listeActions.filter((action: any) => action.statut === 'RESOLU' || action.statut === 'CLOTURE').length;
}


loadActions() {
  this.actionService.getActions().subscribe({
    next: (data) => {
      if (this.user && this.user.id) {
        // 🎯 On ne garde que les actions assignées au technicien actuellement connecté
        this.listeActions = data.filter((action: any) => 
          action.assignedTechnicien && action.assignedTechnicien.id === this.user.id
        );
      } else {
        this.listeActions = data; // Repli par défaut si l'utilisateur n'est pas chargé
      }
    },
    error: (err) => console.error("⚠️ Impossible de charger les demandes d'actions", err)
  });
}
}