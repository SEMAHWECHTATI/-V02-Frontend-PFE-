import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../Model/Entity';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css'
})
export class UtilisateurComponent implements OnInit{

  utilisateurs: Utilisateur[] = [];
  chargement: boolean = true;
  erreur: string = '';

  constructor(private utilisateurService: ApiService) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs(): void {
    this.chargement = true;
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
        this.erreur = 'Impossible de charger la liste des utilisateurs.';
        this.chargement = false;
      }
    });
  }

  supprimer(id: number | undefined): void {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        next: () => {
          // Recharger la liste ou filtrer le tableau local
          this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
        },
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }

  utilisateurSelectionne: any | null = null; // Remplacez 'any' par votre interface Utilisateur si vous l'avez

voirDetails(user: any): void {
  this.utilisateurSelectionne = user;
}

fermerDetails(): void {
  this.utilisateurSelectionne = null;
}
// Variables pour les filtres
  texteRecherche: string = '';
  dateRecherche: string = '';

  // Getter pour filtrer la liste en temps réel
  get utilisateursFiltres() {
    if (!this.utilisateurs) return [];

    return this.utilisateurs.filter(user => {
      // 1. Filtre textuel (sur le matricule, nom, prénom, département, rôle ou statut)
      const rechercheMinuscule = this.texteRecherche.toLowerCase().trim();
      const champsComplets = (
        (user.matricule || '') + ' ' + 
        (user.nom || '') + ' ' + 
        (user.prenom || '') + ' ' + 
        (user.departement || '') + ' ' + 
        (user.role || '') + ' ' + 
        (user.statut || '')
      ).toLowerCase();
      
      const matchTexte = rechercheMinuscule === '' || champsComplets.includes(rechercheMinuscule);

      // 2. Filtre par date (Ici, configuré sur la date de création du compte)
      // Vous pouvez remplacer "user.date_Creation_Compte" par "user.date_dernier_Connex" si vous préférez !
      let matchDate = true;
      if (this.dateRecherche) {
        if (user.date_Creation_Compte) {
          const dateCompte = new Date(user.date_Creation_Compte).toISOString().split('T')[0];
          matchDate = dateCompte === this.dateRecherche;
        } else {
          matchDate = false; // Si on filtre par date mais que l'utilisateur n'en a pas
        }
      }

      return matchTexte && matchDate;
    });
  }

}
