import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // ✅ Pour vérifier si on est sur le navigateur
import { DashboardService } from '../services/dashboard.service';
import { Chart, registerables } from 'chart.js';
import { KPIInterventionDTO, KPIInventoryDTO, KPIPerformanceDTO } from '../Model/dashboard';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatistiquesComponent } from "../statistiques/statistiques.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatistiquesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // ✅ Typage fort grâce à tes interfaces
  interventions!: KPIInterventionDTO;
  inventory!: KPIInventoryDTO;
  performance!: KPIPerformanceDTO;
  
  // Données brutes aplaties pour ton tableau PrimeNG avec filtres
  ticketsTableData: any[] = [];
  filteredTicketsData: any[] = [];
  
  // Critères de filtres
  selectedDomaine: string = '';
  domainesList: string[] = [];

  // ✅ On injecte PLATFORM_ID pour sécuriser l'exécution côté client
  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe(([interv, invent, perf]) => {
      this.interventions = interv as KPIInterventionDTO;
      this.inventory = invent as KPIInventoryDTO;
      this.performance = perf as KPIPerformanceDTO;

      this.domainesList = Object.keys(interv.repartitionParDomaine);
      this.prepareTableData();

      // ✅ On s'assure qu'on initialise les graphiques UNIQUEMENT sur le navigateur
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          try {
            this.initLineChart();
            this.initPieChart();
            this.initBarChart();
          } catch (error) {
            console.error("Erreur lors de l'initialisation des graphiques :", error);
          }
        }, 0);
      }
    });
  }

  // Transforme les Maps du JSON en liste pour le tableau détaillé
  prepareTableData() {
    this.ticketsTableData = Object.keys(this.interventions.tempsMoyenParDomaine).map(domaine => ({
      domaine: domaine,
      nombre: this.interventions.repartitionParDomaine[domaine] || 0,
      tempsMoyen: this.interventions.tempsMoyenParDomaine[domaine].toFixed(2)
    }));
    this.filteredTicketsData = [...this.ticketsTableData];
  }

  // Applique le filtre paramétrable
  appliquerFiltre() {
    if (!this.selectedDomaine) {
      this.filteredTicketsData = [...this.ticketsTableData];
    } else {
      this.filteredTicketsData = this.ticketsTableData.filter(t => t.domaine === this.selectedDomaine);
    }
  }

  // --- GRAPHIQUES (CHART.JS) ---
  initLineChart() {
    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['Jour', 'Semaine', 'Mois'],
        datasets: [{
          label: "Nombre d'interventions",
          data: [
            this.interventions.interventionsParPeriode.jour || this.interventions.interventionsParPeriode.semaine, 
            this.interventions.interventionsParPeriode.mois
          ],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        }]
      }
    });
  }

  initPieChart() {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: Object.keys(this.interventions.repartitionParDomaine),
        datasets: [{
          data: Object.values(this.interventions.repartitionParDomaine),
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
        }]
      }
    });
  }

  initBarChart() {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: Object.keys(this.interventions.tempsMoyenParTechnicien),
        datasets: [{
          label: 'Temps moyen de résolution (Heures)',
          data: Object.values(this.interventions.tempsMoyenParTechnicien),
          backgroundColor: '#6366f1'
        }]
      }
    });
  }

  // --- EXPORTS ---
  exportExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredTicketsData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Rapport KPIs': worksheet }, SheetNames: ['Rapport KPIs'] };
    XLSX.writeFile(workbook, 'Rapport_Analytique_IT.xlsx');
  }

 async exportPDF() {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = document.querySelector('.dashboard-container');

    if (element) {
      const html2pdf = (await import('html2pdf.js')) as any;

      const options = {
        margin:       [12, 12, 12, 12], // Marges de sécurité
        filename:     'Rapport_Analytique_IT.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2,           // Rendu haute définition (textes nets)
          useCORS: true,      
          logging: false,
          letterRendering: true
        },
        jsPDF:        { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape' // Format horizontal
        },
        // ✅ CONFIGURATION CRITIQUE : Gère intelligemment les sauts de page
        pagebreak: { 
          mode: ['css', 'legacy'], // Utilise l'attribut HTML et les règles CSS media print
          before: '[data-html2pdf-pagebreak="always"]' // Force le saut de page avant le tableau
        }
      };

      // Exécuter la génération du document de manière fluide
      html2pdf.default().set(options).from(element).save();
    }
  }
}