'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function BiDashboard() {
  const { currentOrg } = useOrganization();
  const [stats, setStats] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/analytics/bi-stats?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setStats);

        fetch(`/api/analytics/heatmap?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setHeatmap);
    }
  }, [currentOrg]);

  if (!stats) return <div>Načítání BI...</div>;

  const daysOfWeek = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Finanční BI (Business Intelligence)</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="text-gray-500 text-sm">LTV (Hodnota klienta)</div>
              <div className="text-2xl font-bold text-blue-600">
                  {stats.ltv.toFixed(0)} CZK
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="text-gray-500 text-sm">Churn Rate (Odchod)</div>
              <div className="text-2xl font-bold text-red-600">
                  {stats.churnRate.toFixed(1)} %
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="text-gray-500 text-sm">Predikce DPH (Kvartál)</div>
              <div className="text-2xl font-bold text-purple-600">
                  {stats.vatPrediction.toFixed(0)} CZK
              </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="text-gray-500 text-sm">Průměrný Měsíční Zisk</div>
              <div className="text-2xl font-bold text-green-600">
                  {(stats.avgMonthlyIncome - stats.avgMonthlyExpense).toFixed(0)} CZK
              </div>
          </div>
      </div>

      {/* Heatmaps */}
      {heatmap && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                  <h3 className="text-lg font-bold mb-4">Platební morálka (Dny v týdnu)</h3>
                  <div className="flex justify-between items-end h-48 gap-2">
                      {daysOfWeek.map((day, index) => {
                          const val = heatmap.dayOfWeek[index] || 0;
                          const max = Math.max(...Object.values(heatmap.dayOfWeek) as number[], 1);
                          const height = (val / max) * 100;
                          
                          return (
                              <div key={day} className="flex flex-col items-center flex-1">
                                  <div 
                                      className="w-full bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-all"
                                      style={{ height: `${height}%` }}
                                      title={`${val.toFixed(0)} CZK`}
                                  ></div>
                                  <div className="text-xs mt-2 text-gray-500">{day}</div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                  <h3 className="text-lg font-bold mb-4">Platební morálka (Dny v měsíci)</h3>
                  <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                          const val = heatmap.dayOfMonth[day] || 0;
                          const max = Math.max(...Object.values(heatmap.dayOfMonth) as number[], 1);
                          const intensity = val / max; // 0 to 1
                          
                          return (
                              <div 
                                  key={day} 
                                  className="aspect-square flex items-center justify-center text-xs rounded"
                                  style={{ 
                                      backgroundColor: `rgba(37, 99, 235, ${Math.max(intensity, 0.1)})`,
                                      color: intensity > 0.5 ? 'white' : 'black'
                                  }}
                                  title={`Den ${day}: ${val.toFixed(0)} CZK`}
                              >
                                  {day}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
