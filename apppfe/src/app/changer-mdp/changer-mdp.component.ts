import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-changer-mdp',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './changer-mdp.component.html',
  styleUrl: './changer-mdp.component.css'
})
export class ChangerMdpComponent {
 email: string = '';
  nouveauMotDePasse: string = '';
  confirmerMotDePasse: string = '';
  erreur: string = '';
  chargement: boolean = false;

  constructor(
    private authent: AuthServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Récupérer l'email depuis les queryParams si fourni
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  changerMotDePasse() {
    if (!this.nouveauMotDePasse || !this.confirmerMotDePasse) {
      this.erreur = "Veuillez remplir tous les champs.";
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmerMotDePasse) {
      this.erreur = "Les mots de passe ne correspondent pas.";
      return;
    }

    this.erreur = '';
    this.chargement = true;

    this.authent.changerMotDePasse({ email: this.email, motDePasse: this.nouveauMotDePasse })
      .subscribe({
        next: (reponseBackend) => {
          console.log("Succès ! Réponse du backend :", reponseBackend); // 👈 Vérifiez la console (F12)
          this.chargement = false;
          alert("Mot de passe modifié avec succès !");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error("Erreur capturée par Angular :", err); // 👈 Si ça s'affiche, regardez l'erreur exacte
          this.chargement = false;
          this.erreur = err.error || 'Erreur lors de la modification du mot de passe';
        }
      });
    }
  }
