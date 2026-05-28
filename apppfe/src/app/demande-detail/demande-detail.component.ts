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
  @Input() demande: any = null;
  @Input() visible: boolean = false;
  
  @Output() fermer = new EventEmitter<void>();

  onFermer(): void {
    this.fermer.emit();
  }
}
