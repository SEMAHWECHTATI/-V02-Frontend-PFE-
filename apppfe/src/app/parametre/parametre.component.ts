import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-parametre',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './parametre.component.html',
  styleUrl: './parametre.component.css'
})
export class ParametreComponent implements OnInit {

  // 1. Déclarez la propriété manquante attendue par le HTML
  chatbotConfigForm!: FormGroup; 

  // Exemple de liste pour éviter d'autres erreurs si vous utilisez mon template précédent
  groupesListe = [
    { id: 1, nomGroupes: 'Équipe Support' },
    { id: 2, nomGroupes: 'Équipe Réseau' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // 2. Initialisez le formulaire lors du chargement du composant
    this.chatbotConfigForm = this.fb.group({
      botName: ['', [Validators.required]],
      welcomeMessage: ['Bonjour ! Comment puis-je vous aider ?'],
      defaultGroupEscalation: [null],
      botModel: ['rules']
    });
  }

  onSubmit(): void {
    if (this.chatbotConfigForm.valid) {
      console.log('Données du bot enregistrées :', this.chatbotConfigForm.value);
    }
  }
}


