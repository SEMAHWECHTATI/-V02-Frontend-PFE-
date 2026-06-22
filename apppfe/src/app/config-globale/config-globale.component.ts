import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService, ConfigurationGlobale } from '../services/configuration.service';

@Component({
  selector: 'app-config-globale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-globale.component.html'
})
export class ConfigGlobaleComponent implements OnInit {
  
  config!: ConfigurationGlobale;
  isLoading = true;

  constructor(private configService: ConfigurationService) {}

  ngOnInit(): void {
    this.chargerConfiguration();
  }

  chargerConfiguration(): void {
    this.configService.getConfig().subscribe({
      next: (data) => {
        this.config = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur de chargement de la config", err);
        this.isLoading = false;
      }
    });
  }

  enregistrerConfig(): void {
    this.isLoading = true;
    this.configService.updateConfig(this.config).subscribe({
      next: (updatedData) => {
        this.config = updatedData;
        this.isLoading = false;
        alert("Configuration mise à jour avec succès !"); // Vous pouvez remplacer par un toast
      },
      error: (err) => {
        console.error("Erreur lors de la sauvegarde", err);
        this.isLoading = false;
      }
    });
  }
}