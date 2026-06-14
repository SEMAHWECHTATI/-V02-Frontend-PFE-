interface KPIIntervention {
  period: 'day' | 'week' | 'month';
  count: number;
  avgResolutionTime: number;
  closureRate: number;
  slaCompliance: number;
  distribution: {
    byDomain: Record<string, number>;
    byRequester: Record<string, number>;
    byTechnician: Record<string, number>;
  };
}

interface KPIInventory {
  stockRotation: number;
  availabilityRate: number;
  totalAssetValue: number;
  outOfStock: Item[];
  utilizationRate: number;
}

interface KPIPerformance {
  interventionsByTechnician: Record<string, number>;
  topDomains: Array<{domain: string; count: number}>;
  avgCostPerIntervention: number;
  satisfactionScore: number;
}