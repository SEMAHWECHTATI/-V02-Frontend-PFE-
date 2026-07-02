import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DemandeAchatService } from '../services/demande-achat.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';


export interface DemandeAchatRequest {
  nomMateriel: string;
  categorie: string;
  quantite: number;
  justification: string;
  serviceDemandeur: string;
  niveauUrgence: string;
  coutEstime: number;
  demandeur: string;
  dateDemande: string;
  emailDestinataire: string;
}

@Component({
  selector: 'app-demande-achat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './demande-achat.component.html',
  styleUrl: './demande-achat.component.css'
})
export class DemandeAchatComponent {
  loading = false;
  result: any = null;
  error = '';
  success = '';

  previewVisible = false;
  demandes: any[] = [];

  form = this.fb.group({
    nomMateriel: ['', Validators.required],
    categorie: ['', Validators.required],
    quantite: [1, [Validators.required, Validators.min(1)]],
    justification: ['', [Validators.required, Validators.minLength(10)]],
    serviceDemandeur: ['', Validators.required],
    niveauUrgence: ['MOYEN', Validators.required],
    coutEstime: [0, [Validators.required, Validators.min(0)]],
    demandeur: ['', Validators.required],
    dateDemande: ['', Validators.required],
    emailDestinataire: ['', [Validators.required, Validators.email]] 
  });

  constructor(
    private fb: FormBuilder,
    private api: DemandeAchatService
  ) {}

  togglePreview() {
    this.previewVisible = !this.previewVisible;
  }

  submit() {
    if (this.form.invalid) {
      this.error = 'Veuillez remplir les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.result = null;

    this.api.create(this.form.value as any).subscribe({
      next: (res) => {
        this.result = res;
        this.success = res?.message || 'Document généré avec succès.';
        this.loading = false;
        this.loadRecent();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de la génération.';
        this.loading = false;
      }
    });
  }

  downloadPdf(id?: number) {
    const docId = id || this.result?.id;
    if (!docId) return;

    this.api.downloadPdf(docId).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demande_achat_${docId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  resend(id: number) {
    this.api.resend(id).subscribe({
      next: () => this.success = `Document ${id} renvoyé par e-mail.`,
      error: () => this.error = `Échec renvoi du document ${id}.`
    });
  }

  loadRecent() {
    this.api.search().subscribe({
      next: (data) => this.demandes = data || [],
      error: () => {}
    });
  }

  ngOnInit() {
    const today = new Date().toISOString().slice(0, 10);
    this.form.patchValue({ dateDemande: today });
    this.loadRecent();
  }
}