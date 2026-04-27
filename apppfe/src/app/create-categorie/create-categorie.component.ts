import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategorieService } from '../services/categorie.service';
import { EnumerationService } from '../services/enumeration.service';
import { GroupeService } from '../services/groupe.service';

@Component({
  selector: 'app-create-categorie',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-categorie.component.html',
  styleUrl: './create-categorie.component.css'
})
export class CreateCategorieComponent implements OnInit {

  categorieForm: FormGroup;
  message = '';
  TypeTicketListe: string[] = [];
  groupesListe: any[] = []; // 👈 Pour stocker les groupes (ID 1 à 5)

  constructor(private fb: FormBuilder, 
    private categorieservice: CategorieService,
    private enumeservice: EnumerationService,
    private groupeservice: GroupeService) {
    this.categorieForm = this.fb.group({
      nomCategorie: ['', [Validators.required, Validators.minLength(3)]], // 👈 Ajout du nom
      type: [null, Validators.required],
      groupeResponsable: [null, Validators.required], // 👈 Ajout du groupe (stockera l'ID)
      descriptionCategorie: [''] // 👈 J'ai renommé pour correspondre à votre JSON backend
    });
  }

  ngOnInit(): void {
    // 1. Charger les types de tickets
    this.enumeservice.getTypeTicket().subscribe({
      next: (data) => this.TypeTicketListe = data,
      error: (err) => console.error('Erreur statut TypeTicket:', err)
    });  

    // 2. Charger les groupes responsables pour la liste déroulante 👈
    this.groupeservice.getGroupes().subscribe({
      next: (data) => this.groupesListe = data,
      error: (err) => console.error('Erreur chargement des groupes:', err)
    });
  }

  onSubmit() {
    if (this.categorieForm.valid) {
      const formValue = this.categorieForm.value;

      // 👈 Formatage exact attendu par votre backend Spring Boot
      const nouvelleCategorie = { 
        nomCategorie: formValue.nomCategorie,
        descriptionCategorie: formValue.descriptionCategorie,
        type: formValue.type,
        actif: true,
        groupeId: formValue.groupeResponsable // On envoie directement l'ID du groupe sélectionné
       
      };

      this.categorieservice.creerCategorie(nouvelleCategorie).subscribe({
        next: (res) => {
          this.message = "✅ Catégorie créée avec succès !";
          this.categorieForm.reset();
        },
        error: (err) => {
          this.message = "❌ Erreur lors de la création.";
          console.error(err);
        }
      });
    } else {
      this.categorieForm.markAllAsTouched();
    }
  }
}