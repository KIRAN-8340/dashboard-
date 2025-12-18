
import React from 'react';
import { KPIStats } from '../types';

interface KPICardsProps {
  stats: KPIStats[];
}

const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const diff = stat.actual - stat.planned;
        const isPositive = diff >= 0;
        const percentage = Math.abs((diff / stat.planned) * 100).toFixed(1);
        const isCurrency = stat.unit === 'INR';

        return (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-semibold text-slate-500">{stat.label}</span>
              <div className={`px-2 py-1 rounded text-xs font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {isPositive ? '+' : '-'}{percentage}%
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-900">
                {isCurrency ? '₹' : ''}{stat.actual.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-slate-400">{!isCurrency ? stat.unit : ''}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium border-t border-slate-50 pt-3">
              <span className="text-slate-400">Planned: {isCurrency ? '₹' : ''}{stat.planned.toLocaleString()} {!isCurrency ? stat.unit : ''}</span>
              <div className="flex items-center gap-1">
                {stat.trend === 'up' && (
                  <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/></svg>
                )}
                {stat.trend === 'down' && (
                  <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3.707 8.707l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414z"/></svg>
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{stat.trend.toUpperCase()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
