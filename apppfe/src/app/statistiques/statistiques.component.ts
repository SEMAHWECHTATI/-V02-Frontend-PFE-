import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css'
})
export class StatistiquesComponent implements OnInit {

  private inventoryService = inject(InventoryService);

  stats = {
    totalArticles: 0,
    valeurTotale: 0,
    quantiteTotale: 0,
    stockFaible: 0,
    stockCritique: 0
  };

  chargement: boolean = false;

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  /**
   * 📊 Charger statistiques
   */
  chargerStatistiques(): void {
    console.log('📊 Chargement statistiques détaillées');
    this.chargement = true;

    this.inventoryService.getInventoryStatistics().subscribe({
      next: (res) => {
        this.stats = {
          totalArticles: res.nombreArticles || 0,
          valeurTotale: res.valeurTotale || 0,
          quantiteTotale: res.quantiteTotale || 0,
          stockFaible: res.articlesFaible || 0,
          stockCritique: res.articlesCritique || 0
        };
        this.chargement = false;
        console.log('✅ Statistiques chargées');
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.chargement = false;
      }
    });
  }

  /**
   * 📈 Calculer pourcentage
   */
  calculatePercentage(value: number, total: number): number {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  }
}