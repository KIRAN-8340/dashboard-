
import React, { useState, useMemo } from 'react';
import { STATES, PRODUCTS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  currentFilters?: { state: string; product: string };
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, currentFilters, onLogout }) => {
  const [stateSearch, setStateSearch] = useState('');

  const filteredStates = useMemo(() => {
    return STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [stateSearch]);

  const mainItems = [
    { id: 'overview', label: 'Dashboard Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'demand', label: 'Stock Trends', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'ledger', label: 'Operations Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 lg:sticky lg:top-0 z-50 w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-800 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-xl">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-black text-white tracking-tight">Dashboard</span>
      </div>

      <nav className="flex-1 p-4 space-y-6 mt-4 pb-12 overflow-y-auto custom-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Main Navigation</p>
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>

        {/* States Navigation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">By State</p>
          </div>
          
          <div className="px-3 mb-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search state..."
                className="w-full bg-slate-800 border-none rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
              />
              <svg className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('All States')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
              currentFilters?.state === 'All States' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Show All States
          </button>
          
          <div className="max-h-[300px] overflow-y-auto space-y-0.5 pr-2 custom-scrollbar">
            {filteredStates.map((state) => (
              <button
                key={state}
                onClick={() => setActiveTab(state)}
                className={`w-full text-left px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all truncate ${
                  currentFilters?.state === state ? 'text-white bg-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={state}
              >
                • {state}
              </button>
            ))}
            {filteredStates.length === 0 && (
              <p className="px-4 py-2 text-[10px] text-slate-600 italic">No states found</p>
            )}
          </div>
        </div>

        {/* Products Navigation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">By Category</p>
          </div>
          <button
            onClick={() => setActiveTab('All Products')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
              currentFilters?.product === 'All Products' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Show All Products
          </button>
          {PRODUCTS.map((product) => (
            <button
              key={product}
              onClick={() => setActiveTab(product)}
              className={`w-full text-left px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                currentFilters?.product === product ? 'text-white bg-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              • {product}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 mt-auto bg-slate-900 border-t border-slate-800 sticky bottom-0 z-10 space-y-4">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout Session
          </button>
        )}

        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-xs font-bold text-slate-300">Live & Synchronized</span>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
