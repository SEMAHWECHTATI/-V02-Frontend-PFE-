import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleListComponent } from '../article-list/article-list.component';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { MouvementsComponent } from '../mouvements/mouvements.component';
import { AlertesComponent } from '../alertes/alertes.component';
import { StatistiquesComponent } from '../statistiques/statistiques.component';
import { DemandematrielComponent } from '../demandematriel/demandematriel.component';
import { InventoryService } from '../services/inventory.service';
import { DemandematrielServiceService } from '../services/demandematriel-service.service';
import { ArticleDetailComponent } from "../article-detail/article-detail.component";
import { FournisseurComponent } from '../fournisseur/fournisseur.component';
import { LocalisationComponent } from '../localisation/localisation.component';
import { StockManagementComponent } from "../stock-management/stock-management.component";
import { StockListComponent } from "../stock-list/stock-list.component";
import { TicketDetailComponent } from "../ticket-detail/ticket-detail.component";
import { ListeTicketsComponent } from "../liste-tickets/liste-tickets.component";
import { DetailleEquipementComponent } from "../detaille-equipement/detaille-equipement.component";
import { AjouterEquipementComponent } from "../ajouter-equipement/ajouter-equipement.component";
import { DashboardFinance } from '../Model/alerte';
import { FinanceService } from '../services/finance.service';


@Component({
  selector: 'app-gestionnaire-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ArticleListComponent,
    ArticleFormComponent,
    MouvementsComponent,
    AlertesComponent,
    StatistiquesComponent,
    DemandematrielComponent,
    ArticleDetailComponent,
    FournisseurComponent,
    LocalisationComponent,
    StockManagementComponent,
    StockListComponent,
    TicketDetailComponent,
    ListeTicketsComponent,
    DetailleEquipementComponent,
    AjouterEquipementComponent
],
  templateUrl: './gestionnaire-stock.component.html',
  styleUrl: './gestionnaire-stock.component.css'
})
export class GestionnaireStockComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private demandeService = inject(DemandematrielServiceService);
  private financeService = inject(FinanceService);

  vueActuelle: string = 'dashboard';
  currentUser: any = {};
  today: Date = new Date();
  filtreSelectionne: string = 'Tous';

  globalSearchTerm: string = '';
resultatsRechercheGlobale: any[] = [];
  

  statsFinancieres: DashboardFinance = {
  valeurGlobale: 0,
  totalStocksFaibles: 0,
  totalRuptures: 0
};

  stats = {
    totalArticles: 0,
    valeurTotale: 0,
    stockFaible: 0,
    stockCritique: 0,
    alertesNonTraitees: 0,
    alertesCritiques: 0,
    demandesEnAttente: 0
  };

    // ✅ On ajoute 'nouveau' pour les notifications
  statMat = {
    total: 0,
    enCours: 0,
    resolus: 0,
    enAttente: 0,
    nouveaux: 0
  };

   voirTicketsFiltres(statut: string) {
    this.filtreSelectionne = statut;
    this.vueActuelle = 'listedemandes'; // On bascule sur la vue de la liste
  }

  rechercheGlobale(): void {
  const terme = this.globalSearchTerm?.trim().toLowerCase();
  if (!terme) return;

  // 1) Recherche dans les articles / stocks
  this.inventoryService.getAllStocks().subscribe({
    next: (stocks: any[]) => {
      const produits = (stocks || []).filter((s: any) =>
        (s.articleReference || s.reference || '').toLowerCase().includes(terme) ||
        (s.articleDesignation || s.designation || '').toLowerCase().includes(terme)
      );

      if (produits.length > 0) {
        // Aller vers la vue la plus utile
        this.vueActuelle = 'stockslist';
        this.resultatsRechercheGlobale = produits;
        console.log('✅ Résultats produits:', produits);
        return;
      }

      // 2) Optionnel: recherche alertes
      this.inventoryService.getAlertesDashboard().subscribe({
        next: () => {
          // Pas de match produit => fallback
          this.resultatsRechercheGlobale = [];
          alert(`Aucun produit trouvé pour "${this.globalSearchTerm}"`);
        },
        error: () => {
          this.resultatsRechercheGlobale = [];
          alert(`Aucun résultat pour "${this.globalSearchTerm}"`);
        }
      });
    },
    error: (err) => {
      console.error('❌ Erreur recherche globale:', err);
      alert('Erreur lors de la recherche globale.');
    }
  });
}

  ngOnInit(): void {
    console.log('🚀 Initialisation GestionnaireStock');
    this.chargerUtilisateur();
    this.chargerStatistiques();
    this.chargerDonneesDashboard();
  }

  chargerDonneesDashboard(): void {
  this.financeService.getDashboardStats().subscribe({
    next: (data) => this.statsFinancieres = data,
    error: (err) => console.error("Erreur KPI Finances", err)
  });
}

// 💡 À appeler à l'intérieur de votre méthode onSubmit() après un succès !
onSuccesTransaction(): void {
  this.chargerDonneesDashboard(); // Recharge instantanément le bandeau financier !
}

  /**
   * 👤 Charger utilisateur
   */
  chargerUtilisateur(): void {
    const userStr = localStorage.getItem('utilisateurConnecte');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      console.log('👤 Utilisateur:', this.currentUser.prenom);
    }
  }

  /**
   * 📊 Charger statistiques
   */
  chargerStatistiques(): void {
    console.log('📊 Chargement statistiques');

    // Statistiques articles
    this.inventoryService.getInventoryStatistics().subscribe({
      next: (res) => {
        this.stats.totalArticles = res.nombreArticles || 0;
        this.stats.valeurTotale = res.valeurTotale || 0;
        this.stats.stockFaible = res.articlesFaible || 0;
        this.stats.stockCritique = res.articlesCritique || 0;
        console.log('✅ Statistiques articles chargées');
      },
      error: (err) => console.error('❌ Erreur statistiques articles:', err)
    });

    // Alertes
    this.inventoryService.getAlertesDashboard().subscribe({
      next: (res) => {
        this.stats.alertesNonTraitees = res.totalNonTraitees || 0;
        this.stats.alertesCritiques = res.totalCritiques || 0;
        console.log('✅ Alertes chargées');
      },
      error: (err) => console.error('❌ Erreur alertes:', err)
    });

    // Demandes
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (res) => {
        this.stats.demandesEnAttente = res.total || 0;
        console.log('✅ Demandes chargées');
      },
      error: (err) => console.error('❌ Erreur demandes:', err)
    });
  }

  /**
   * 🔄 Changer de vue
   */
  changerVue(vue: string): void {
    console.log('🔄 Changement vue:', vue);
    this.vueActuelle = vue;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  dossierOuvert: string | null = null;

toggleFolder(folder: string): void {
  this.dossierOuvert =
    this.dossierOuvert === folder ? null : folder;
}
  /**
   * 🔀 Toggle sidebar (mobile)
   */
  toggleSidebar(): void {
    console.log('🔀 Toggle sidebar');
    // À implémenter si vous voulez un menu mobile coulissant
  }

  /**
   * 🔄 Actualiser les statistiques
   */
  chargerStatistiquesActualiser(): void {
    this.chargerStatistiques();
  }

  /**
   * 🚪 Déconnexion
   */
  deconnexion(): void {
    localStorage.clear();
    window.location.href = '/authentification';
  }
}