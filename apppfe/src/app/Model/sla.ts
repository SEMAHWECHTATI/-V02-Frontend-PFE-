// Interface représentant l'entité SLA (Calquée sur votre entité Java)
export interface SLA {
  idSLA?: number;             // 👈 Corrigé (idSLA au lieu de id)
  nomSLA: string;             // 👈 Corrigé (nomSLA au lieu de nom)
  delaiPriseEnChargeHeure: number; // 👈 Corrigé (Heure au lieu de minute)
  delaiResolutionHeure: number;    // 👈 Corrigé
  priorite: string;           // 'Haute', 'Moyenne' ou 'Basse'
  categorie?: any;            // Optionnel
}