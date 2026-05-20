import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Article, DemandeMateriel, TypeArticle } from '../Model/article';
import { DemandematrielServiceService } from '../services/demandematriel-service.service';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-demandematriel',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './demandematriel.component.html',
  styleUrl: './demandematriel.component.css'
})
export class DemandematrielComponent {

private demandeService = inject(DemandematrielServiceService);
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  articles: Article[] = [];
  chargement = false;
  messageSucces = '';
  messageErreur = '';

  typeDemandes = Object.values(TypeArticle);
  currentUser: any = {};

  ngOnInit(): void {
    this.chargerUtilisateur();
    this.initializeForm();
    this.chargerArticles();
  }

  chargerUtilisateur(): void {
    const userStr = localStorage.getItem('utilisateurConnecte');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      articleId: ['', Validators.required],
      quantiteDemandee: [1, [Validators.required, Validators.min(1)]],
      type: ['CONSOMMABLE', Validators.required],
      justification: ['', Validators.required],
      referenceTicket: ['']
    });
  }

  chargerArticles(): void {
    this.inventoryService.getAllArticles().subscribe({
      next: (res) => {
        this.articles = res.articles || [];
        console.log('✅ Articles chargés');
      },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.messageErreur = '⚠️ Veuillez remplir tous les champs';
      return;
    }

    this.chargement = true;
    const demande = this.form.value;

    this.demandeService.creerDemande(demande, this.currentUser.id).subscribe({
      next: (res) => {
        console.log('✅ Demande créée');
        this.messageSucces = '✅ Demande créée avec succès!';
        this.form.reset({ type: 'CONSOMMABLE', quantiteDemandee: 1 });
        this.chargement = false;

        setTimeout(() => this.messageSucces = '', 3000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.messageErreur = err.error?.error || 'Erreur lors de la création';
        this.chargement = false;
      }
    });
  }
}
