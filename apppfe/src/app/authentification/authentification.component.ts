import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest, Utilisateur } from '../Model/Entity';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './authentification.component.html',
  styleUrl: './authentification.component.css'
})
export class AuthentificationComponent {
// Variables liées aux champs du formulaire
  email: string = '';
  motDePasse: string = '';
  utilisateurs : Utilisateur[] = [];
  message: string = '';

  
  // Variables d'état
  chargement: boolean = false;
  erreur: string = '';

   loginForm!: FormGroup;
  
  succes = '';
  showPassword = false;

  constructor(private router: Router , private authent: ApiService,) {}

    onSubmit() {
    if (!this.email || !this.motDePasse) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }

    this.erreur = '';
    this.chargement = true;

    const loginData: LoginRequest = { email: this.email, motDePasse: this.motDePasse };

   this.authent.login(loginData).subscribe({
  next: (res: any) => {
    if (res === 'CHANGER_MDP') {
      this.router.navigate(['/changer-mdp'], { queryParams: { email: this.email } });
    } else {
      this.message = res;
      console.log('Login réussi:', res);
      localStorage.setItem('utilisateurConnecte', JSON.stringify(res));
      this.router.navigate(['/index']);
    }
  },
  error: (err) => {
    this.erreur = err.error || 'Erreur lors de la connexion';
  }
});
  }
}
