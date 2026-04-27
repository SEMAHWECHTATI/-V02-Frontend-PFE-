import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest, Utilisateur } from '../Model/Entity';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './authentification.component.html',
  styleUrl: './authentification.component.css'
})
export class AuthentificationComponent {
  email: string = '';
  motDePasse: string = '';
  utilisateurs: Utilisateur[] = [];
  message: string = '';

  chargement: boolean = false;
  erreur: string = '';

  loginForm!: FormGroup;
  succes = '';
  showPassword = false;

  constructor(private router: Router, private authent: AuthServiceService) {}

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
          // Convertir en objet s'il est en string
          let utilisateurConnecte = typeof res === 'string' ? JSON.parse(res) : res;

          console.log('📡 Réponse login:', utilisateurConnecte);
          console.log('📍 Groupes:', utilisateurConnecte.groupes);

          // 💾 Sauvegarder l'utilisateur AVEC les groupes ET LE TOKEN
          this.sauvegarderUtilisateur(utilisateurConnecte);

          this.message = 'Connexion réussie';
          console.log('✅ Utilisateur et Token sauvegardés');

          // 🔀 Redirection selon le rôle
          this.redirigerSelonRole(utilisateurConnecte);
        }
      },
      error: (err) => {
        this.erreur = err.error || 'Erreur lors de la connexion';
        this.chargement = false;
      }
    });
  }

  /**
   * Sauvegarde l'utilisateur ET le token dans le localStorage
   */
  private sauvegarderUtilisateur(utilisateur: any): void {
    const utilisateurAuCache = {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      matricule: utilisateur.matricule,
      telephone: utilisateur.telephone,
      departement: utilisateur.departement,
      role: utilisateur.role,
      statut: utilisateur.statut,
      groupes: utilisateur.groupes || [], // 📌 IMPORTANT !
      preferences: utilisateur.preferences || null,
      token: utilisateur.token
    };

    console.log('💾 Sauvegarde:', {
      user: `${utilisateurAuCache.prenom} ${utilisateurAuCache.nom}`,
      role: utilisateurAuCache.role,
      groupes: utilisateurAuCache.groupes.map((g: any) => g.nomGroupes)
    });

    // 1️⃣ On sauvegarde l'objet complet pour l'affichage de l'interface
    localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateurAuCache));

    // 2️⃣ LA CORRECTION EST ICI : On sauvegarde le token à part pour les Guards !
    if (utilisateur.token) {
      localStorage.setItem('token', utilisateur.token);
    } else {
      console.warn("⚠️ Attention : Aucun token n'a été reçu du backend !");
    }
  }

  /**
   * Redirige selon le rôle
   */
  private redirigerSelonRole(utilisateur: any): void {
    const role = utilisateur.role?.toLowerCase() || '';

    console.log('🔀 Redirection vers espace:', role);

    if (role === 'demandeur') {
      this.router.navigate(['/espace-demandeur']);
    } else if (role === 'administrateur' ) {
      this.router.navigate(['/index']);
    } else if (role === 'technicien') {
      this.router.navigate(['/technicien']);
    } else if (role === 'gestionnaire_stock' || role === 'gestionnaire_stock') {
      this.router.navigate(['/gestionnaire-stock']);
    } 
    
    else {
      console.error("❌ Rôle inconnu, impossible de rediriger :", role);
      this.chargement = false;
    }
  }
}