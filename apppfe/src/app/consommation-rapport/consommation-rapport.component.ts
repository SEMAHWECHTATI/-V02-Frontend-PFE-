import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-consommation-rapport',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consommation-rapport.component.html',
  styleUrls: ['./consommation-rapport.component.css']
})
export class ConsommationRapportComponent implements OnInit {
  // Contient la liste brute reçue du serveur
  listeConsommations: any[] = [];
  // Contient la liste affichée à l'écran après filtrage
  consommationsFiltrees: any[] = [];
  
  // Gestion de l'état de l'interface
  isLoading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(private ticketService: InventoryService) {}

  ngOnInit(): void {
    this.chargerRapportConsommations();
  }

  /**
   * 🔄 Charge les données depuis l'API globale
   */
  chargerRapportConsommations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.ticketService.getToutesLesConsommations().subscribe({
      next: (data: any[]) => {
        console.log('📊 Données consommations reçues :', data);
        this.listeConsommations = data || [];
        this.consommationsFiltrees = [...this.listeConsommations];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur récupération historique pièces :', err);
        this.errorMessage = 'Impossible de charger le journal des consommations. Veuillez vérifier la connexion au serveur.';
        this.isLoading = false;
      }
    });
  }

  /**
   * 🔍 Applique un filtre de recherche dynamique multi-critères
   */
  appliquerFiltre(): void {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.consommationsFiltrees = [...this.listeConsommations];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();

    this.consommationsFiltrees = this.listeConsommations.filter(conso => {
      // 1. Recherche par référence ticket
      const matchTicket = conso.referenceTicket && conso.referenceTicket.toLowerCase().includes(term);
      
      // 2. Recherche par article (Désignation ou Référence constructeur)
      const matchArticle = conso.article && (
        (conso.article.designation && conso.article.designation.toLowerCase().includes(term)) ||
        (conso.article.reference && conso.article.reference.toLowerCase().includes(term))
      );
      
      // 3. Recherche par nom ou prénom du responsable/technicien
      const matchResponsable = conso.responsable && (
        (conso.responsable.nom && conso.responsable.nom.toLowerCase().includes(term)) ||
        (conso.responsable.prenom && conso.responsable.prenom.toLowerCase().includes(term))
      );

      // 4. Recherche par commentaire
      const matchCommentaire = conso.commentaire && conso.commentaire.toLowerCase().includes(term);

      return matchTicket || matchArticle || matchResponsable || matchCommentaire;
    });
  }
}