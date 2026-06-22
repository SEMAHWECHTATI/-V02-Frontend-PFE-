import { Component, OnInit, OnDestroy } from '@angular/core';
import { StockDTO } from '../Model/stock';
import { StockService } from '../services/stock.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent implements OnInit, OnDestroy {
  // 🔄 Gestion des états de chargement unifiée
  loading: boolean = false;

  // 📊 Listes de données
  stocks: StockDTO[] = [];
  stocksFiltres: StockDTO[] = [];
  searchTerm: string = '';

  // 🛡️ Gestionnaire de désabonnement RxJS
  private destroy$ = new Subject<void>();

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.recupererToutLeStock();
  }

  ngOnDestroy(): void {
    // Évite les fuites de mémoire lors de la destruction du composant
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 Récupère la liste complète des stocks depuis le backend
   */
  recupererToutLeStock(): void {
    this.loading = true;
    this.stockService.getAllStocks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stocks = data;
          this.stocksFiltres = data; // Par défaut, la liste filtrée contient tout
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur lors de la récupération globale du stock', err);
          this.loading = false;
        }
      });
  }

  /**
   * 🗑️ Supprime une ligne de stock après confirmation
   */
  supprimerStock(stockId: number | undefined): void {
    // 1. Sécurité : Vérification de la présence de l'ID
    if (!stockId) {
      alert("❌ Impossible de supprimer ce stock : l'identifiant est introuvable.");
      return;
    }

    // 2. Demande de confirmation à l'utilisateur
    const confirmation = confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement cette ligne de stock ?\nCette action est irréversible.");
    if (!confirmation) return;

    this.loading = true;

    // 3. Appel du service d'inventaire (méthode deleteStock harmonisée)
    this.stockService.deleteStock(stockId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`✅ Stock ID ${stockId} supprimé avec succès.`);
          alert('🗑️ Le stock a été supprimé avec succès.');
          
          // 4. Recharger la liste pour rafraîchir le tableau HTML immédiatement
          this.recupererToutLeStock();
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Erreur lors de la suppression du stock:', err);
          
          // Extraction propre du message d'erreur du backend
          const messageErreur = err.error?.message || err.error?.error || err.message || 'Erreur inconnue du serveur.';
          alert(`❌ Impossible de supprimer le stock.\nDétail technique : ${messageErreur}`);
        }
      });
  }

  /**
   * 🔍 Filtrer dynamiquement côté Front-end par désignation, référence ou code-barres
   */
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