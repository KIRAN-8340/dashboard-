
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_SUPPLY_CHAIN_DATA, MOCK_SUPPLIER_METADATA, STATES, PRODUCTS } from './constants';
import { FilterState, KPIStats, PredictiveAlert, SupplyChainData, SupplierData } from './types';
import { calculateLinearRegression } from './utils/analytics';
import { getSupplyChainInsights } from './services/geminiService';
import DashboardHeader from './components/DashboardHeader';
import KPICards from './components/KPICards';
import MainCharts from './components/MainCharts';
import AlertsPanel from './components/AlertsPanel';
import Login from './components/Login';
import DataPipeline from './components/DataPipeline';
import Sidebar from './components/Sidebar';

type AppStage = 'LOGIN' | 'UPLOAD' | 'DASHBOARD';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('LOGIN');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supplyData, setSupplyData] = useState<SupplyChainData[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    state: 'All States',
    product: 'All Products',
    supplier: 'All Suppliers',
    timeRange: '30d'
  });

  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("Initializing system analytics...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filter Logic
  const filteredData = useMemo(() => {
    let data = supplyData.length > 0 ? supplyData : MOCK_SUPPLY_CHAIN_DATA;
    if (filters.state !== 'All States') data = data.filter(d => d.state === filters.state);
    if (filters.product !== 'All Products') data = data.filter(d => d.product === filters.product);
    
    const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
    return data.slice(-days);
  }, [filters, supplyData]);

  // KPI Calculations including Available, Delivering, and Remaining Stock
  const stats: KPIStats[] = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    const totalAvailable = filteredData.reduce((sum, d) => sum + d.inventoryLevel, 0);
    const avgPlannedInv = filteredData.reduce((sum, d) => sum + d.plannedInventory, 0);
    const deliveringStocks = filteredData.reduce((sum, d) => sum + (d.plannedInventory * 0.4), 0);
    const totalCapacity = avgPlannedInv * 1.5;
    const remainingStock = Math.max(0, totalCapacity - (totalAvailable + deliveringStocks));

    const totalCost = filteredData.reduce((sum, d) => sum + d.cost, 0);
    const plannedCost = totalCost * 0.95;

    return [
      { label: 'Stocks Available', actual: Math.round(totalAvailable), planned: Math.round(avgPlannedInv), unit: 'Units', trend: totalAvailable > avgPlannedInv ? 'up' : 'down' },
      { label: 'Delivering Stocks', actual: Math.round(deliveringStocks), planned: Math.round(deliveringStocks * 0.9), unit: 'Units', trend: 'up' },
      { label: 'Remaining Stock', actual: Math.round(remainingStock), planned: Math.round(totalCapacity * 0.2), unit: 'Capacity', trend: 'stable' },
      { label: 'Logistics Cost', actual: Math.round(totalCost), planned: Math.round(plannedCost), unit: 'INR', trend: totalCost > plannedCost ? 'down' : 'up' }
    ];
  }, [filteredData]);

  // Calculate regression data - we pass the raw data so MainCharts can handle per-product toggles
  const rawRegressionPoints = useMemo(() => {
    // We return the unfiltered-by-product data here so MainCharts can filter locally for "each product" view
    let dataForRegression = supplyData.length > 0 ? supplyData : MOCK_SUPPLY_CHAIN_DATA;
    if (filters.state !== 'All States') dataForRegression = dataForRegression.filter(d => d.state === filters.state);
    
    const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
    return dataForRegression.slice(-days * PRODUCTS.length); // Get enough points for all products
  }, [filters.state, filters.timeRange, supplyData]);

  const refreshInsights = useCallback(async () => {
    if (filteredData.length === 0) return;
    setIsAiLoading(true);
    const insights = await getSupplyChainInsights(filteredData);
    setAiSummary(insights.summary);
    setAlerts(insights.alerts);
    setIsAiLoading(false);
  }, [filteredData]);

  useEffect(() => {
    if (stage === 'DASHBOARD') refreshInsights();
  }, [stage, refreshInsights]);

  const handleLogout = () => {
    setStage('LOGIN');
    setSupplyData([]);
    setSupplierData([]);
  };

  if (stage === 'LOGIN') {
    return <Login onLogin={() => setStage('UPLOAD')} />;
  }

  if (stage === 'UPLOAD') {
    return <DataPipeline onDataReady={(logs, suppliers) => {
      setSupplyData(logs);
      setSupplierData(suppliers.length > 0 ? suppliers : MOCK_SUPPLIER_METADATA);
      setStage('DASHBOARD');
    }} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen relative overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (STATES.includes(tab) || tab === 'All States') {
            setFilters(prev => ({ ...prev, state: tab }));
            setActiveTab('overview');
          } else if (PRODUCTS.includes(tab) || tab === 'All Products') {
            setFilters(prev => ({ ...prev, product: tab }));
            setActiveTab('overview');
          } else {
            setActiveTab(tab);
          }
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        currentFilters={filters}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader 
          filters={filters} 
          setFilters={setFilters} 
          onRefresh={refreshInsights} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8 scroll-smooth pb-20">
          
          <div id="overview" className="space-y-6 animate-in fade-in duration-500">
            {/* Simplified Status Overview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">System Status</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Live Monitoring Active</p>
                </div>
              </div>
              
              <div className="flex-1 max-w-xl">
                <div className={`px-4 py-3 rounded-2xl ${isAiLoading ? 'bg-slate-50 animate-pulse' : 'bg-blue-50/40 border border-blue-100/50'}`}>
                  <p className="text-slate-600 text-sm font-medium italic">
                    {isAiLoading ? "Gathering insights..." : aiSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Suppliers</p>
                  <p className="text-xl font-black text-slate-900">{supplierData.length}</p>
                </div>
                <div className="w-px h-8 bg-slate-100 mx-2"></div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Health</p>
                  <p className="text-xl font-black text-emerald-600">Optimal</p>
                </div>
              </div>
            </div>

            <KPICards stats={stats} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-12">
              <MainCharts 
                timeSeriesData={filteredData} 
                rawRegressionData={rawRegressionPoints}
                selectedGlobalProduct={filters.product}
              />
              
              <div id="ledger" className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Operation History</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Detailed transaction and delivery logs.</p>
                  </div>
                  <button 
                      onClick={() => setStage('UPLOAD')}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 uppercase shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                      Update Data
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-white text-slate-400 font-black uppercase text-[10px] tracking-[0.15em]">
                      <tr>
                        <th className="px-8 py-5 border-b border-slate-100">ETA Date</th>
                        <th className="px-8 py-5 border-b border-slate-100">Hub Location</th>
                        <th className="px-8 py-5 border-b border-slate-100">Supplier</th>
                        <th className="px-8 py-5 border-b border-slate-100 text-right">Qty Available</th>
                        <th className="px-8 py-5 border-b border-slate-100 text-right">Reliability</th>
                        <th className="px-8 py-5 border-b border-slate-100 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.slice(-15).reverse().map((d) => {
                        const sMeta = supplierData.find(s => s.name === d.supplier);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-8 py-5 text-slate-900 font-bold">{new Date(d.deliveryDate).toLocaleDateString()}</td>
                            <td className="px-8 py-5">
                              <span className="font-bold text-slate-700">{d.destination}</span>
                            </td>
                            <td className="px-8 py-5 font-bold text-slate-600">{d.supplier}</td>
                            <td className="px-8 py-5 text-right font-mono font-bold text-slate-900">{Math.round(d.inventoryLevel)}</td>
                            <td className="px-8 py-5 text-right font-mono text-indigo-600 font-black">
                              {sMeta ? `${Math.round(sMeta.reliability)}%` : 'N/A'}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${
                                d.inventoryLevel < 400 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {d.inventoryLevel < 400 ? 'LOW STOCK' : 'IN STOCK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="xl:col-span-1 space-y-8">
              <AlertsPanel alerts={alerts} isLoading={isAiLoading} />
              
              <div className="bg-slate-900 p-8 rounded-[3xl] text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Pipeline Summary</h4>
                    <p className="text-xs font-bold leading-relaxed mb-6">
                       Synced {supplierData.length} suppliers across {supplyData.length || 200} nodes.
                    </p>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-full"></div>
                    </div>
                 </div>
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[40px]"></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/80 backdrop-blur-xl text-slate-400 text-[10px] py-4 px-8 flex justify-between items-center border-t border-slate-100 z-40">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold uppercase tracking-widest">Active Link</span>
          </span>
        </div>
        <div className="flex gap-6 font-bold uppercase tracking-widest">
          <span className="text-slate-300">v3.1.0</span>
          <span className="text-slate-400">Enterprise Logistics</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
