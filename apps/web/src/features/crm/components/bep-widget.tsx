'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function BepWidget({ bep }: { bep: any }) {
    if (!bep) return null;

    const progress = Math.min(100, (bep.currentRevenue / bep.fixedCosts) * 100);

    return (
        <Card className="mb-8 border-none bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
            <CardContent className="flex flex-col md:flex-row justify-between items-center p-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        Bod Zvratu (Break Even Point)
                    </h2>
                    <p className="text-blue-100 max-w-md">
                        Aby byla firma tento měsíc v zisku, musíte ještě vyfakturovat:
                    </p>
                </div>
                
                <div className="mt-6 md:mt-0 text-right space-y-2">
                    <div className="text-4xl font-bold tracking-tight">
                        {Math.max(0, bep.remainingRevenue).toLocaleString('cs-CZ')} Kč
                    </div>
                    <div className="text-sm text-blue-100">
                        Fixní náklady: {bep.fixedCosts.toLocaleString('cs-CZ')} Kč / měsíc
                    </div>
                    <div className="w-full md:w-64 ml-auto pt-2">
                        <Progress value={progress} className="h-2 bg-blue-400/30" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
