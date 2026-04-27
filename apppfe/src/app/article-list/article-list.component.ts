import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article } from '../Model/article';
import { InventoryService } from '../services/inventory.service';


@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit {

  private inventoryService = inject(InventoryService);

  articles: Article[] = [];
  filteredArticles: Article[] = [];
  chargement: boolean = false;
  searchKeyword: string = '';
  filtre: string = 'tous';

  ngOnInit(): void {
    this.chargerArticles();
  }

  /**
   * 📋 Charger articles
   */
  chargerArticles(): void {
    console.log('📋 Chargement articles');
    this.chargement = true;

    this.inventoryService.getAllArticles().subscribe({
      next: (res) => {
        this.articles = res.articles || [];
        this.filteredArticles = this.articles;
        this.chargement = false;
        console.log('✅ Articles chargés:', this.articles.length);
      },
      error: (err) => {
        console.error('❌ Erreur chargement articles:', err);
        this.chargement = false;
      }
    });
  }

  /**
   * 🔍 Rechercher articles
   */
  rechercher(): void {
    if (!this.searchKeyword.trim()) {
      this.filteredArticles = this.articles;
      return;
    }

    this.inventoryService.searchArticles(this.searchKeyword).subscribe({
      next: (res) => {
        this.filteredArticles = res.articles || [];
        console.log('✅ Recherche complétée:', this.filteredArticles.length);
      },
      error: (err) => console.error('❌ Erreur recherche:', err)
    });
  }

  /**
   * 🔄 Appliquer filtre
   */
  appliquerFiltre(): void {
    console.log('🔄 Application filtre:', this.filtre);

    switch (this.filtre) {
      case 'faible':
        this.inventoryService.getArticlesWithLowStock().subscribe({
          next: (res) => this.filteredArticles = res.articles || []
        });
        break;
      case 'critique':
        this.inventoryService.getArticlesWithCriticalStock().subscribe({
          next: (res) => this.filteredArticles = res.articles || []
        });
        break;
      default:
        this.filteredArticles = this.articles;
    }
  }

  /**
   * 🗑️ Archiver article
   */
  archiver(id: number): void {
    if (confirm('Êtes-vous sûr?')) {
      this.inventoryService.archiveArticle(id).subscribe({
        next: () => {
          console.log('✅ Article archivé');
          this.chargerArticles();
        },
        error: (err) => console.error('❌ Erreur:', err)
      });
    }
  }
}