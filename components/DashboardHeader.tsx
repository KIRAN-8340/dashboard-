
import React from 'react';
import { STATES, PRODUCTS } from '../constants';
import { FilterState } from '../types';

interface HeaderProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onRefresh: () => void;
  onMenuToggle: () => void;
}

const DashboardHeader: React.FC<HeaderProps> = ({ filters, setFilters, onRefresh, onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel px-4 md:px-6 py-4 shadow-sm border-b border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <svg className="w-5 md:w-6 h-5 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Logistics Dashboard</h1>
          </div>
          
          <button 
            onClick={onRefresh}
            className="md:hidden p-2 bg-blue-600 text-white rounded-lg shadow-lg"
            title="Reload Data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">State</span>
            <select 
              className="min-w-[140px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            >
              <option value="All States">🌍 All States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Product</span>
            <select 
              className="min-w-[140px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            >
              <option value="All Products">📦 All Products</option>
              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <select 
            className="flex-1 min-w-[120px] px-3 py-2 bg-slate-900 text-white border-none rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button 
            onClick={onRefresh}
            className="hidden md:flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reload
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
