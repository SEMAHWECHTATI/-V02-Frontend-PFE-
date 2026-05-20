import { CommonModule,isPlatformBrowser } from '@angular/common';
import { Component, OnInit,Inject,PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UtilisateurComponent } from '../utilisateur/utilisateur.component';
import { GererDemandeInscriComponent } from '../gerer-demande-inscri/gerer-demande-inscri.component';
import { Utilisateur } from '../Model/Entity';
import { EnumerationComponent } from "../enumeration/enumeration.component";
import { CreateCategorieComponent } from "../create-categorie/create-categorie.component";
import { ListeTicketsComponent } from "../liste-tickets/liste-tickets.component";
import { CreateGroupeComponent } from "../create-groupe/create-groupe.component";
import { CreateTicketPageComponent } from "../create-ticket-page/create-ticket-page.component";
import { UtilisateurService } from '../services/utilisateur.service';
import { DemandeService } from '../services/demande.service';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';

@Component({
  selector: 'app-interface-administrateur',
  standalone: true,  
  imports: [CommonModule, RouterModule, UtilisateurComponent, GererDemandeInscriComponent, EnumerationComponent, CreateCategorieComponent, ListeTicketsComponent, CreateGroupeComponent,CreateTicketPageComponent, TicketDetailComponent],
  templateUrl: './interface-administrateur.component.html',
  styleUrl: './interface-administrateur.component.css'
})

export class InterfaceAdministrateurComponent implements OnInit {

  // Menu et disposition
  menuTicketsOuvert: boolean = false;
  vueActuelle: string = 'accueil';
  isDarkMode: boolean = false;
  isVerticalLayout: boolean = true;
  
  user: Utilisateur[] = [];
  nombreDemandesEnAttente: number = 0;
  currentUser: any = null;
  
  constructor(
    private router: Router, 
    private utilsateurservice: UtilisateurService,
    private demandeservice: DemandeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.chargerUtilisateurs();

    if (isPlatformBrowser(this.platformId)) {
      // Charger les préférences
      this.loadUserPreferences();

      const userStr = localStorage.getItem('utilisateurConnecte');
      
      if (userStr) {
        let data = JSON.parse(userStr);
        
        if (typeof data === 'string') {
          this.currentUser = JSON.parse(data);
        } else {
          this.currentUser = data;
        }
      }

      if (this.currentUser?.role === 'Administrateur') {
        this.calculerNouvellesDemandes();
      }

      // Appliquer le thème
      this.applyTheme();
      this.applyLayout();
    }
  }

  /**
   * Charger les préférences de l'utilisateur
   */
  loadUserPreferences(): void {
    if (isPlatformBrowser(this.platformId)) {
      const theme = localStorage.getItem('appTheme');
      const layout = localStorage.getItem('appLayout');

      this.isDarkMode = theme === 'dark';
      this.isVerticalLayout = layout !== 'horizontal';
    }
  }

  /**
   * Appliquer le thème sombre/clair
   */
  applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.documentElement;
      const body = document.body;
      
      if (this.isDarkMode) {
        element.setAttribute('data-theme', 'dark');
        body.classList.add('dark-mode');
        localStorage.setItem('appTheme', 'dark');
      } else {
        element.removeAttribute('data-theme');
        body.classList.remove('dark-mode');
        localStorage.setItem('appTheme', 'light');
      }
    }
  }

  /**
   * Basculer le mode sombre/clair
   */
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  /**
   * Appliquer la disposition
   */
  applyLayout(): void {
    if (isPlatformBrowser(this.platformId)) {
      const container = document.querySelector('.container-fluid');
      
      if (!this.isVerticalLayout) {
        container?.classList.add('horizontal-layout');
        localStorage.setItem('appLayout', 'horizontal');
      } else {
        container?.classList.remove('horizontal-layout');
        localStorage.setItem('appLayout', 'vertical');
      }
    }
  }

  /**
   * Changer la disposition
   */
  changeLayout(): void {
    this.isVerticalLayout = !this.isVerticalLayout;
    this.applyLayout();
  }

  seDeconnecter(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('utilisateurConnecte');
    }
    
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  changerVue(nouvelleVue: string): void {
    this.vueActuelle = nouvelleVue;
  }

  chargerUtilisateurs(): void {
    this.utilsateurservice.getUtilisateurs().subscribe(
      (utilisateurs: Utilisateur[]) => {
        this.user = utilisateurs;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    );
  }

  calculerNouvellesDemandes(): void {
    this.demandeservice.getAllDemandes().subscribe({
      next: (demandes) => {
        const demandesEnAttente = demandes.filter(d => d.statut === 'En_Attente');
        this.nombreDemandesEnAttente = demandesEnAttente.length;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des demandes", err);
      }
    });
  }
}