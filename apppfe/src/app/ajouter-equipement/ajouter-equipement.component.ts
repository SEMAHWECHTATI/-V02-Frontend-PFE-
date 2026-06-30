import { Component, HostListener, OnInit } from '@angular/core';
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

articlesFiltres: any[] = []; // Liste temporaire affichée à l'écran
texteRechercheArticle: string = '';
afficherSuggestions: boolean = false;

localisationsFiltrees: any[] = []; // Liste filtrée affichée à l'écran
texteRechercheLocalisation: string = '';
afficherSuggestionsLoc: boolean = false;

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

filtrerArticles(): void {
  this.afficherSuggestions = true;
  
  if (!this.texteRechercheArticle.trim()) {
    this.articlesFiltres = this.articles;
    return;
  }

  const motCle = this.texteRechercheArticle.toLowerCase();
  
  // Recherche intelligente par référence OU par désignation
  this.articlesFiltres = this.articles.filter(art => 
    art.reference?.toLowerCase().includes(motCle) || 
    art.designation?.toLowerCase().includes(motCle)
  );
}

/**
 * 🎯 Déclenché lorsque l'utilisateur clique sur un article suggéré
 */
selectionnerArticle(art: any): void {
  this.nouveauEquipement.articleId = art.id;
  // Affiche l'article sélectionné de façon propre dans le champ de saisie
  this.texteRechercheArticle = `${art.reference} - ${art.designation}`;
  this.afficherSuggestions = false;
}

/**
 * ❌ Réinitialise le choix de l'article
 */
reinitialiserSelectionArticle(): void {
  this.nouveauEquipement.articleId = null;
  this.texteRechercheArticle = '';
  this.articlesFiltres = this.articles;
  this.afficherSuggestions = false;
}

// Optionnel : Fermer la liste de suggestions si on clique ailleurs sur la page
@HostListener('document:click', ['$event'])
clicExterieur(event: Event) {
  const elementForm = (event.target as HTMLElement).closest('.position-relative');
  if (!elementForm) {
    this.afficherSuggestions = false;
    // Si l'utilisateur quitte sans sélectionner et a effacé le texte, on reset l'ID
    if (!this.texteRechercheArticle) {
      this.nouveauEquipement.articleId = null;
    }
  }
}

/**
 * 🔍 Filtre la liste des emplacements selon la saisie (recherche multicritère)
 */
filtrerLocalisations(): void {
  this.afficherSuggestionsLoc = true;
  
  if (!this.texteRechercheLocalisation.trim()) {
    this.localisationsFiltrees = this.localisations;
    return;
  }

  const motCle = this.texteRechercheLocalisation.toLowerCase();
  
  // Recherche intelligente par Nom de salle, Bâtiment, Étage ou Numéro de bureau
  this.localisationsFiltrees = this.localisations.filter(loc => 
    loc.nom?.toLowerCase().includes(motCle) || 
    loc.batiment?.toLowerCase().includes(motCle) || 
    loc.etage?.toLowerCase().includes(motCle) || 
    loc.bureau?.toLowerCase().includes(motCle)
  );
}

/**
 * 🎯 Déclenché lors du clic sur un emplacement suggéré
 */
selectionnerLocalisation(loc: any | null): void {
  if (loc === null) {
    // Cas du Stock Central
    this.nouveauEquipement.localisationId = null;
    this.texteRechercheLocalisation = '-- Aucune (En Stock Central) --';
  } else {
    // Cas d'un emplacement physique précis
    this.nouveauEquipement.localisationId = loc.id;
    this.texteRechercheLocalisation = `${loc.nom} (Bât : ${loc.batiment || 'N/A'})`;
  }
  this.afficherSuggestionsLoc = false;
}

/**
 * ❌ Réinitialise la sélection de l'emplacement
 */
reinitialiserSelectionLocalisation(): void {
  this.nouveauEquipement.localisationId = null;
  this.texteRechercheLocalisation = '';
  this.localisationsFiltrees = this.localisations;
  this.afficherSuggestionsLoc = false;
}

// 🔐 Ferme la liste déroulante si l'utilisateur clique en dehors du champ sur l'écran
@HostListener('document:click', ['$event'])
clicExterieurComposant(event: Event) {
  const elementForm = (event.target as HTMLElement).closest('.position-relative');
  if (!elementForm) {
    this.afficherSuggestionsLoc = false;
    // Si le champ est totalement vidé à la main, on repasse automatiquement en stock central
    if (!this.texteRechercheLocalisation.trim()) {
      this.nouveauEquipement.localisationId = null;
    }
  }
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
