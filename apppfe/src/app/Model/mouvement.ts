export interface Mouvement {
  id?: number;
  type: TypeMouvement;
  quantite: number;
  justification?: string;
  localisationSource?: string;
  localisationDestination?: string;
  dateMouvement?: Date;
  stockId?: number;
  articleId?: number;
  articleDesignation?: string;
  responsableId?: number;
  responsableName?: string;
  referenceTicket?: string;
}

export enum TypeMouvement {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  TRANSFERT = 'TRANSFERT',
  PRET = 'PRET',
  RETOUR = 'RETOUR',
  CONSOMMATION = 'CONSOMMATION',
  AJUSTEMENT = 'AJUSTEMENT'
}

export const TypeMouvementLabels: { [key in TypeMouvement]: string } = {
  [TypeMouvement.ENTREE]: '📥 Entrée',
  [TypeMouvement.SORTIE]: '📤 Sortie',
  [TypeMouvement.TRANSFERT]: '🔄 Transfert',
  [TypeMouvement.PRET]: '📦 Prêt',
  [TypeMouvement.RETOUR]: '↩️ Retour',
  [TypeMouvement.CONSOMMATION]: '🔧 Consommation',
  [TypeMouvement.AJUSTEMENT]: '⚙️ Ajustement'
};