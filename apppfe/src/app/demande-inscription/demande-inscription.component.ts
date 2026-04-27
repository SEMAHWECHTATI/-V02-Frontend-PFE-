import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemandeCreationDTO } from '../Model/Entity';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService } from '../services/demande.service';
import { GroupeService } from '../services/groupe.service';
import { EnumerationService } from '../services/enumeration.service';

    @Component({
        selector: 'app-demande-inscription',
         standalone: true,
          imports: [FormsModule, CommonModule],
             templateUrl: './demande-inscription.component.html',
            styleUrl: './demande-inscription.component.css'
         })
        export class DemandeInscriptionComponent implements OnInit {

      constructor(  private demandeservice: DemandeService,
        private groupeservice: GroupeService,
      private router: Router,
      private enumservice:EnumerationService,
      private route: ActivatedRoute){}
    // On initialise l'objet basé sur le DTO
     demande: DemandeCreationDTO = {
    nom: '',
    prenom: '',
    email: '',
    matricule: '',
    telephone: '',
    departement: '',
    motifDemande: '',
    roleDemande: '',
    groupeId: null
     };
// 👇 1. Créez un tableau vide pour stocker les groupes reçus du backend
  listeGroupes: any[] = [];
  listeRoles: any[] = [];
  listedepartement: any[] = [];

     chargement: boolean = false;
        erreur: string = '';
      succes: string = '';

      // 👇 2. Cette méthode se lance automatiquement à l'ouverture de la page
  ngOnInit(): void {
    this.chargerGroupes();
    this.chargerRole();
    this.chargerDepartements();
  }

  // 👇 3. On appelle le service pour remplir le tableau
  chargerGroupes() {
    this.groupeservice.getGroupes().subscribe({
      next: (donnees) => {
        this.listeGroupes = donnees; // On remplit notre tableau
        // console.log("Groupes récupérés depuis la BDD :", this.listeGroupes);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des groupes", err);
      }
    });
  }
  chargerRole() {
    this.enumservice.getRoles().subscribe({
      next: (donnees) => {
        this.listeRoles = donnees; // On remplit notre tableau
        // console.log("Rôles récupérés depuis la BDD :", this.listeRoles);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des rôles", err);
      }
    });
  }
   chargerDepartements() {
    this.enumservice.getDepartements().subscribe({
      next: (donnees) => {
        this.listedepartement = donnees; // On remplit notre tableau
        // console.log("Départements récupérés depuis la BDD :", this.listedepartement);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des départements", err);
      }
    });
  }
onSubmit() {
  this.erreur = '';
  this.succes = ''; 

  // Validation basique
  if (!this.demande.email || !this.demande.nom || !this.demande.prenom) {
    this.erreur = 'Veuillez remplir les champs obligatoires.';
    return;
  }

  this.chargement = true;

  // 1. FORMATAGE DU PAYLOAD POUR SPRING BOOT
  const payloadAEnvoyer = {
    nom: this.demande.nom,
    prenom: this.demande.prenom,
    email: this.demande.email,
    matricule: this.demande.matricule,
    telephone: this.demande.telephone,
    departement: this.demande.departement,
    motifDemande: this.demande.motifDemande,
    roleDemande: this.demande.roleDemande, 
    // On transforme l'ID sélectionné en un objet
    groupeARejoindre: this.demande.groupeId ? { id: Number(this.demande.groupeId) } : null
  };

  // console.log('Données reformatées envoyées au backend :', payloadAEnvoyer);

  // 2. ENVOI DES DONNÉES FORMATÉES (On utilise 'as any' pour contourner le blocage TypeScript)
  this.demandeservice.envoyerDemande(payloadAEnvoyer as any).subscribe({
    next: (reponseBackend) => {
      // console.log("Succès ! Réponse du backend :", reponseBackend);
      this.chargement = false;
      // 1. Affiche l'alerte (le code s'arrête ici tant qu'on ne clique pas sur OK)
      alert("Votre demande a été envoyée avec succès à l'administrateur.");
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error("Erreur capturée par Angular :", err);
      this.chargement = false;
      this.erreur = err.error?.message || err.error || "Erreur lors de l'envoi de la demande (vérifiez les champs).";
    }
  });

  // J'ai totalement supprimé le "setTimeout" qui traînait ici !
}
        }
