
import React from 'react';
import { PredictiveAlert } from '../types';

interface AlertsPanelProps {
  alerts: PredictiveAlert[];
  isLoading: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, isLoading }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Predictive Alerts
        </h3>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Live AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm">Gemini analyzing...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
            <p className="text-sm">No critical risks detected</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
              alert.severity === 'high' ? 'bg-rose-50 border-rose-500' : 
              alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-bold ${
                  alert.severity === 'high' ? 'text-rose-900' : 
                  alert.severity === 'medium' ? 'text-amber-900' : 'text-blue-900'
                }`}>{alert.title}</h4>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
        <button className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
          View All Logistics Issues
        </button>
      </div>
    </div>
  );
};

export default AlertsPanel;
