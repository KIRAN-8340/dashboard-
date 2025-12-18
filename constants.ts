
import { SupplyChainData, SupplierData } from './types';

export const STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const PRODUCTS = ['Electronics', 'Textiles', 'Pharmaceuticals', 'Automotive Parts', 'Food & Beverage'];
export const SUPPLIERS = ['Reliance Logistics', 'Tata Supply Chain', 'Adani Ports', 'Mahindra Logistics', 'Blue Dart'];
export const DESTINATIONS = ['Mumbai Hub', 'Delhi Logistics Park', 'Bangalore Tech Port', 'Chennai Wharf', 'Hyderabad Zone', 'Pune Industrial Estate', 'Kolkata Gateway', 'Ahmedabad Hub', 'Lucknow Terminal', 'Guwahati Port'];

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
  
  // Generating 2000 points to ensure dense coverage across all 36 states/UTs
  for (let i = 0; i < 2000; i++) {
    // Spread data over the last 120 days
    const timestamp = new Date(now.getTime() - (i * 1.5 * 60 * 60 * 1000)).toISOString(); 
    const state = STATES[Math.floor(Math.random() * STATES.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
    const destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    
    // Inventory cycles with some noise and seasonal variance
    const baseInventory = 600 + Math.sin(i / 50) * 300;
    const inventoryLevel = Math.max(50, baseInventory + (Math.random() - 0.5) * 100);
    const plannedInventory = baseInventory * 1.15;
    const deliveryDate = new Date(new Date(timestamp).getTime() + (2 + Math.random() * 8) * 24 * 60 * 60 * 1000).toISOString();

    data.push({
      id: `sc-${i}`,
      timestamp,
      state,
      product,
      supplier,
      inventoryLevel,
      plannedInventory,
      leadTime: 4 + Math.random() * 12,
      plannedLeadTime: 6,
      cost: (800 + Math.random() * 600) * 80,
      demand: 40 + Math.random() * 150,
      deliveryDate,
      destination
    });
  }
  // Sort chronologically for charts
  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const MOCK_SUPPLY_CHAIN_DATA = generateMockData();
