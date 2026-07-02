import { Component, Input } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReclamationApiService } from '../services/reclamation-api.service';
import { CommonModule } from '@angular/common';
import { DemandeActionComponent } from "../demande-action/demande-action.component";
import { DemandeAchatComponent } from "../demande-achat/demande-achat.component";

@Component({
  selector: 'app-reclamation',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, DemandeActionComponent, DemandeAchatComponent],
  templateUrl: './reclamation.component.html',
  styleUrl: './reclamation.component.css'
})
export class ReclamationComponent {

@Input() ticketParentId: number | undefined;

  loading = false;
  result: any = null;
  error = '';
vueActuelle: 'demandeaction' | 'demandeachat' | 'reclamation' = 'reclamation';
  form = this.fb.group({
    equipement: ['', Validators.required],
    referenceArticle: [''],
    numeroSerie: [''],
    localisation: [''],
    serviceDemandeur: [''],
    symptomes: ['', Validators.required],
    historique: [''],
    stockInfo: [''],
    criticite: ['MOYEN'],
    declarant: [''],
    langueRapport: ['Français']
  });

  constructor(private fb: FormBuilder, private api: ReclamationApiService) {}
 changerVue(nouvelleVue: 'demandeaction' | 'demandeachat' | 'reclamation'): void {
    this.vueActuelle = nouvelleVue;

  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.result = null;

    this.api.genererRapport(this.form.value as any).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur serveur';
        this.loading = false;
      }
    });
  }

  downloadPdf() {
    const rapportId = this.result?.rapportId;
    if (!rapportId) return;

    this.api.telechargerPdf(rapportId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_reclamation_${rapportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

}
