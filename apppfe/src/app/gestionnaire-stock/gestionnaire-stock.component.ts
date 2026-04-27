import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleListComponent } from '../article-list/article-list.component';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { MouvementsComponent } from '../mouvements/mouvements.component';
import { AlertesComponent } from '../alertes/alertes.component';
import { ArticleDetailComponent } from '../article-detail/article-detail.component';
import { StatistiquesComponent } from '../statistiques/statistiques.component';
import { InventoryService } from '../services/inventory.service';


@Component({
  selector: 'app-gestionnaire-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ArticleListComponent,
    ArticleFormComponent,
    ArticleDetailComponent,
    MouvementsComponent,
    AlertesComponent,
    StatistiquesComponent
  ],
  templateUrl: './gestionnaire-stock.component.html',
  styleUrl: './gestionnaire-stock.component.css'
})
export class GestionnaireStockComponent implements OnInit {

  private inventoryService = inject(InventoryService);

  vueActuelle: string = 'dashboard';
  currentUser: any = {};
  today: Date = new Date();

  // Stats
  stats = {
    totalArticles: 0,
    valeurTotale: 0,
    stockFaible: 0,
    stockCritique: 0,
    alertesNonTraitees: 0,
    alertesCritiques: 0
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

    // Récupérer statistiques articles
    this.inventoryService.getInventoryStatistics().subscribe({
      next: (res) => {
        this.stats.totalArticles = res.nombreArticles || 0;
        this.stats.valeurTotale = res.valeurTotale || 0;
        this.stats.stockFaible = res.articlesFaible || 0;
        this.stats.stockCritique = res.articlesCritique || 0;
        console.log('✅ Statistiques chargées');
      },
      error: (err) => console.error('❌ Erreur statistiques:', err)
    });

    // Récupérer alertes
    this.inventoryService.getAlertesDashboard().subscribe({
      next: (res) => {
        this.stats.alertesNonTraitees = res.totalNonTraitees || 0;
        this.stats.alertesCritiques = res.totalCritiques || 0;
      },
      error: (err) => console.error('❌ Erreur alertes:', err)
    });
  }

  /**
   * 🔄 Changer de vue
   */
  changerVue(vue: string): void {
    console.log('🔄 Changement vue:', vue);
    this.vueActuelle = vue;
  }

  /**
   * 🚪 Déconnexion
   */
  deconnexion(): void {
    localStorage.clear();
    window.location.href = '/authentification';
  }

  /**
 * 🔀 Toggle sidebar (mobile)
 */
toggleSidebar(): void {
  console.log('🔀 Toggle sidebar');
  // À implémenter si vous voulez un menu mobile coulissant
}

/**
 * 🔍 Voir tickets filtrés
 */
voirTicketsFiltres(filtre: string): void {
  console.log('🔍 Filtrage:', filtre);
  this.changerVue('articles');
}
}