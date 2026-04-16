import { Component } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
email: string = '';
  message: string = '';
  erreur: string = '';
  enChargement: boolean = false;

  constructor(private router: Router, private authService: AuthServiceService) {}

  onSubmit() {
    this.enChargement = true;
    this.message = '';
    this.erreur = '';

    this.authService.demanderReinitialisation(this.email).subscribe({
      next: (response) => {
        this.message = response.message; // "Si cet email existe..."
        alert("cet email existe, un lien de réinitialisation a été généré.");
        this.enChargement = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.erreur = "Une erreur est survenue lors de la demande.";
        alert(this.erreur+" Votre email est incorrect.");
        this.enChargement = false;
      }
    });
  }
}
