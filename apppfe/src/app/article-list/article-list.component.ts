import { Component, OnInit, OnDestroy, inject, Output , EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article } from '../Model/article';
import { InventoryService } from '../services/inventory.service';
import { of, Subject, throwError } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit, OnDestroy {

  @Output() vueDetailsDemandee = new EventEmitter<number>();

  private inventoryService = inject(InventoryService);
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();



showModal = false;
selectedArticle: any = null;

voirDetails(article: any) {
  this.selectedArticle = article;
  this.showModal = true;
}

fermerModal() {
  this.showModal = false;
  this.selectedArticle = null;
}




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

  imprimerQRCodeArticle(event: Event, article: any): void {
  // Empêche le clic de déclencher la sélection de la ligne du tableau
  event.stopPropagation();

  // Ouverture d'une pop-up d'impression éphémère
  const fenetreImpression = window.open('', '_blank', 'width=450,height=450');
  
  if (fenetreImpression) {
    fenetreImpression.document.write(`
      <html>
        <head>
          <title>Étiquette Article - ${article.codeBarres}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center; 
              padding: 20px; 
              margin: 0;
            }
            .ticket-box {
              border: 2px dashed #333;
              padding: 20px;
              display: inline-block;
              border-radius: 4px;
              background-color: #fff;
            }
            .title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #111; margin-bottom: 2px; }
            .reference { font-size: 11px; font-weight: 600; color: #666; margin-bottom: 12px; }
            .designation { font-size: 12px; font-weight: bold; color: #000; margin-bottom: 15px; max-width: 220px; word-wrap: break-word; }
            .code-text { font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 15px; margin-top: 8px; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="ticket-box">
            <div class="title">SAGEMCOM INVENTAIRE</div>
            <div class="reference">REF: ${article.reference || 'N/A'}</div>
            <div class="designation">${article.designation || 'N/A'}</div>
            
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${article.codeBarres}" 
                 alt="QR Code Article" 
                 onload="window.print(); window.close();" />
                 
            <div class="code-text">${article.codeBarres}</div>
          </div>
        </body>
      </html>
    `);
    fenetreImpression.document.close();
  }
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
        (article.categorie?.toLowerCase().includes(keyword)) ||
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
   * 📥 ACTION : Ajouter de la quantité au stock (via le DTO que ton backend attend)
   */
ajouterAuStock(article: Article): void {
  // 1️⃣ On extrait l'ID et on vérifie s'il existe
  if (!article.id) return;
  
  const articleIdSecurise: number = article.id;

  const saisie = prompt(`Combien d'unités voulez-vous ajouter à l'article [${article.reference}] ?`, '10');
  if (saisie === null) return; 

  const quantite = parseInt(saisie, 10);
  if (isNaN(quantite) || quantite <= 0) {
    alert('❌ Veuillez saisir une quantité valide supérieure à 0.');
    return;
  }

  this.chargement = true;

  // 2️⃣ Interrogation du stock avec interception du 404
  this.inventoryService.getStockByArticleId(articleIdSecurise).pipe(
    takeUntil(this.destroy$),
    catchError((err) => {
      // 🎯 Si c'est un 404, l'article n'a pas encore de stock. C'est normal !
      // On renvoie of(null) pour continuer dans le switchMap et créer le stock.
      if (err.status === 404) {
        console.log(`ℹ️ Aucun stock pour l'article ${articleIdSecurise}. Création autorisée.`);
        return of(null);
      }
      // Pour tout autre code (ex: 500 doublon), on propage l'erreur
      return throwError(() => err);
    }),
    switchMap((stockExistant: any) => {
      
      // Si un stock existe déjà, on tente de l'augmenter
      if (stockExistant && (stockExistant.id || stockExistant.stockId)) {
        const idDuStock = stockExistant.id || stockExistant.stockId;
        
        alert(`⚠️ Un stock existe déjà pour cet article.\nNous allons tenter de mettre à jour la quantité au lieu de créer un doublon.`);
        
        if (typeof this.inventoryService.augmenterQuantite === 'function') {
          // On ajoute un catchError local sur l'augmentation pour capturer le message du backend (ex: votre 404 sur /augmenter)
          return this.inventoryService.augmenterQuantite(idDuStock, quantite).pipe(
            catchError((errAugmenter) => {
              const msgBackend = errAugmenter.error?.message || errAugmenter.error?.error || errAugmenter.message || 'Inconnu';
              alert(`❌ Échec de la mise à jour du stock par le backend.\nErreur retournée : "${msgBackend}"`);
              return throwError(() => new Error('ERREUR_AUGMENTATION_BACKEND'));
            })
          );
        } else {
          throw new Error('DOUBLON_BLOQUE');
        }
      }

      // Si stockExistant est null (suite au 404), on crée le DTO de zéro
      const stockDTO = {
        id: 0,
        codeBarresArticle: article.codeBarres || "SANS-CB",
        quantiteEnStock: quantite,
        quantiteCritique: article.seuilCritique || 2,
        quantiteMinimum: article.seuilMinimum || 5,
        prixUnitaire: article.prixUnitaire || 0,
        articleId: articleIdSecurise,
        articleReference: article.reference,
        articleDesignation: article.designation,
        articleTypeArticle: article.typeArticle,
        articleStatut: article.statut || "ACTIF",
        valeurTotale: (article.prixUnitaire || 0) * quantite,
        valeurTotal: (article.prixUnitaire || 0) * quantite
      };

      return this.inventoryService.enregistrerEntreeStock(articleIdSecurise, stockDTO);
    })
  ).subscribe({
    next: (reponse: any) => {
      console.log('✅ Opération sur le stock réussie :', reponse);
      alert(`✅ Le stock a été traité avec succès !`);
      this.chargement = false;
      this.chargerArticles();
    },
    error: (err) => {
      this.chargement = false;
      
      if (err.message === 'DOUBLON_BLOQUE' || err.status === 409) {
        alert(`❌ Action annulée : Un stock existe déjà pour cet article. Veuillez modifier directement la ligne existante.`);
      } else if (err.message === 'ERREUR_AUGMENTATION_BACKEND') {
        this.erreur = "Le serveur a refusé la mise à jour de la quantité.";
      } else {
        console.error('❌ Erreur lors de la gestion du stock:', err);
        if (err.status === 500 && err.error?.message?.includes('query did not return a unique result')) {
          alert(`❌ Erreur critique : Il y a déjà des doublons pour cet article en base de données.`);
        } else {
          // Affiche le message d'erreur brut du serveur s'il y en a un autre
          const rawMessage = err.error?.message || err.message || '';
          alert(`❌ Impossible de finaliser l'action.\nErreur serveur: ${rawMessage}`);
          this.erreur = "Impossible d'enregistrer le stock pour cet article.";
        }
      }
    }
  });
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
