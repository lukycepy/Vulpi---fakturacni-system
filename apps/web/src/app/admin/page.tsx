'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity, Users, Building2, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="container max-w-6xl mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SuperAdmin Dashboard</h1>
        <p className="text-muted-foreground">
          Vítejte v administrátorské zóně. Zde můžete spravovat systémové nastavení a monitorovat stav aplikace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/system-health" className="block group">
          <Card className="h-full transition-all hover:shadow-md border-l-4 border-l-green-500 hover:border-l-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Monitorování stavu služeb, Cron jobů a systémových metrik.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Přejít na monitoring <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full opacity-60 border-l-4 border-l-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Správa uživatelů
            </CardTitle>
            <CardDescription>
              Přehled všech uživatelů a jejich rolí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Coming Soon</span>
          </CardContent>
        </Card>

        <Card className="h-full opacity-60 border-l-4 border-l-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Správa organizací
            </CardTitle>
            <CardDescription>
              Přehled všech organizací v systému.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <span className="text-xs font-medium bg-muted px-2 py-1 rounded">Coming Soon</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
