
import React, { useState } from 'react';
import Papa from 'papaparse';
import { SupplyChainData, SupplierData } from '../types';

interface DataPipelineProps {
  onDataReady: (logs: SupplyChainData[], suppliers: SupplierData[]) => void;
}

const DataPipeline: React.FC<DataPipelineProps> = ({ onDataReady }) => {
  const [logFile, setLogFile] = useState<File | null>(null);
  const [supplierFile, setSupplierFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processData = async () => {
    if (!logFile) return;
    setIsProcessing(true);

    // Parse Log File
    const parseLogs = () => new Promise<SupplyChainData[]>((resolve) => {
      Papa.parse(logFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped: SupplyChainData[] = (results.data as any[]).map((row, idx) => ({
            id: row.id || `csv-${idx}-${Date.now()}`,
            timestamp: row.timestamp || new Date().toISOString(),
            state: row.state || row.region || 'Maharashtra',
            product: row.product || 'General Goods',
            supplier: row.supplier || 'Standard Vendor',
            inventoryLevel: Number(row.inventoryLevel) || 0,
            plannedInventory: Number(row.plannedInventory) || 100,
            leadTime: Number(row.leadTime) || 5,
            plannedLeadTime: Number(row.plannedLeadTime) || 5,
            cost: Number(row.cost) || 0,
            demand: Number(row.demand) || 0,
            deliveryDate: row.deliveryDate || new Date().toISOString(),
            destination: row.destination || 'Main Hub'
          }));
          resolve(mapped);
        }
      });
    });

    // Parse Supplier File (if present)
    const parseSuppliers = () => new Promise<SupplierData[]>((resolve) => {
      if (!supplierFile) {
        resolve([]);
        return;
      }
      Papa.parse(supplierFile, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const mapped: SupplierData[] = (results.data as any[]).map(row => ({
            name: row.name || 'Unknown',
            rating: Number(row.rating) || 0,
            reliability: Number(row.reliability) || 0,
            baseLeadTime: Number(row.baseLeadTime) || 0,
            contactEmail: row.contactEmail || '',
            contractStatus: (row.contractStatus as any) || 'Active'
          }));
          resolve(mapped);
        }
      });
    });

    const [logs, suppliers] = await Promise.all([parseLogs(), parseSuppliers()]);
    
    // Artificial delay for UX
    setTimeout(() => {
      onDataReady(logs, suppliers);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen pipeline-gradient flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Data Import</h2>
          <p className="text-slate-500 mt-2 font-medium">Upload your logistics and supplier records</p>
        </div>

        {isProcessing ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-lg font-bold text-slate-900">Processing files...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Log File Area */}
              <div 
                onClick={() => document.getElementById('log-input')?.click()}
                className={`group relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                  logFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input id="log-input" type="file" accept=".csv" onChange={(e) => e.target.files && setLogFile(e.target.files[0])} className="hidden" />
                <div className={`p-4 rounded-2xl ${logFile ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">{logFile ? logFile.name : 'Operations Data'}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Required (.csv)</p>
                </div>
              </div>

              {/* Supplier File Area */}
              <div 
                onClick={() => document.getElementById('supplier-input')?.click()}
                className={`group relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                  supplierFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input id="supplier-input" type="file" accept=".csv" onChange={(e) => e.target.files && setSupplierFile(e.target.files[0])} className="hidden" />
                <div className={`p-4 rounded-2xl ${supplierFile ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900">{supplierFile ? supplierFile.name : 'Supplier Details'}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Optional (.csv)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={!logFile}
                onClick={processData}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  logFile ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                Upload and Process
              </button>
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Logistics Intelligence Platform</p>
      </div>
    </div>
  );
};

export default DataPipeline;
