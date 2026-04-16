import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
token: string = '';
  nouveauMotDePasse: string = '';
  message: string = '';
  erreur: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // On récupère le "?token=XYZ" de l'URL d'Angular
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    this.message = '';
    this.erreur = '';

    if (!this.token) {
      this.erreur = "Aucun token de sécurité trouvé dans le lien.";
      return;
    }

    this.authService.reinitialiserMotDePasse(this.token, this.nouveauMotDePasse).subscribe({
      next: (response) => {
        this.message = response.message;
        // Redirection vers le login après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        // Affiche l'erreur du backend (ex: "Le lien a expiré")
        this.erreur = err.error.erreur || "Erreur lors de la réinitialisation.";
      }
    });
  }
}
