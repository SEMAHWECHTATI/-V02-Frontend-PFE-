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

  // NOUVELLES VARIABLES POUR L'ÉDITION
  modeEdition: boolean = false;
  utilisateurAEditer: Partial<Utilisateur> | any = {}; 

  utilisateurSelectionne: any | null = null;
  texteRecherche: string = '';
  dateRecherche: string = '';

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
          this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
          if (this.utilisateurSelectionne?.id === id) {
            this.utilisateurSelectionne = null; // Fermer les détails si on supprime l'utilisateur sélectionné
          }
        },
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }

  voirDetails(user: any): void {
    this.utilisateurSelectionne = user;
  }

  fermerDetails(): void {
    this.utilisateurSelectionne = null;
  }

  // --- 🛠️ NOUVELLES MÉTHODES POUR MODIFIER LES ACCÈS 🛠️ ---

  ouvrirFormulaireEdition(): void {
    this.modeEdition = true;
    // On fait une copie exacte pour ne pas modifier l'affichage avant de sauvegarder
    this.utilisateurAEditer = { ...this.utilisateurSelectionne };
  }

  fermerFormulaireEdition(): void {
    this.modeEdition = false;
    this.utilisateurAEditer = {};
  }

  sauvegarderModifications(): void {
    // 1. Vérification de sécurité (Debug)
    console.log("Données envoyées au backend :", this.utilisateurAEditer);

    // 2. Si l'ID est perdu, on l'empêche de faire planter le backend
    if (!this.utilisateurAEditer.id) {
      alert("Erreur interne : L'ID de l'utilisateur est introuvable.");
      return; 
    }

    // 3. Appel au service avec l'ID sécurisé
    this.utilisateurService.updateUtilisateur(this.utilisateurAEditer.id, this.utilisateurAEditer).subscribe({
      next: (utilisateurMisAJour) => {
        // Mettre à jour la liste générale (le tableau)
        const index = this.utilisateurs.findIndex(u => u.id === this.utilisateurAEditer.id);
        if (index !== -1) {
          // On remplace par l'objet mis à jour renvoyé par la base de données
          this.utilisateurs[index] = utilisateurMisAJour || this.utilisateurAEditer; 
        }
        
        // Mettre à jour la fiche détaillée ouverte
        this.utilisateurSelectionne = { ...this.utilisateurAEditer };
        
        // Fermer la modale
        this.fermerFormulaireEdition();
        
        alert('Les accès ont été mis à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la modification', err);
        alert('Une erreur est survenue lors de la sauvegarde.');
      }
    });
  }

  // --- FIN DES NOUVELLES MÉTHODES ---

  get utilisateursFiltres() {
    if (!this.utilisateurs) return [];

    return this.utilisateurs.filter(user => {
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

      let matchDate = true;
      if (this.dateRecherche) {
        if (user.date_Creation_Compte) {
          const dateCompte = new Date(user.date_Creation_Compte).toISOString().split('T')[0];
          matchDate = dateCompte === this.dateRecherche;
        } else {
          matchDate = false; 
        }
      }

      return matchTexte && matchDate;
    });
  }
}