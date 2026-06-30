import { Component, OnInit } from '@angular/core';
import { JournalAudit } from '../Model/Entity'; 
import { AuditService } from '../services/audit.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-auditlogs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auditlogs.component.html',
  styleUrl: './auditlogs.component.css'
})
export class AuditlogsComponent implements OnInit {
  tousLesLogs: JournalAudit[] = [];
  logs: JournalAudit[] = [];
  chargement: boolean = true;
  termeRecherche: string = '';

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.chargerLogs();
  }

  chargerLogs(): void {
    this.chargement = true;
    this.auditService.getLogs().subscribe({
      next: (data: JournalAudit[]) => {
        this.tousLesLogs = data.sort((a, b) => new Date(b.dateAction).getTime() - new Date(a.dateAction).getTime());
        this.filtrerLogs();
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des logs', err);
        this.chargement = false;
      }
    });
  }

  filtrerLogs(): void {
    if (!this.termeRecherche.trim()) {
      this.logs = [...this.tousLesLogs];
      return;
    }

    const term = this.termeRecherche.toLowerCase().trim();

    this.logs = this.tousLesLogs.filter(log => {
      const prenomNom = log.utilisateur ? `${log.utilisateur.prenom} ${log.utilisateur.nom}`.toLowerCase() : 'anonyme inconnu';
      const role = log.utilisateur?.role?.toLowerCase() || 'système';
      const action = log.action?.toLowerCase() || '';
      const module = log.module?.toLowerCase() || '';
      const niveau = log.niveau?.toLowerCase() || '';
      const description = log.description?.toLowerCase() || '';
      const ip = log.adresseIp?.toLowerCase() || '';
      const date = log.dateAction ? new Date(log.dateAction).toLocaleDateString('fr-FR') : '';

      return prenomNom.includes(term) ||
             role.includes(term) ||
             action.includes(term) ||
             module.includes(term) ||
             niveau.includes(term) ||
             description.includes(term) ||
             ip.includes(term) ||
             date.includes(term);
    });
  }

  // 📥 EXPORT EXCEL (Mis à jour avec la nouvelle structure complète)
  exporterEnExcel(): void {
    const donneesFormatees = this.logs.map(log => ({
      'ID': log.id,
      'Date & Heure': log.dateAction ? new Date(log.dateAction).toLocaleString('fr-FR') : '',
      'Module': log.module,
      'Niveau': log.niveau,
      'Action': log.action,
      'Opérateur': log.utilisateur ? `${log.utilisateur.prenom} ${log.utilisateur.nom}` : 'Système / Anonyme',
      'Rôle': log.utilisateur?.role || 'N/A',
      'Description': log.description,
      'Adresse IP': log.adresseIp,
      'Succès': log.succes ? 'Oui' : 'Non'
    }));

    const feuille: XLSX.WorkSheet = XLSX.utils.json_to_sheet(donneesFormatees);
    const classeur: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Logs d\'Audit');
    
    XLSX.writeFile(classeur, `journal_audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // 📥 EXPORT CSV NATIF (Correction syntaxique effectuée ici 🌟)
  exporterEnCSV(): void {
    // Remplacement de en-tetes par enTetes pour supprimer l'erreur de compilation
    const enTetes = ['ID', 'Date & Heure', 'Module', 'Niveau', 'Action', 'Operateur', 'Role', 'Description', 'Adresse IP', 'Succes'];
    
    const lignes = this.logs.map(log => [
      log.id,
      log.dateAction ? new Date(log.dateAction).toLocaleString('fr-FR') : '',
      log.module,
      log.niveau,
      log.action,
      log.utilisateur ? `${log.utilisateur.prenom} ${log.utilisateur.nom}` : 'Systeme / Anonyme',
      log.utilisateur?.role || 'N/A',
      `"${(log.description || '').replace(/"/g, '""')}"`, 
      log.adresseIp,
      log.succes ? 'Oui' : 'Non'
    ]);

    const contenuCsv = [enTetes.join(';'), ...lignes.map(l => l.join(';'))].join('\n');
    
    const blob = new Blob(['\ufeff' + contenuCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `journal_audit_${new Date().toISOString().split('T')[0]}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }

  getBadgeClass(action: string): string {
    switch (action) {
      case 'CONNEXION': return 'bg-success';
      case 'DECONNEXION': return 'bg-secondary';
      case 'ECHEC_CONNEXION': return 'bg-danger';
      case 'BLOCAGE': return 'bg-dark';
      case 'DEBLOCAGE': return 'bg-warning text-dark';
      case 'CHANGEMENT_MDP': case 'RESET_MDP': return 'bg-info text-dark';
      case 'APPROBATION_DEMANDE': return 'bg-primary';
      default: return 'bg-light text-dark';
    }
  }
}