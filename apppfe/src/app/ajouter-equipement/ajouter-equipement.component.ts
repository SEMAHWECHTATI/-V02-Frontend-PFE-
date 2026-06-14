import { Component, OnInit } from '@angular/core';
import { Localisation } from '../Model/Entity';
import { EquipementService } from '../services/equipement.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Article } from '../Model/article';

@Component({
  selector: 'app-ajouter-equipement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ajouter-equipement.component.html',
  styleUrl: './ajouter-equipement.component.css'
})
export class AjouterEquipementComponent implements OnInit {
  
  // Objet lié au formulaire (ngModell)
  nouveauEquipement = {
    numeroSerie: '',
    designation: '',
    articleId: null,
    localisationId: null,
    statut: 'ACTIF',
    observations: '',
    dateAcquisition: null,
    creePar: 'Utilisateur_Courant' // Idéalement récupéré d'un service d'authentification
  };

  articles: Article[] = [];
  localisations: Localisation[] = [];
  
  errorMessage = '';
  successMessage = '';

  // Nouvelles variables pour contrôler l'affichage des alertes customisées
  showAlertSuccess: boolean = false;
  showAlertError: boolean = false;
  messageAlerte: string = '';
  codeBarresGenere: string = '';

  constructor(private equipementService: EquipementService, private router: Router) { }

  ngOnInit(): void {
  // Charger les localisations (qui renvoie probablement directement un tableau)
  this.equipementService.getLocalisations().subscribe({
    next: (data) => this.localisations = data,
    error: (err) => console.error("Erreur localisations", err)
  });

  // 💡 CORRECTION ICI : On récupère l'objet, et on affecte "data.articles" au tableau
  this.equipementService.getArticles().subscribe({
    next: (response: any) => {
      // response vaut { total: 16, articles: [...] }
      this.articles = response.articles; 
    },
    error: (err) => {
      console.error("Erreur lors du chargement des articles", err);
    }
  });
}

  soumettreFormulaire(): void {
  // Réinitialisation des alertes à chaque tentative
  this.showAlertSuccess = false;
  this.showAlertError = false;
  this.errorMessage = ''; // On vide l'ancien bandeau "Network Error"
  
  if ( !this.nouveauEquipement.designation || !this.nouveauEquipement.articleId) {
    this.messageAlerte = "Veuillez remplir tous les champs obligatoires (*).";
    this.showAlertError = true;
    return;
  }

  this.equipementService.ajouterEquipement(this.nouveauEquipement).subscribe({
    next: (res) => {
      // Si le serveur répond avec le JSON correct
      this.codeBarresGenere = res.codeBarres;
      this.showAlertSuccess = true;
    },
    error: (err) => {
      // Si le serveur crash (StackOverflowError 500) ou problème réseau
      console.error("Détails de l'erreur reçue :", err);
      
      // Si l'équipement est quand même créé (cas du statut 201 avec crash Jackson)
      if (err.status === 201 || err.status === 200) {
        this.codeBarresGenere = "Généré en base (Erreur d'affichage)";
        this.showAlertSuccess = true;
      } else {
        // Vrai refus (Doublon de numéro de série, erreur 500, etc.)
        this.messageAlerte = err.error?.message || "L'ajout a été refusé par le serveur (Vérifiez si le numéro de série existe déjà).";
        this.showAlertError = true;
      }
    }
  });
}

  fermerAlerteSucces(): void {
    this.showAlertSuccess = false;
    this.router.navigate(['/gestionnaire-stock']); // Redirige après validation
  }

  fermerAlerteErreur(): void {
    this.showAlertError = false;
  }
}
