import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article } from '../Model/article';
import { InventoryService } from '../services/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit, OnDestroy {

  private inventoryService = inject(InventoryService);
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();


    Math = Math;
  // ===== DATA =====
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  
  // ===== STATE =====
  chargement: boolean = false;
  erreur: string | null = null;
  
  // ===== FILTERS =====
  searchKeyword: string = '';
  filtre: string = 'tous';
  triParColonne: string = '';
  triDescending: boolean = false;

  // ===== PAGINATION =====
  itemsParPage: number = 10;
  pageActuelle: number = 1;
  totalPages: number = 1;

  // ===== STATS =====
  stats = {
    total: 0,
    actifs: 0,
    stockFaible: 0,
    stockCritique: 0,
    valeurTotale: 0
  };

  filtreOptions = [
    { value: 'tous', label: 'Tous les articles' },
    { value: 'actif', label: 'Articles actifs' },
    { value: 'faible', label: 'Stock faible' },
    { value: 'critique', label: 'Stock critique' },
    { value: 'rupture', label: 'En rupture' }
  ];

  ngOnInit(): void {
    this.chargerArticles();
    this.configurerRecherche();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 📋 Charger tous les articles
   */
  chargerArticles(): void {
    console.log('📋 Chargement articles...');
    this.chargement = true;
    this.erreur = null;

    this.inventoryService
      .getAllArticles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.articles = res.articles || res || [];
          this.calculerStats();
          this.appliquerFiltres();
          this.chargement = false;
          console.log('✅ Articles charges:', this.articles.length);
        },
        error: (err) => {
          console.error('❌ Erreur chargement:', err);
          this.erreur = 'Impossible de charger les articles';
          this.chargement = false;
        }
      });
  }

  /**
   * 🔍 Configurer la recherche avec debounce
   */
  private configurerRecherche(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((keyword: string) => {
        this.pageActuelle = 1;
        this.appliquerFiltres();
      });
  }

  /**
   * 🔍 Rechercher articles
   */
  rechercher(): void {
    this.searchSubject$.next(this.searchKeyword);
  }

  /**
   * 🔄 Appliquer tous les filtres
   */
  appliquerFiltres(): void {
    let filtered = [...this.articles];

    // Filtre par type
    if (this.filtre !== 'tous') {
      filtered = filtered.filter(article => {
        switch (this.filtre) {
          case 'actif':
            return article.statut === 'ACTIF';
          case 'faible':
            return (article.quantiteEnStock || 0) <= (article.seuilMinimum || 0) 
              && (article.quantiteEnStock || 0) > 0;
          case 'critique':
            return (article.quantiteEnStock || 0) <= (article.seuilCritique || 0);
          case 'rupture':
            return (article.quantiteEnStock || 0) === 0;
          default:
            return true;
        }
      });
    }

    // Filtre par recherche
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(article =>
        (article.reference?.toLowerCase().includes(keyword)) ||
        (article.designation?.toLowerCase().includes(keyword)) ||
        (article.codeBarres?.toLowerCase().includes(keyword)) ||
        (article.typeArticle?.toLowerCase().includes(keyword))
      );
    }

    // Tri
    if (this.triParColonne) {
      filtered = this.trierArticles(filtered, this.triParColonne);
    }

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsParPage);
    this.pageActuelle = Math.max(1, Math.min(this.pageActuelle, this.totalPages));

    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    this.filteredArticles = filtered.slice(debut, debut + this.itemsParPage);

    console.log(`🔍 ${filtered.length} articles filtres, page ${this.pageActuelle}/${this.totalPages}`);
  }

  /**
   * 📊 Tri articles
   */
  trierArticles(articles: Article[], colonne: string): Article[] {
    return [...articles].sort((a, b) => {
      let valueA: any, valueB: any;

      switch (colonne) {
        case 'reference':
          valueA = a.reference || '';
          valueB = b.reference || '';
          break;
        case 'designation':
          valueA = a.designation || '';
          valueB = b.designation || '';
          break;
        case 'quantite':
          valueA = a.quantiteEnStock || 0;
          valueB = b.quantiteEnStock || 0;
          break;
        case 'prix':
          valueA = a.prixUnitaire || 0;
          valueB = b.prixUnitaire || 0;
          break;
        case 'valeur':
          valueA = (a.quantiteEnStock || 0) * (a.prixUnitaire || 0);
          valueB = (b.quantiteEnStock || 0) * (b.prixUnitaire || 0);
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string') {
        valueA = valueA.localeCompare(valueB);
        valueB = 0;
      }

      return this.triDescending ? valueB - valueA : valueA - valueB;
    });
  }

  /**
   * 📈 Trier par colonne
   */
  changerTri(colonne: string): void {
    if (this.triParColonne === colonne) {
      this.triDescending = !this.triDescending;
    } else {
      this.triParColonne = colonne;
      this.triDescending = false;
    }
    this.pageActuelle = 1;
    this.appliquerFiltres();
  }

  /**
   * 📊 Calculer les statistiques
   */
  private calculerStats(): void {
    this.stats = {
      total: this.articles.length,
      actifs: this.articles.filter(a => a.statut === 'ACTIF').length,
      stockFaible: this.articles.filter(a =>
        (a.quantiteEnStock || 0) <= (a.seuilMinimum || 0) && (a.quantiteEnStock || 0) > 0
      ).length,
      stockCritique: this.articles.filter(a =>
        (a.quantiteEnStock || 0) <= (a.seuilCritique || 0)
      ).length,
      valeurTotale: this.articles.reduce((sum, a) =>
        sum + ((a.quantiteEnStock || 0) * (a.prixUnitaire || 0)), 0
      )
    };
  }

  /**
   * 📄 Pagination - Page précédente
   */
  pagePrec(): void {
    if (this.pageActuelle > 1) {
      this.pageActuelle--;
      this.appliquerFiltres();
    }
  }

  /**
   * 📄 Pagination - Page suivante
   */
  pageSuiv(): void {
    if (this.pageActuelle < this.totalPages) {
      this.pageActuelle++;
      this.appliquerFiltres();
    }
  }

  /**
   * 🗑️ Archiver article
   */
  archiver(id: number | undefined): void {
    if (!id) return;
    
    if (!confirm('Etes-vous sur de vouloir archiver cet article?')) {
      return;
    }

    this.inventoryService
      .archiveArticle(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Article archive');
          this.chargerArticles();
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.erreur = 'Impossible d\'archiver l\'article';
        }
      });
  }

  /**
   * 🔄 Rafraichir la liste
   */
  rafraichir(): void {
    this.chargerArticles();
  }

  /**
   * 🔄 Reinitialiser les filtres
   */
  reinitialiserFiltres(): void {
    this.searchKeyword = '';
    this.filtre = 'tous';
    this.triParColonne = '';
    this.triDescending = false;
    this.pageActuelle = 1;
    this.appliquerFiltres();
  }

  /**
   * 📥 Exporter en CSV
   */
  exporterCSV(): void {
    const headers = ['Reference', 'Designation', 'Type', 'Quantite', 'Prix Unit.', 'Valeur', 'Statut'];
    const data = this.filteredArticles.map(a => [
      a.reference,
      a.designation,
      a.typeArticle,
      a.quantiteEnStock,
      a.prixUnitaire,
      (a.quantiteEnStock || 0) * (a.prixUnitaire || 0),
      a.statut
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `articles-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 🏷️ Obtenir l'état de stock
   */
  getStockStatus(article: Article): 'ok' | 'warning' | 'critical' {
    const qty = article.quantiteEnStock || 0;
    const critical = article.seuilCritique || 0;
    const warning = article.seuilMinimum || 0;

    if (qty <= critical) return 'critical';
    if (qty <= warning) return 'warning';
    return 'ok';
  }
}
