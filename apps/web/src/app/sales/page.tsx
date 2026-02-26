'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Obchod</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/sales/quotes" className="group">
          <Card className="h-full hover:shadow-md transition-all border-l-4 border-l-yellow-500 hover:border-l-yellow-600">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Nabídky
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>Vytvářejte cenové nabídky pro klienty</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/sales/orders" className="group">
          <Card className="h-full hover:shadow-md transition-all border-l-4 border-l-blue-500 hover:border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Objednávky
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>Evidence přijatých objednávek</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/invoices?type=credit_note" className="group">
          <Card className="h-full hover:shadow-md transition-all border-l-4 border-l-red-500 hover:border-l-red-600">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Dobropisy
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>Opravné daňové doklady a storna</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card className="mt-8 border-dashed bg-muted/30">
          <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Kurzovní lístek (CNB)</CardTitle>
              <CardDescription>Automaticky stahujeme kurzy každý den ve 14:35.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-12 py-6">
              <div className="text-center space-y-1">
                  <div className="text-3xl font-mono font-bold tracking-tighter">25.12 CZK</div>
                  <Badge variant="outline" className="uppercase text-[10px]">1 EUR</Badge>
              </div>
              <div className="text-center space-y-1">
                  <div className="text-3xl font-mono font-bold tracking-tighter">23.45 CZK</div>
                  <Badge variant="outline" className="uppercase text-[10px]">1 USD</Badge>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
