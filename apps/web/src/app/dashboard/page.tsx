'use client';

import Link from 'next/link';
import CashflowWidget from '@/features/dashboard/components/cashflow-widget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, FileText, ShoppingCart, Receipt, BarChart3, Package, Settings, Code2, ShieldCheck, Clock, Plug, Activity, Users, Wallet } from "lucide-react";

const dashboardItems = [
  { href: "/organizations/new", title: "Organizace", desc: "Správa vašich firem a nastavení", icon: Building2, color: "text-gray-600 dark:text-gray-400" },
  { href: "/invoices/new", title: "Nová faktura", desc: "Vytvořit novou fakturu", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
  { href: "/sales", title: "Obchod", desc: "Nabídky, Objednávky, Dobropisy", icon: ShoppingCart, color: "text-yellow-600 dark:text-yellow-400" },
  { href: "/expenses/new", title: "Nový výdaj", desc: "Zaevidovat přijatou fakturu", icon: Receipt, color: "text-rose-600 dark:text-rose-400" },
  { href: "/reports", title: "Reporty a Exporty", desc: "Daňové podklady, CSV, Pohoda", icon: BarChart3, color: "text-indigo-600 dark:text-indigo-400" },
  { href: "/inventory", title: "Sklad a Produkty", desc: "Evidence skladu, čárové kódy", icon: Package, color: "text-green-600 dark:text-green-400" },
  { href: "/settings", title: "Nastavení", desc: "Upomínky a pravidelné faktury", icon: Settings, color: "text-slate-600 dark:text-slate-400" },
  { href: "/settings/developer", title: "Pro vývojáře", desc: "API klíče, Webhooky", icon: Code2, color: "text-purple-600 dark:text-purple-400" },
  { href: "/settings/audit", title: "Audit a Bezpečnost", desc: "Historie akcí, GDPR nástroje", icon: ShieldCheck, color: "text-gray-600 dark:text-gray-400" },
  { href: "/time-tracking", title: "Měření času", desc: "Stopky a výkazy práce", icon: Clock, color: "text-orange-600 dark:text-orange-400" },
  { href: "/settings/integrations", title: "Integrace", desc: "Slack, E-shopy, Webhooky", icon: Plug, color: "text-cyan-600 dark:text-cyan-400" },
  { href: "/admin/system-health", title: "System Health", desc: "Monitoring cronů a stavu systému", icon: Activity, color: "text-red-600 dark:text-red-400" },
  { href: "/hr", title: "HR & Mzdy", desc: "Zaměstnanci, Odměny, Náhrady", icon: Users, color: "text-pink-600 dark:text-pink-400" },
  { href: "/finance/cash", title: "Pokladna", desc: "Hotovostní deník, příjmy a výdaje", icon: Wallet, color: "text-emerald-600 dark:text-emerald-400" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* AI Cashflow Widget */}
      <CashflowWidget />
      
      {/* Financial Overview Widget */}
      <Card className="mb-8 border-none bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <CardHeader>
             <CardTitle className="text-lg font-medium opacity-90">Finanční přehled (Tento rok)</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <div className="text-sm opacity-75">Příjmy</div>
                 <div className="text-3xl font-bold tracking-tight">+ 1 250 000 Kč</div>
               </div>
               <div>
                 <div className="text-sm opacity-75">Výdaje</div>
                 <div className="text-3xl font-bold tracking-tight">- 450 000 Kč</div>
               </div>
               <div>
                 <div className="text-sm opacity-75">Odhad daně (19%)</div>
                 <div className="text-3xl font-bold tracking-tight">152 000 Kč</div>
               </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {dashboardItems.map((item) => (
            <Link key={item.href} href={item.href} className="group">
                <Card className="h-full hover:shadow-md transition-all hover:border-primary/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            {item.title}
                        </CardTitle>
                        <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
