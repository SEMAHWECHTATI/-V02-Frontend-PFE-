import { Component } from '@angular/core';
import { StockDTO } from '../Model/stock';
import { StockService } from '../services/stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent {


  stocks: StockDTO[] = [];
  stocksFiltres: StockDTO[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.recupererToutLeStock();
  }

  recupererToutLeStock(): void {
    this.loading = true;
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data;
        this.stocksFiltres = data; // Par défaut, la liste filtrée contient tout
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération globale du stock', err);
        this.loading = false;
      }
    });
  }

  // 🔍 Filtrer dynamiquement côté Front-end par désignation ou référence
  filtrerStock(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.stocksFiltres = this.stocks;
    } else {
      this.stocksFiltres = this.stocks.filter(s => 
        s.articleDesignation?.toLowerCase().includes(term) || 
        s.articleReference?.toLowerCase().includes(term) ||
        s.codeBarresArticle?.includes(term)
      );
    }
  }
}
