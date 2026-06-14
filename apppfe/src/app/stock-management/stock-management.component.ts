import { Component } from '@angular/core';
import { StockDTO } from '../Model/stock';
import { StockService } from '../services/stock.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.css'
})
export class StockManagementComponent {

// ... Le reste de votre code reste inchangé ...
  stocksFaibles: StockDTO[] = [];
  loading: boolean = false;
  successMessage: string = '';

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.loadAlertesStock();
  }

  loadAlertesStock(): void {
    this.loading = true;
    this.stockService.getStocksFaibles().subscribe({
      next: (data) => {
        this.stocksFaibles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stocks', err);
        this.loading = false;
      }
    });
  }

  modifierQuantite(stock: StockDTO, increment: number): void {
    const nouvelleQuantite = stock.quantiteEnStock + increment;
    if (nouvelleQuantite < 0) return;

    this.stockService.mettreAJourQuantite(stock.id!, nouvelleQuantite).subscribe({
      next: () => {
        stock.quantiteEnStock = nouvelleQuantite;
        stock.estCritique = stock.quantiteEnStock <= stock.quantiteCritique;
        stock.estFaible = stock.quantiteEnStock <= stock.quantiteMinimum;
        
        this.successMessage = `Stock mis à jour avec succès !`;
        setTimeout(() => this.successMessage = '', 3000);
        
        if (!stock.estFaible) {
          this.stocksFaibles = this.stocksFaibles.filter(s => s.id !== stock.id);
        }
      },
      error: (err) => alert('Erreur lors de la mise à jour: ' + err.error?.error)
    });
  }

}
