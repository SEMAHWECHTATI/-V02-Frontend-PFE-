import { Component, OnInit, OnDestroy, inject, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // ✅ Ajout de isPlatformBrowser
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
  private equipmentService = inject(EquipementService); 

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
  { value: 'all', label: 'Tous les statuts' },
  { value: 'ACTIF', label: 'Actif' },
  { value: 'EN_REPARATION', label: 'En réparation' },
  { value: 'A_RECYCLER', label: 'À recycler' }
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
    maintainAspectRatio: false, // ✅ Conserve l'alignement sur les conteneurs CSS fixes
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
    maintainAspectRatio: false, // ✅ Empêche l'agrandissement incontrôlé sur le PDF
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

  // ✅ Injection explicite de PLATFORM_ID dans le constructeur
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.initialiserDonnees();
    this.configurerFiltres();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

initialiserDonnees(): void {
  this.chargement = true;
  this.chargerStatistiques();
  this.chargerArticles(); // C'est cette méthode qui déclenchera les filtres une fois les données reçues
  this.chargerDonneesGraphiques();
  this.chargerStatsEquipements();
}
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

chargerArticles(): void {
  console.log('📋 Chargement des articles...');
  this.inventoryService
    .getAllArticles()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        // Sécurité : Si res est null/undefined, on force un tableau vide
        this.articles = res || [];
        this.articlesFiltered = [...this.articles];
        console.log('✅ Articles charges:', this.articles.length);
        
        // 🔥 On applique les filtres seulement maintenant !
        this.appliquerFiltres();
      },
      error: (err) => {
        console.error('❌ Erreur articles:', err);
        this.articles = [];
        this.articlesFiltered = [];
      }
    });
}

  getEquipmentHealth(): 'good' | 'warning' | 'critical' {
    const healthPercentage = this.equipmentStats.tauxActivite;
    if (healthPercentage >= 80) return 'good';
    if (healthPercentage >= 60) return 'warning';
    return 'critical';
  }

  chargerDonneesGraphiques(): void {
    console.log('📈 Chargement des donnees graphiques...');
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

  private mettreAJourPieChart(): void {
    const total = this.stats.totalArticles;
    const faible = this.stats.stockFaible;
    const critique = this.stats.stockCritique;
    const ok = Math.max(0, total - (faible + critique));
    this.pieChartData.datasets[0].data = [ok, faible, critique];
  }

  configurerFiltres(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.appliquerFiltres();
      });
  }

  appliquerFiltres(): void {

    // 🛡️ Garde de sécurité anti-crash
  if (!this.articles || !Array.isArray(this.articles)) {
    this.articlesFiltered = [];
    return;
  }
    const { dateDebut, dateFin, typeArticle, statut } = this.filterForm.value;
    let filtered = [...this.articles];

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

    if (typeArticle) {
      filtered = filtered.filter(article => 
        article.type?.toLowerCase().includes(typeArticle.toLowerCase())
      );
    }

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

  selectionnerArticle(article: any): void {
    this.selectedArticle = article;
  }

  actualiserDonnees(): void {
    this.initialiserDonnees();
  }

  private calculateTauxDisponibilite(total: number, critique: number): number {
    if (total === 0) return 0;
    return Math.round(((total - critique) / total) * 100);
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getStockHealth(): 'good' | 'warning' | 'critical' {
    const healthPercentage = this.stats.tauxDisponibilite;
    if (healthPercentage >= 80) return 'good';
    if (healthPercentage >= 50) return 'warning';
    return 'critical';
  }

  getHealthMessage(): string {
    const health = this.getStockHealth();
    const messages: Record<string, string> = {
      good: 'OK - Situation saine',
      warning: 'ATTENTION - A surveiller',
      critical: 'CRITIQUE - Action requise'
    };
    return messages[health];
  }

  getHealthBadgeClass(): string {
    const health = this.getStockHealth();
    const classes: Record<string, string> = {
      good: 'badge-success',
      warning: 'badge-warning',
      critical: 'badge-danger'
    };
    return classes[health];
  }

  // =======================================================================
  // 📄 FONCTION EXPORT PDF SÉCURISÉE (Pas d'importation globale)
  // =======================================================================
  async exportPDF() {
    // Évite le crash d'évaluation au niveau du SSR Node
    if (!isPlatformBrowser(this.platformId)) return;

    // Sélection de l'enveloppe globale à capturer
    const element = document.querySelector('.dashboard-container');

    if (element) {
      // Importation dynamique asynchrone uniquement côté navigateur
      const html2pdf = (await import('html2pdf.js')) as any;

      const options = {
        margin:       [10, 10, 10, 10], 
        filename:     'Rapport_Statistiques_Parc.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2,           // Améliore la netteté des canvas Chart.js
          useCORS: true,      
          logging: false 
        },
        jsPDF:        { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape' // Format Paysage horizontal adapté aux graphiques
        },
        pagebreak: { 
          mode: ['css', 'legacy'],
          before: '[data-html2pdf-pagebreak="always"]' // Respecte les balises de saut de page
        }
      };

      html2pdf.default().set(options).from(element).save();
    } else {
      console.error("Le conteneur '.stats-container' est introuvable.");
    }
  }
}