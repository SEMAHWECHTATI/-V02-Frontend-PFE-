import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnumerationService } from '../services/enumeration.service';

@Component({
  selector: 'app-enumeration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './enumeration.component.html',
  styleUrl: './enumeration.component.css'
})
export class EnumerationComponent implements OnInit {

  monFormulaire: FormGroup;
  
  // Déclaration de tous les tableaux pour stocker les listes
  rolesListe: string[] = [];
  departementsListe: string[] = [];
  actionAuditListe: string[] = [];
  groupeTechnicienListe: string[] = [];
  statutDemandeInscriListe: string[] = [];
  typeAlerteListe: string[] = [];
  statutUtilisateurListe: string[] = [];
  prioriteListe: string[] = [];
  StatutTicketListe: string[] = [];
  TypeNoteListe: string[] = [];
  TypeTicketListe: string[] = [];
  constructor(private fb: FormBuilder, private enumservice: EnumerationService) {
    this.monFormulaire = this.fb.group({
      role: [''],
      departement: ['']
    });
  }

  ngOnInit(): void {
  // 1. Rôles
    this.enumservice.getRoles().subscribe({
      next: (data) => this.rolesListe = data,
      error: (err) => console.error('Erreur rôles:', err)
    });

    // 2. Départements
    this.enumservice.getDepartements().subscribe({
      next: (data) => this.departementsListe = data,
      error: (err) => console.error('Erreur départements:', err)
    });

    // 3. Actions Audit
    this.enumservice.getActionAudit().subscribe({
      next: (data) => this.actionAuditListe = data,
      error: (err) => console.error('Erreur action audit:', err)
    });

    // 4. Groupes Technicien
    this.enumservice.getGroupeTechnicien().subscribe({
      next: (data) => this.groupeTechnicienListe = data,
      error: (err) => console.error('Erreur groupe technicien:', err)
    });

    // 5. Statuts Demande Inscription
    this.enumservice.getStatutDemandeInscri().subscribe({
      next: (data) => this.statutDemandeInscriListe = data,
      error: (err) => console.error('Erreur statut demande:', err)
    });

    // 6. Types Alerte
    this.enumservice.getTypeAlerte().subscribe({
      next: (data) => this.typeAlerteListe = data,
      error: (err) => console.error('Erreur type alerte:', err)
    });

    // 7. Statuts Utilisateur
    this.enumservice.getStatutUtilisateur().subscribe({
      next: (data) => this.statutUtilisateurListe = data,
      error: (err) => console.error('Erreur statut utilisateur:', err)
    });
    this.enumservice.getPriorite().subscribe({
      next: (data) => this.prioriteListe = data,
      error: (err) => console.error('Erreur statut priorité:', err)
    });

     this.enumservice.getStatutTicket().subscribe({
      next: (data) => this.StatutTicketListe = data,
      error: (err) => console.error('Erreur statut ticket:', err)
    });

    this.enumservice.getTypeNote().subscribe({
      next: (data) => this.TypeNoteListe = data,
      error: (err) => console.error('Erreur statut TypeNote:', err)
    });
    this.enumservice.getTypeTicket().subscribe({
      next: (data) => this.TypeTicketListe = data,
      error: (err) => console.error('Erreur statut TypeTicket:', err)
    });
  }

}
