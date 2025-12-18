
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, ReferenceDot
} from 'recharts';
import { SupplyChainData, RegressionPoint } from '../types';
import { PRODUCTS } from '../constants';
import { calculateLinearRegression } from '../utils/analytics';

interface MainChartsProps {
  timeSeriesData: SupplyChainData[];
  rawRegressionData: SupplyChainData[]; // Pass the supply chain records to calculate regression per product
  selectedGlobalProduct: string;
}

const COLORS = {
  primary: '#6366f1',    // Indigo (Forecast)
  success: '#10b981',    // Emerald (Present)
  history: '#94a3b8',    // Slate (Past)
  accent1: '#3b82f6',    // Blue
  accent2: '#8b5cf6',    // Violet
  background: '#f8fafc'
};

const MainCharts: React.FC<MainChartsProps> = ({ timeSeriesData, rawRegressionData, selectedGlobalProduct }) => {
  // Local state for picking a specific product forecast if Global is "All Products"
  const [forecastProduct, setForecastProduct] = useState(PRODUCTS[0]);

  // Sync forecast product with global selection if global is specific
  useEffect(() => {
    if (selectedGlobalProduct !== 'All Products') {
      setForecastProduct(selectedGlobalProduct);
    }
  }, [selectedGlobalProduct]);

  // Stock breakdown per product (existing)
  const productStockData = useMemo(() => {
    return PRODUCTS.map(product => {
      const productItems = timeSeriesData.filter(d => d.product === product);
      const available = Math.round(productItems.reduce((sum, d) => sum + d.inventoryLevel, 0));
      const delivering = Math.round(productItems.reduce((sum, d) => sum + (d.plannedInventory * 0.4), 0));
      const planned = productItems.reduce((sum, d) => sum + d.plannedInventory, 0);
      const capacity = planned * 1.5;
      const remaining = Math.max(0, Math.round(capacity - (available + delivering)));

      return {
        name: product,
        Available: available,
        Delivering: delivering,
        Remaining: remaining
      };
    });
  }, [timeSeriesData]);

  // Calculate regression for the specific forecast product
  const enrichedForecastData = useMemo(() => {
    const productSpecificData = rawRegressionData.filter(d => d.product === forecastProduct);
    if (productSpecificData.length === 0) return [];

    const points = productSpecificData.map((d, i) => ({ 
      x: i, 
      y: d.demand,
      date: d.timestamp 
    }));
    
    const regressionResults = calculateLinearRegression(points as any);

    return regressionResults.map((point, idx) => {
      const isLastActual = idx === regressionResults.length - 1;
      return {
        ...point,
        pastSales: isLastActual ? null : point.y,
        presentSales: isLastActual ? point.y : null,
        forecast: point.predictedY
      };
    });
  }, [rawRegressionData, forecastProduct]);

  const latestPoint = enrichedForecastData[enrichedForecastData.length - 1];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  const formatFullDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Category Breakdown */}
      <section id="product-stocks" className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Category Breakdown</h3>
            <p className="text-sm text-slate-500 mt-1">Current stock levels vs warehouse capacity.</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productStockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Bar dataKey="Available" stackId="a" fill={COLORS.primary} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Delivering" stackId="a" fill={COLORS.accent2} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Remaining" stackId="a" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Demand Forecast Section */}
      <section id="demand" className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Demand Forecast</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forecasting for</span>
              <select 
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 focus:outline-none"
                value={forecastProduct}
                onChange={(e) => setForecastProduct(e.target.value)}
                disabled={selectedGlobalProduct !== 'All Products'}
              >
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality</span>
              <span className="text-lg font-bold text-emerald-600">High</span>
            </div>
            <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</span>
              <span className="text-lg font-bold text-indigo-600">Stable</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrichedForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.history} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={COLORS.history} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={formatDate}
                    minTickGap={30}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    labelFormatter={formatFullDate}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: any, name: string) => [
                      Math.round(value), 
                      name === 'pastSales' ? 'Past Sales' : name === 'presentSales' ? 'Present Sales' : 'Forecast'
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="pastSales" 
                    name="Past Sales"
                    stroke={COLORS.history} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPast)" 
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    name="Forecast"
                    stroke={COLORS.primary} 
                    strokeWidth={4}
                    strokeDasharray="8 4"
                    fillOpacity={1} 
                    fill="url(#colorForecast)" 
                  />

                  <ReferenceDot 
                    x={latestPoint?.date} 
                    y={latestPoint?.y} 
                    r={6} 
                    fill={COLORS.success} 
                    stroke="white" 
                    strokeWidth={3} 
                    isFront={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">Present Status</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-900">{latestPoint ? Math.round(latestPoint.y) : 0}</span>
                <span className="text-xs font-bold text-emerald-600">Units Today</span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-2 font-medium">
                Showing current demand for <span className="font-black">{forecastProduct}</span>.
              </p>
            </div>
            
            <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Forecast Insight</p>
              <p className="text-xs font-bold leading-relaxed">
                Projected demand shows seasonal alignment. Inventory buffers recommended.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainCharts;
