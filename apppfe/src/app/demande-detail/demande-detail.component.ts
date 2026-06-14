import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-detail.component.html',
  styleUrl: './demande-detail.component.css'
})
export class DemandeDetailComponent {
@Input() demande: any;
  @Input() visible: boolean = false;
  @Input() roleUtilisateurConecte: string = ''; // Reçoit le rôle du parent

  @Output() closed = new EventEmitter<void>();
  @Output() onValiderGestionnaire = new EventEmitter<any>();
  @Output() onValiderAdmin = new EventEmitter<any>();

  onFermer(): void {
    this.closed.emit();
  }

  declencherValidationGestionnaire(): void {
    this.onValiderGestionnaire.emit(this.demande);
  }

  declencherValidationAdmin(): void {
    this.onValiderAdmin.emit(this.demande);
  }
}
