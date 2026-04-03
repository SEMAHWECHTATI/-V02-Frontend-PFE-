import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApprobationDTO, DemandeReponseDTO, Groupe } from '../Model/Entity';
import { ApiService } from '../services/api.service';
@Component({
  selector: 'app-gerer-demande-inscri',
  standalone: true,
  
  imports: [CommonModule, FormsModule],
  templateUrl: './gerer-demande-inscri.component.html',
  styleUrl: './gerer-demande-inscri.component.css'
})
export class GererDemandeInscriComponent implements OnInit {

  listeRoles: any[] = [];
  listedepartement: any[] = [];
  demandes: DemandeReponseDTO[] = [];
  groupes: Groupe[] = []; // Pour la liste déroulante
  
  // Variables pour le formulaire d'approbation
  demandeEnCoursDApprobation: DemandeReponseDTO | null = null;
  formApprobation: ApprobationDTO = { roleAccorde: '', groupeId: null };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.chargerDemandes();
    this.chargerGroupes();
        this.chargerRole();
            this.chargerDepartements();


  }
   chargerDepartements() {
    this.apiService.getDepartements().subscribe({
      next: (donnees) => {
        this.listedepartement = donnees; // On remplit notre tableau
        // console.log("Départements récupérés depuis la BDD :", this.listedepartement);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des départements", err);
      }
    });
  }
 chargerRole() {
    this.apiService.getRoles().subscribe({
      next: (donnees) => {
        this.listeRoles = donnees; // On remplit notre tableau
        // console.log("Rôles récupérés depuis la BDD :", this.listeRoles);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des rôles", err);
      }
    });
  }
  chargerDemandes(): void {
    this.apiService.getAllDemandes().subscribe({
      next: (data) => this.demandes = data,
      error: (err) => console.error('Erreur chargement demandes', err)
    });
  }

  chargerGroupes(): void {
    this.apiService.getGroupes().subscribe({
      next: (data) => this.groupes = data,
      error: (err) => console.error('Erreur chargement groupes', err)
    });
  }

  // ---- ACTION REFUSER ----
  refuser(demande: DemandeReponseDTO): void {
    const motif = window.prompt(`Veuillez saisir le motif de refus pour ${demande.prenom} ${demande.nom} :`);
    
    // Si l'admin a cliqué sur "Annuler" ou n'a rien saisi, on annule.
    if (motif === null || motif.trim() === '') {
      return; 
    }

    this.apiService.refuserDemande(demande.id, motif).subscribe({
      next: (message) => {
        alert(message); // Affiche "La demande a été refusée."
        this.chargerDemandes(); // On recharge le tableau
      },
      error: (err) => alert('Erreur lors du refus : ' + err.message)
    });
  }

  // ---- ACTION ACCEPTER (Ouvre le panneau) ----
  preparerApprobation(demande: DemandeReponseDTO): void {
    this.demandeEnCoursDApprobation = demande;
    // On pré-remplit le rôle avec le rôle demandé s'il existe
    this.formApprobation = {
      roleAccorde: demande.roleDemande || '', // On met le rôle demandé par défaut
      groupeId: null // Mettre null au lieu de 0 pour éviter les erreurs côté Spring Boot
    };
    
  }

  annulerApprobation(): void {
    this.demandeEnCoursDApprobation = null;
    // On vide le formulaire par sécurité
    this.formApprobation = { roleAccorde: '', groupeId: null };
  }

  // ---- SOUMISSION DE L'APPROBATION ----
  confirmerApprobation(): void {
    if (!this.demandeEnCoursDApprobation) return;

    // Vérification basique côté frontend (correspond à votre règle backend)
    if ((this.formApprobation.roleAccorde === 'Technicien' || 
         this.formApprobation.roleAccorde === 'Gestionnaire_Stock' || 
         this.formApprobation.roleAccorde === 'Administrateur') && 
        !this.formApprobation.groupeId) {
      alert("Attention : Ce rôle nécessite obligatoirement l'affectation à un groupe !");
      return;
    }

    this.apiService.approuverDemande(this.demandeEnCoursDApprobation.id, this.formApprobation).subscribe({
      next: (message) => {
        alert("Succès : " + message);
        // this.demandeEnCoursDApprobation = null; // Ferme le panneau
        this.annulerApprobation(); // Ferme le panneau ET vide le formulaire
        this.chargerDemandes(); // Recharge le tableau
      },
      error: (err) => alert('Erreur : ' + (err.error || err.message))
    });
  }

  // Variables pour les filtres
  texteRecherche: string = '';
  dateRecherche: string = '';

  // Ce "getter" calcule la liste filtrée à chaque fois qu'on tape quelque chose
  get demandesFiltrees() {
    return this.demandes.filter(d => {
      
      // 1. Filtre par recherche textuelle (Nom, Prénom, Email ou Rôle)
      const rechercheMinuscule = this.texteRecherche.toLowerCase().trim();
      const matchTexte = rechercheMinuscule === '' || 
        (d.nom + ' ' + d.prenom + ' ' + d.email + ' ' + d.roleDemande +'' + d.departement +''+d.nomGroupe +'' +d.id +''+ d.statut).toLowerCase().includes(rechercheMinuscule);

      // 2. Filtre par date de demande
      let matchDate = true;
      if (this.dateRecherche) {
        // On s'assure de comparer uniquement la date (YYYY-MM-DD), sans l'heure
        const dateDeLaDemande = new Date(d.dateDemande).toISOString().split('T')[0];
        matchDate = dateDeLaDemande === this.dateRecherche;
      }

      // La demande est affichée seulement si elle correspond au texte ET à la date
      return matchTexte && matchDate;
    });

}
}
