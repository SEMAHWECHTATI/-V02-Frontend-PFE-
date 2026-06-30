import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../services/inventory.service';
import { Article } from '../Model/article';


@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.css'
})
export class ArticleDetailComponent implements OnInit, OnChanges { // 🌟 Ajoutez OnChanges

  private inventoryService = inject(InventoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 🌟 Cet Input va capter l'ID envoyé par le composant parent
  @Input() articleId?: number; 

  article: Article | null = null;
  chargement: boolean = false;
  historiqueMouvements: any[] = [];

  ngOnInit(): void {
    this.chargerArticle();
  }

  // 🌟 Écoute si le parent change d'article sans détruire le composant
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articleId'] && !changes['articleId'].isFirstChange()) {
      this.chargerArticle();
    }
  }

  chargerArticle(): void {
    // 🌟 Priorité à l'Input du parent, sinon on regarde l'URL
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = this.articleId ? this.articleId : (idFromRoute ? Number(idFromRoute) : null);

    if (!id) {
      console.warn("⚠️ Aucun ID d'article fourni au composant detail.");
      return;
    }

    this.chargement = true;

    this.inventoryService.getArticleById(id).subscribe({
      next: (res) => {
        this.article = res;
        this.chargement = false;
        console.log('✅ Article chargé:', this.article);
        
        if (this.article?.id) {
          this.chargerHistoriqueMouvements(this.article.id);
        }
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.chargement = false;
      }
    });
  }
  /**
   * 📋 Charger historique mouvements
   */
  chargerHistoriqueMouvements(articleId: number): void {
    console.log('📋 Chargement historique article:', articleId);
  }

  /**
   * ⬅️ Retour
   */
  retour(): void {
    this.router.navigate(['/gestionnaire-stock']);
  }

  /**
   * 🎨 Obtenir couleur du statut
   */
  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'ACTIF': '#10b981',
      'EN_REPARATION': '#f59e0b',
      'EN_PANNE': '#ef4444',
      'ARCHIVÉ': '#94a3b8',
      'A_RECYCLER': '#8b5cf6',
      'OBSOLETE': '#6366f1',
      'RUPTURE': '#dc2626'
    };
    return colors[statut] || '#6b7280';
  }

  /**
   * 📊 Calculer pourcentage stock
   */
  getStockPercentage(): number {
    if (!this.article) return 0;
    const max = this.article.quantiteEnStock + 100;
    return (this.article.quantiteEnStock / max) * 100;
  }

  // ✅ NOUVELLES MÉTHODES HELPER POUR LES DATES

  /**
   * 📅 Formater date d'achat
   */
  getFormattedDateAchat(): string {
    if (!this.article?.dateAchat) return '-';
    const date = new Date(this.article.dateAchat);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  /**
   * 📅 Formater date de garantie
   */
  getFormattedDateGarantie(): string {
    if (!this.article?.dateGarantie) return '-';
    const date = new Date(this.article.dateGarantie);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  /**
   * 📅 Formater date de création
   */
  getFormattedDateCreation(): string {
    if (!this.article?.dateCreation) return '-';
    const date = new Date(this.article.dateCreation);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 📅 Formater date de modification
   */
  getFormattedDateModification(): string {
    if (!this.article?.dateModification) return '-';
    const date = new Date(this.article.dateModification);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 📦 Obtenir état du stock
   */
  getStockStatus(): string {
    if (!this.article) return '';
    
    if (this.article.quantiteEnStock <= this.article.seuilCritique) {
      return '🔴 Critique';
    } else if (this.article.quantiteEnStock <= this.article.seuilMinimum) {
      return '⚠️ Faible';
    } else {
      return '✅ Normal';
    }
  }

  /**
   * 📦 Obtenir classe du statut du stock
   */
  getStockStatusClass(): string {
    if (!this.article) return '';
    
    if (this.article.quantiteEnStock <= this.article.seuilCritique) {
      return 'critical';
    } else if (this.article.quantiteEnStock <= this.article.seuilMinimum) {
      return 'warning';
    } else {
      return 'ok';
    }
  }
}