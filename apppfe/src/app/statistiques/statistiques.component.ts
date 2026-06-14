import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, Chart, registerables } from 'chart.js';
import { EquipementService } from '../services/equipement.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgChartsModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css'
})
export class StatistiquesComponent implements OnInit, OnDestroy {
  
  @ViewChild('lineChartRef') lineChart?: BaseChartDirective;
  @ViewChild('pieChartRef') pieChart?: BaseChartDirective;
  @ViewChild('barChartRef') barChart?: BaseChartDirective;
  
  private inventoryService = inject(InventoryService);
    private equipmentService = inject(EquipementService); // ✅ Ajouter

  private destroy$ = new Subject<void>();

  // ===== STATE MANAGEMENT =====
  chargement: boolean = false;
  erreur: string | null = null;
  activeTab: 'overview' | 'articles' | 'equipments' | 'trends' = 'overview';
  // ===== STATISTICS =====
  stats = {
    totalArticles: 0,
    valeurTotale: 0,
    quantiteTotale: 0,
    stockFaible: 0,
    stockCritique: 0,
    tauxDisponibilite: 0
  };
    equipmentStats = {
    totalEquipements: 0,
    actifs: 0,
    enReparation: 0,
    aRecycler: 0,
    tauxActivite: 0
  };

  
  // ===== ARTICLES LIST =====
  articles: any[] = [];
  articlesFiltered: any[] = [];
  selectedArticle: any = null;

  // ===== FILTERS =====
  filterForm = new FormGroup({
    dateDebut: new FormControl(''),
    dateFin: new FormControl(''),
    typeArticle: new FormControl(''),
    statut: new FormControl('tous')
  });

