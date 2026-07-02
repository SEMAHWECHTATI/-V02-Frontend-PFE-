import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilisateurService } from '../services/utilisateur.service';
import { DemandeActionService } from '../services/demande-action.service';
import { GroupeService } from '../services/groupe.service';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-demande-action',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './demande-action.component.html'
})
export class DemandeActionComponent implements OnInit, OnChanges {
  
  techniciensFiltres: any[] = [];
  listeActions: any[] = [];
  groupesDisponibles: any[] = [];
  ticketsDisponibles: any[] = []; 
  done: any = null;

  @Input() selectedTicket: any;

  // ✅ CORRIGÉ : Valeurs d'initialisation sous forme de chaînes strictes conformes au Backend
  form = this.fb.group({
    ticketId: [null, Validators.required],
    ticketReference: [{ value: '', disabled: true }, Validators.required], 
    assignedGroupeId: [null, Validators.required],     
    assignedTechnicienId: [null, Validators.required], 
    typeDemande: ['INTERVENTION_RESEAUX', Validators.required], // 👈 Bien orthographié avec le "X"
    criticite: ['HIGH', Validators.required],                   // 👈 Utilisation de HIGH au lieu de HAUTE
    objet: ['', Validators.required],
    justification: ['']
  });

  constructor(
    private fb: FormBuilder, 
    private actionService: DemandeActionService,
    private utilisateurService: UtilisateurService,
    private grouptechn: GroupeService,
    private ticketService: TicketService 
  ) {}

  ngOnInit() {
    this.loadActions();
    this.loadGroupes();

    this.form.get('assignedGroupeId')?.valueChanges.subscribe(idGroupe => {
      if (idGroupe) {
        const groupeObj = this.groupesDisponibles.find(g => g.id === Number(idGroupe));
        if (groupeObj) {
          this.chargerTechniciensDuGroupe(groupeObj.nomGroupes);
          this.chargerTicketsDuGroupe(groupeObj.nomGroupes);
        }
      } else {
        this.viderChampsCascades();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedTicket'] && this.selectedTicket) {
      this.selectionnerTicket(this.selectedTicket);
    }
  }

  loadGroupes() {
    this.grouptechn.getGroupes().subscribe({
      next: (data) => this.groupesDisponibles = data,
      error: (err) => console.error("⚠️ Impossible de charger les groupes", err)
    });
  }

  chargerTicketsDuGroupe(nomGroupe: string) {
    this.ticketService.getTicketsParNomGroupe(nomGroupe).subscribe({
      next: (tickets) => this.ticketsDisponibles = tickets,
      error: (err) => console.error("⚠️ Erreur lors du chargement des tickets du groupe", err)
    });
  }

  chargerTechniciensDuGroupe(nomGroupe: string) {
    this.utilisateurService.getUtilisateursParGroupe(nomGroupe).subscribe({
      next: (data) => {
        this.techniciensFiltres = data;
        if (data.length > 0) {
          this.form.patchValue({ assignedTechnicienId: data[0].id as any });
        } else {
          this.form.get('assignedTechnicienId')?.reset();
        }
      },
      error: (err) => console.error("⚠️ Impossible de charger les techniciens", err)
    });
  }

  onTicketChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const ticketId = Number(selectElement.value);
    
    const ticket = this.ticketsDisponibles.find(t => t.idTicket === ticketId);
    if (ticket) {
      this.selectionnerTicket(ticket);
    }
  }

  selectionnerTicket(ticket: any) {
    this.form.patchValue({
      ticketId: ticket.idTicket,
      ticketReference: ticket.reference
    });
    
    if (ticket.groupeAssigne && this.form.get('assignedGroupeId')?.value !== ticket.groupeAssigne.id) {
      this.form.patchValue({ assignedGroupeId: ticket.groupeAssigne.id });
    }
  }

  viderChampsCascades() {
    this.techniciensFiltres = [];
    this.ticketsDisponibles = [];
    this.form.get('assignedTechnicienId')?.reset();
    this.form.get('ticketId')?.reset();
    this.form.get('ticketReference')?.reset();
  }

  loadActions() {
    this.actionService.getActions().subscribe(data => this.listeActions = data);
  }

  submit() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue(); 
    
    const payload = {
      ...raw,
      ticketId: Number(raw.ticketId),
      assignedTechnicienId: Number(raw.assignedTechnicienId),
      assignedGroupeId: Number(raw.assignedGroupeId),
      createdById: 1,
      dateBesoin: new Date().toISOString().split('T')[0] 
    };

    this.actionService.createAction(payload).subscribe({
      next: (res) => {
        this.done = res;
        this.loadActions();
        // ✅ On réinitialise l'objet et la justification tout en gardant intacts les autres paramètres par défaut
        this.form.patchValue({ objet: '', justification: '' });
      },
      error: (err) => console.error("⚠️ Échec d'envoi", err)
    });
  }
}