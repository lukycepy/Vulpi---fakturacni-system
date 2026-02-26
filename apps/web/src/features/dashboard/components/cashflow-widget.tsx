'use client';

import { useOrganization } from '@/components/providers/organization-provider';
import { useCashflow } from '../hooks/use-cashflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

export default function CashflowWidget() {
  const { currentOrg } = useOrganization();
  const { data, loading } = useCashflow(currentOrg?.id);

  if (loading) return (
      <Card className="mb-8 border-none bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Načítání predikce...
          </CardContent>
      </Card>
  );
  if (!data) return null;

  return (
    <Card className="mb-8 border-none bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg">
        <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                AI Cashflow Predikce
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <div className="text-sm text-emerald-100">Dnešní stav</div>
                 <div className="text-3xl font-bold tracking-tight">{data.currentBalance.toLocaleString('cs-CZ')} Kč</div>
               </div>
               <div>
                 <div className="text-sm text-emerald-100">Predikce +30 dní</div>
                 <div className={`text-3xl font-bold tracking-tight ${data.prediction30 < 0 ? 'text-red-200' : ''}`}>
                     {data.prediction30.toLocaleString('cs-CZ')} Kč
                 </div>
               </div>
               <div>
                 <div className="text-sm text-emerald-100">Predikce +60 dní</div>
                 <div className={`text-3xl font-bold tracking-tight ${data.prediction60 < 0 ? 'text-red-200' : ''}`}>
                     {data.prediction60.toLocaleString('cs-CZ')} Kč
                 </div>
               </div>
            </div>

            {data.warnings && data.warnings.length > 0 && (
                <div className="mt-6 bg-red-950/30 p-4 rounded-lg text-sm border border-red-500/30 flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-red-200 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        {data.warnings.map((w: string, i: number) => (
                            <div key={i} className="text-red-100">{w}</div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
