import { Component } from '@angular/core';
import { TicketService } from '../services/ticket.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sla-dashboard',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './sla-dashboard.component.html',
  styleUrl: './sla-dashboard.component.css'
})
export class SlaDashboardComponent {


  stats: any = null;
  isLoading: boolean = true;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.chargerStatsSLA();
  }

  chargerStatsSLA() {
    this.isLoading = true;
    this.ticketService.getSlaStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur stats SLA", err);
        this.isLoading = false;
      }
    });
  }

  /**
   * ✅ Méthode utilitaire pour forcer le transtypage dans le template HTML
   * Elle résout définitivement les conflits du pipe keyvalue en mode strict
   */
  asNumber(val: unknown): number {
    return val as number;
  }

}
