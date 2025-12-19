
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
  // Initialize stage from localStorage if available
  const [stage, setStage] = useState<AppStage>(() => {
    const savedStage = localStorage.getItem('sc_app_stage');
    return (savedStage as AppStage) || 'LOGIN';
  });

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

  // Persist stage changes
  useEffect(() => {
    localStorage.setItem('sc_app_stage', stage);
  }, [stage]);

  // Filter Logic
  const filteredData = useMemo(() => {
    let data = supplyData.length > 0 ? supplyData : MOCK_SUPPLY_CHAIN_DATA;
    if (filters.state !== 'All States') data = data.filter(d => d.state === filters.state);
    if (filters.product !== 'All Products') data = data.filter(d => d.product === filters.product);
    
    const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
    return data.slice(-days);
  }, [filters, supplyData]);

  // KPI Calculations
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

  const rawRegressionPoints = useMemo(() => {
    let dataForRegression = supplyData.length > 0 ? supplyData : MOCK_SUPPLY_CHAIN_DATA;
    if (filters.state !== 'All States') dataForRegression = dataForRegression.filter(d => d.state === filters.state);
    
    const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
    return dataForRegression.slice(-days * PRODUCTS.length);
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
    localStorage.removeItem('sc_app_stage');
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

  // Render the Operation History Table
  const renderHistoryTable = (fullWidth = false) => (
    <div className={`bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden ${fullWidth ? 'w-full' : ''}`}>
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
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-white text-slate-400 font-black uppercase text-[10px] tracking-[0.15em]">
            <tr>
              <th className="px-8 py-5 border-b border-slate-100">ETA Date</th>
              <th className="px-8 py-5 border-b border-slate-100">Product</th>
              <th className="px-8 py-5 border-b border-slate-100">Destination</th>
              <th className="px-8 py-5 border-b border-slate-100">Supplier</th>
              <th className="px-8 py-5 border-b border-slate-100 text-right">Units Sent</th>
              <th className="px-8 py-5 border-b border-slate-100 text-right">Reliability</th>
              <th className="px-8 py-5 border-b border-slate-100 text-center">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.slice(-20).reverse().map((d) => {
              const sMeta = supplierData.find(s => s.name === d.supplier);
              const isDelivered = new Date(d.deliveryDate).getTime() <= Date.now();
              
              return (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5 text-slate-900 font-bold">{new Date(d.deliveryDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-700">{d.product}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-700">{d.destination}</span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">{d.supplier}</td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-slate-900">{Math.round(d.demand)}</td>
                  <td className="px-8 py-5 text-right font-mono text-indigo-600 font-black">
                    {sMeta ? `${Math.round(sMeta.reliability)}%` : 'N/A'}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isDelivered ? 'Delivered' : 'In Transit'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

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
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <KPICards stats={stats} />

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-12">
                  <MainCharts 
                    timeSeriesData={filteredData} 
                    rawRegressionData={rawRegressionPoints}
                    selectedGlobalProduct={filters.product}
                  />
                  {renderHistoryTable()}
                </div>
                <div className="xl:col-span-1 space-y-8">
                  <div className={`p-6 rounded-3xl ${isAiLoading ? 'bg-slate-50 animate-pulse' : 'bg-blue-50/40 border border-blue-100/50 shadow-sm'}`}>
                    <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">AI Summary</h4>
                    <p className="text-slate-600 text-sm font-medium italic">
                      {isAiLoading ? "Gathering insights..." : aiSummary}
                    </p>
                  </div>
                  <AlertsPanel alerts={alerts} isLoading={isAiLoading} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demand' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Detailed Stock Trends</h2>
                <p className="text-slate-500 font-medium">Predictive analysis and inventory flow tracking across the logistics network.</p>
              </div>
              <MainCharts 
                timeSeriesData={filteredData} 
                rawRegressionData={rawRegressionPoints}
                selectedGlobalProduct={filters.product}
              />
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Comprehensive Operations Log</h2>
                <p className="text-slate-500 font-medium">Full transaction history and delivery status ledger for all active nodes.</p>
              </div>
              {renderHistoryTable(true)}
            </div>
          )}

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
