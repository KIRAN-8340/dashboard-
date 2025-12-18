
import { SupplyChainData, SupplierData } from './types';

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const PRODUCTS = ['Electronics', 'Textiles', 'Pharmaceuticals', 'Automotive Parts', 'Food & Beverage'];
export const SUPPLIERS = ['Reliance Logistics', 'Tata Supply Chain', 'Adani Ports', 'Mahindra Logistics', 'Blue Dart'];
export const DESTINATIONS = ['Mumbai Hub', 'Delhi Logistics Park', 'Bangalore Tech Port', 'Chennai Wharf', 'Hyderabad Zone', 'Pune Industrial Estate', 'Kolkata Gateway', 'Ahmedabad Hub'];

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
  
  // Generating more data points to account for the larger number of states
  for (let i = 0; i < 500; i++) {
    const timestamp = new Date(now.getTime() - (i * 12 * 60 * 60 * 1000)).toISOString(); // Data every 12 hours
    const state = STATES[Math.floor(Math.random() * STATES.length)];
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
      state,
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
