import { CommonModule,isPlatformBrowser } from '@angular/common';
import { Component, OnInit,Inject,PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UtilisateurComponent } from '../utilisateur/utilisateur.component';
import { GererDemandeInscriComponent } from '../gerer-demande-inscri/gerer-demande-inscri.component';
import { Utilisateur } from '../Model/Entity';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-interface-administrateur',
  standalone: true,  
  imports: [CommonModule,RouterModule,UtilisateurComponent,GererDemandeInscriComponent],
  templateUrl: './interface-administrateur.component.html',
  styleUrl: './interface-administrateur.component.css'
})


export class InterfaceAdministrateurComponent implements OnInit {

  vueActuelle: string = 'accueil';
  user: Utilisateur[] = [];
  // 1. Ajoutez une variable pour stocker le nombre
  nombreDemandesEnAttente: number = 0;
  // Variable pour stocker les infos de l'utilisateur
  currentUser: any = null;
  
constructor(private router: Router, private apiservice: ApiService,@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
   this.chargerUtilisateurs();

  if (isPlatformBrowser(this.platformId)) {
    const userStr = localStorage.getItem('utilisateurConnecte');
    
    if (userStr) {
      // On transforme la chaîne en objet
      let data = JSON.parse(userStr);
      
      // 🚩 SÉCURITÉ : Si le résultat est encore une chaîne (à cause du bug des guillemets), on re-parse !
      if (typeof data === 'string') {
        this.currentUser = JSON.parse(data);
      } else {
        this.currentUser = data;
      }
    }
    
    console.log("Données nettoyées :", this.currentUser);

    if (this.currentUser?.role === 'Administrateur') {
        this.calculerNouvellesDemandes();
      }
  }
  }

  seDeconnecter() {
    // 1. Supprimer le token ou les infos du localStorage
    if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    }
    
    // 2. Rediriger vers la page de connexion
    this.router.navigate(['/login'], { replaceUrl: true });; // Changez selon votre route réelle
  }

  changerVue(nouvelleVue: string) {
    this.vueActuelle = nouvelleVue;
  }

  chargerUtilisateurs() {
    this.apiservice.getUtilisateurs().subscribe(
      (utilisateurs: Utilisateur[]) => {
        this.user = utilisateurs;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    );
  }

  calculerNouvellesDemandes() {
  this.apiservice.getAllDemandes().subscribe({
    next: (demandes) => {
      // On filtre le tableau pour ne garder que celles en attente, et on compte la longueur (.length)
      const demandesEnAttente = demandes.filter(d => d.statut === 'En_Attente');
      this.nombreDemandesEnAttente = demandesEnAttente.length;
    },
    error: (err) => {
      console.error("Erreur lors de la récupération des demandes", err);
    }
  });
}
}
