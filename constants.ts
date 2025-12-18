
import { SupplyChainData, SupplierData } from './types';

export const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Central India'];
export const PRODUCTS = ['Electronics', 'Textiles', 'Pharmaceuticals', 'Automotive Parts', 'Food & Beverage'];
export const SUPPLIERS = ['Reliance Logistics', 'Tata Supply Chain', 'Adani Ports', 'Mahindra Logistics', 'Blue Dart'];
export const DESTINATIONS = ['Mumbai Hub', 'Delhi Logistics Park', 'Bangalore Tech Port', 'Chennai Wharf', 'Hyderabad Zone', 'Pune Industrial Estate'];

export const MOCK_SUPPLIER_METADATA: SupplierData[] = SUPPLIERS.map(name => ({
  name,
  rating: 4 + Math.random(),
  reliability: 85 + Math.random() * 15,
  baseLeadTime: 5 + Math.floor(Math.random() * 5),
  contactEmail: `ops@${name.toLowerCase().replace(' ', '')}.com`,
  contractStatus: 'Active'
}));

const generateMockData = (): SupplyChainData[] => {
  const data: SupplyChainData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 200; i++) {
    const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString();
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    const destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    
    const baseInventory = 500 + Math.sin(i / 10) * 200;
    const inventoryLevel = Math.max(0, baseInventory + (Math.random() - 0.5) * 50);
    const plannedInventory = baseInventory * 1.1;
    const deliveryDate = new Date(new Date(timestamp).getTime() + (3 + Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString();

    data.push({
      id: `sc-${i}`,
      timestamp,
      region,
      product,
      supplier,
      inventoryLevel,
      plannedInventory,
      leadTime: 5 + Math.random() * 10,
      plannedLeadTime: 7,
      cost: (1000 + Math.random() * 500) * 80,
      demand: 50 + Math.random() * 100,
      deliveryDate,
      destination
    });
  }
  return data.reverse();
};

export const MOCK_SUPPLY_CHAIN_DATA = generateMockData();