  statusOptions = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'ok', label: 'En stock ✓' },
    { value: 'faible', label: 'Stock faible ⚠️' },
    { value: 'critique', label: 'Stock critique 🔴' }
  ];

  // ===== LINE CHART (Évolution Financière) =====
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Valeur Globale du Parc (EUR)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: { 
        display: true, 
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 'bold' as const },
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: '#60a5fa',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: (context: any) => ` ${context.parsed.y.toLocaleString('fr-FR')} EUR`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        ticks: { 
          callback: (value : any) => {
            const num = Number(value);
            return num >= 1000 ? (num / 1000).toFixed(0) + 'k' : num.toString();
          },
          font: { size: 11 }
        }
      } as any,
      x: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      } as any
    }
  };

  // ===== PIE CHART (Répartition des Stocks) =====
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartConfiguration['data'] = {
    labels: ['Articles OK', 'Stock Faible', 'Stock Critique'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' as const },
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderColor: '#60a5fa',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // ===== BAR CHART (Top 10 Articles) =====
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Valeur (EUR)',
        data: [],
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af',
        borderWidth: 0,
        borderRadius: 8,
        hoverBackgroundColor: '#2563eb'
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: { size: 12, weight: 'bold' as const },
          padding: 15,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderColor: '#60a5fa',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => ` ${context.parsed.x.toLocaleString('fr-FR')} EUR`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            const num = Number(value);
            return num >= 1000 ? (num / 1000).toFixed(0) + 'k' : num.toString();
          },
          font: { size: 11 }
        },
        grid: { color: 'rgba(226, 232, 240, 0.5)' }
      } as any,
      y: {
        ticks: { font: { size: 11 } },
        grid: { display: false }
      } as any
    }
  };

  // ===== HORIZONTAL BAR CHART (Distribution par Type) =====
  public typeChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Quantite',
        data: [],
        backgroundColor: '#8b5cf6',
        borderRadius: 8,
        hoverBackgroundColor: '#7c3aed'
      }
    ]
  };

  public typeChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderColor: '#60a5fa',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { font: { size: 11 } },
        grid: { color: 'rgba(226, 232, 240, 0.5)' }
      } as any,
      y: {
        ticks: { font: { size: 11 } },
        grid: { display: false }
      } as any
    }
  };

  ngOnInit(): void {
    this.initialiserDonnees();
    this.configurerFiltres();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 Initialiser toutes les données au chargement
   */
  initialiserDonnees(): void {
    this.chargement = true;
    this.chargerStatistiques();
    this.chargerArticles();
    this.chargerDonneesGraphiques();
    this.appliquerFiltres();
     this.chargerStatsEquipements();
  }

  /**
   * 📊 Charger les statistiques globales
   */
  chargerStatistiques(): void {
    console.log('📊 Chargement des statistiques...');

    this.inventoryService
      .getInventoryStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.stats = {
            totalArticles: res.totalArticles ?? 0,
            valeurTotale: res.valeurTotale ?? 0,
            quantiteTotale: res.totalQuantite ?? 0,
            stockFaible: res.nombreArticlesFaible ?? 0,
            stockCritique: res.nombreArticlesCritique ?? 0,
            tauxDisponibilite: this.calculateTauxDisponibilite(
              res.totalArticles ?? 0,
              res.nombreArticlesCritique ?? 0
            )
          };
          
          this.mettreAJourPieChart();
          console.log('✅ Statistiques chargées:', this.stats);
        },
        error: (err) => {
          console.error('❌ Erreur statistiques:', err);
          this.erreur = 'Impossible de charger les statistiques';
        }
      });
  }

   chargerStatsEquipements(): void {
    console.log('📦 Chargement des statistiques equipements...');
    this.equipmentService
      .getEquipmentStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.equipmentStats = {
            totalEquipements: res.totalEquipements ?? 0,
            actifs: res.actifs ?? 0,
            enReparation: res.enReparation ?? 0,
            aRecycler: res.aRecycler ?? 0,
            tauxActivite: res.tauxActivite ?? 0
          };
          this.chargement = false;
          console.log('✅ Stats equipements chargees:', this.equipmentStats);
        },
        error: (err) => {
          console.error('❌ Erreur stats equipements:', err);
          this.chargement = false;
        }
      });
  }


  /**
   * 📋 Charger la liste des articles
   */
  chargerArticles(): void {
    console.log('📋 Chargement des articles...');

    this.inventoryService
      .getAllArticles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.articles = res || [];
          this.articlesFiltered = this.articles;
          console.log('✅ Articles charges:', this.articles.length);
        },
        error: (err) => {
          console.error('❌ Erreur articles:', err);
          this.articles = [];
        }
      });
  }

    getEquipmentHealth(): 'good' | 'warning' | 'critical' {
    const healthPercentage = this.equipmentStats.tauxActivite;
    if (healthPercentage >= 80) return 'good';
    if (healthPercentage >= 60) return 'warning';
    return 'critical';
  }
  /**
   * 📈 Charger les données des graphiques
   */
  chargerDonneesGraphiques(): void {
    console.log('📈 Chargement des donnees graphiques...');

    // Bar Chart - Top 10 Articles
    this.inventoryService
      .getValueByType()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data && Object.keys(data).length > 0) {
            const sortedEntries = Object.entries(data)
              .sort((a: any, b: any) => b[1] - a[1])
              .slice(0, 10);

            this.barChartData.labels = sortedEntries.map((item: any) => item[0]);
            this.barChartData.datasets[0].data = sortedEntries.map((item: any) => item[1]);
            
            console.log('✅ Top 10 Articles charges');
          }
        },
        error: (err) => console.error('❌ Erreur top articles:', err)
      });

    // Line Chart - Évolution financière
    this.inventoryService
      .getEvolutionFinanciere('', '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.labels && res?.valeurs) {
            this.lineChartData.labels = res.labels;
            this.lineChartData.datasets[0].data = res.valeurs;
          }
        },
        error: (err) => console.error('❌ Erreur evolution:', err)
      });

    this.chargement = false;
  }

  /**
   * 🔄 Mettre à jour le pie chart
   */
  private mettreAJourPieChart(): void {
    const total = this.stats.totalArticles;
    const faible = this.stats.stockFaible;
    const critique = this.stats.stockCritique;
    const ok = Math.max(0, total - (faible + critique));

    this.pieChartData.datasets[0].data = [ok, faible, critique];
  }

  /**
   * ⏱️ Configurer les filtres
   */
  configurerFiltres(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.appliquerFiltres();
      });
  }

  /**
   * 🔍 Appliquer tous les filtres
   */
  appliquerFiltres(): void {
    const { dateDebut, dateFin, typeArticle, statut } = this.filterForm.value;

    let filtered = [...this.articles];

    // Filtre par statut
    if (statut && statut !== 'tous') {
      filtered = filtered.filter(article => {
        const seuil = article.seuilAlerte || 0;
        const quantite = article.quantite || 0;
        
        if (statut === 'ok') return quantite > seuil;
        if (statut === 'faible') return quantite <= seuil && quantite > 0;
        if (statut === 'critique') return quantite === 0;
        return true;
      });
    }

    // Filtre par type
    if (typeArticle) {
      filtered = filtered.filter(article => 
        article.type?.toLowerCase().includes(typeArticle.toLowerCase())
      );
    }

    // Filtre par date (si les articles ont une dateAjout)
    if (dateDebut) {
      const debut = new Date(dateDebut);
      filtered = filtered.filter(article => {
        const dateArticle = new Date(article.dateAjout || '');
        return dateArticle >= debut;
      });
    }

    if (dateFin) {
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      filtered = filtered.filter(article => {
        const dateArticle = new Date(article.dateAjout || '');
        return dateArticle <= fin;
      });
    }

    this.articlesFiltered = filtered;
    console.log(`🔍 ${filtered.length} articles filtres`);
  }

  /**
   * 📌 Sélectionner un article pour les détails
   */
  selectionnerArticle(article: any): void {
    this.selectedArticle = article;
  }

  /**
   * 🔄 Actualiser les données
   */
  actualiserDonnees(): void {
    this.initialiserDonnees();
  }

  /**
   * 🧮 Calculer le taux de disponibilité
   */
  private calculateTauxDisponibilite(total: number, critique: number): number {
    if (total === 0) return 0;
    return Math.round(((total - critique) / total) * 100);
  }

  /**
   * 🧮 Calculer un pourcentage
   */
  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * 🎯 Obtenir l'état de santé du stock
   */
  getStockHealth(): 'good' | 'warning' | 'critical' {
    const healthPercentage = this.stats.tauxDisponibilite;
    if (healthPercentage >= 80) return 'good';
    if (healthPercentage >= 50) return 'warning';
    return 'critical';
  }

  /**
   * 📝 Obtenir le message de santé
   */
  getHealthMessage(): string {
    const health = this.getStockHealth();
    const messages: Record<string, string> = {
      good: 'OK - Situation saine',
      warning: 'ATTENTION - A surveiller',
      critical: 'CRITIQUE - Action requise'
    };
    return messages[health];
  }

  /**
   * 🎨 Obtenir la couleur du badge santé
   */
  getHealthBadgeClass(): string {
    const health = this.getStockHealth();
    const classes: Record<string, string> = {
      good: 'badge-success',
      warning: 'badge-warning',
      critical: 'badge-danger'
    };
    return classes[health];
  }
}
