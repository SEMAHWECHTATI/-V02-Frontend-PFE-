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
    LocalisationComponent
],
  templateUrl: './gestionnaire-stock.component.html',
  styleUrl: './gestionnaire-stock.component.css'
})
export class GestionnaireStockComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private demandeService = inject(DemandematrielServiceService);

  vueActuelle: string = 'dashboard';
  currentUser: any = {};
  today: Date = new Date();

  stats = {
    totalArticles: 0,
    valeurTotale: 0,
    stockFaible: 0,
    stockCritique: 0,
    alertesNonTraitees: 0,
    alertesCritiques: 0,
    demandesEnAttente: 0
  };

  ngOnInit(): void {
    console.log('🚀 Initialisation GestionnaireStock');
    this.chargerUtilisateur();
    this.chargerStatistiques();
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