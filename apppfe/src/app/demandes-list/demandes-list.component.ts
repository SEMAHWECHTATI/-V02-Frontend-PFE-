import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demandes-list.component.html',
  styleUrl: './demandes-list.component.css'
})
export class DemandesListComponent {

  @Input() demandes: any[] = [];

  @Input() type: 'mesDemandes' | 'enAttente' | 'valideeGestionnaire' = 'mesDemandes' ;
  @Input() titre: string = '';
  @Input() description: string = '';
  @Input() showActions: boolean = false;

  @Output() validerGestionnaire = new EventEmitter<any>();
  @Output() validerAdmin = new EventEmitter<any>();
  @Output() rejeter = new EventEmitter<any>();
  @Output() afficherDetails = new EventEmitter<any>();

  onValiderGestionnaire(demande: any) {
    this.validerGestionnaire.emit(demande);
  }

  onValiderAdmin(demande: any) {
    this.validerAdmin.emit(demande);
  }

  onRejeter(demande: any) {
    this.rejeter.emit(demande);
  }

  onAfficherDetails(demande: any) {
    this.afficherDetails.emit(demande);
  }
  


}