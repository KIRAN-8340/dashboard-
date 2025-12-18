
export interface SupplyChainData {
  id: string;
  timestamp: string;
  region: string;
  product: string;
  supplier: string;
  inventoryLevel: number;
  plannedInventory: number;
  leadTime: number; // in days
  plannedLeadTime: number;
  cost: number;
  demand: number;
  deliveryDate: string; 
  destination: string; 
}

export interface SupplierData {
  name: string;
  rating: number;
  reliability: number; // 0-100%
  baseLeadTime: number;
  contactEmail: string;
  contractStatus: 'Active' | 'Pending' | 'Expired';
}

export interface KPIStats {
  label: string;
  actual: number;
  planned: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ClusterPoint {
  x: number;
  y: number;
  cluster: number;
  label: string;
}

export interface RegressionPoint {
  x: number;
  y: number;
  predictedY: number;
  date?: string;
}

export interface PredictiveAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timestamp: string;
}

export type FilterState = {
  region: string;
  product: string;
  supplier: string;
  timeRange: '7d' | '30d' | '90d';
};
