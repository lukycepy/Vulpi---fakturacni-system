'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Calendar, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!stats) return (
      <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
  );

  const daysOfWeek = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Finanční BI</h1>
        <p className="text-muted-foreground">Analýza finančního zdraví a chování klientů</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">LTV (Hodnota klienta)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.ltv.toFixed(0)} CZK</div>
                  <p className="text-xs text-muted-foreground">Průměrný celoživotní přínos</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.churnRate.toFixed(1)} %</div>
                  <p className="text-xs text-muted-foreground">Míra odchodu klientů</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Predikce DPH</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.vatPrediction.toFixed(0)} CZK</div>
                  <p className="text-xs text-muted-foreground">Očekávaná platba DPH</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Měsíční Zisk</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-600">{(stats.avgMonthlyIncome - stats.avgMonthlyExpense).toFixed(0)} CZK</div>
                  <p className="text-xs text-muted-foreground">Průměrný čistý zisk</p>
              </CardContent>
          </Card>
      </div>

      {/* Heatmaps */}
      {heatmap && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Platební morálka (Dny v týdnu)</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex justify-between items-end h-48 gap-2 pt-4">
                          {daysOfWeek.map((day, index) => {
                              const val = heatmap.dayOfWeek[index] || 0;
                              // @ts-ignore
                              const max = Math.max(...Object.values(heatmap.dayOfWeek) as number[], 1);
                              const height = (val / max) * 100;
                              
                              return (
                                  <div key={day} className="flex flex-col items-center flex-1 group relative">
                                      <div 
                                          className="w-full bg-primary/80 rounded-t hover:bg-primary transition-all relative"
                                          style={{ height: `${height}%` }}
                                      >
                                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap">
                                              {val.toFixed(0)} CZK
                                          </div>
                                      </div>
                                      <div className="text-xs mt-2 text-muted-foreground">{day}</div>
                                  </div>
                              );
                          })}
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Platební morálka (Dny v měsíci)</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                              const val = heatmap.dayOfMonth[day] || 0;
                              // @ts-ignore
                              const max = Math.max(...Object.values(heatmap.dayOfMonth) as number[], 1);
                              const intensity = val / max; // 0 to 1
                              
                              return (
                                  <div 
                                      key={day} 
                                      className={cn(
                                          "aspect-square flex items-center justify-center text-xs rounded transition-all hover:scale-110 cursor-default relative group",
                                          intensity > 0.5 ? 'text-primary-foreground' : 'text-foreground'
                                      )}
                                      style={{ 
                                          backgroundColor: `rgba(37, 99, 235, ${Math.max(intensity, 0.1)})`
                                      }}
                                  >
                                      {day}
                                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10 mb-1">
                                          {val.toFixed(0)} CZK
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
}
