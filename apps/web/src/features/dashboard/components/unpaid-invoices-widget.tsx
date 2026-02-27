'use client';

import { useOrganization } from '@/components/providers/organization-provider';
import { useInvoices } from '@/features/invoices/hooks/use-invoices';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import Link from 'next/link';

export default function UnpaidInvoicesWidget() {
    const { currentOrg } = useOrganization();
    const { data: invoices, loading } = useInvoices(currentOrg?.id);

    if (loading) return (
        <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Nezaplacené faktury
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    );

    if (!invoices || invoices.length === 0) {
        return (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                     <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Nezaplacené faktury
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <div className="bg-muted p-3 rounded-full mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm">Zatím žádné faktury</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[180px]">
                        Vytvořte svou první fakturu a začněte sledovat platby.
                    </p>
                    <Button size="sm" asChild>
                        <Link href="/invoices/new">Vytvořit fakturu</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const unpaidInvoices = invoices
        .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'DRAFT')
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    return (
        <Card className="h-full border-border/50 shadow-sm flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-500" />
                        Nezaplacené faktury
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-xs">
                        <Link href="/invoices">Zobrazit vše</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {unpaidInvoices.length > 0 ? (
                    <div className="space-y-1">
                        {unpaidInvoices.map((inv: any) => (
                            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 px-2 rounded-md transition-colors">
                                <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                                            {inv.client?.name || 'Neznámý klient'}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex gap-2">
                                        <span className="font-mono">{inv.number}</span>
                                        <span>•</span>
                                        <span className={new Date(inv.dueDate) < new Date() ? "text-red-500 font-medium" : ""}>
                                            {new Date(inv.dueDate).toLocaleDateString('cs-CZ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm">
                                        {Number(inv.totalAmount).toLocaleString('cs-CZ', { style: 'currency', currency: inv.currency || 'CZK' })}
                                    </div>
                                    <Badge variant={inv.status === 'OVERDUE' ? 'destructive' : 'secondary'} className="text-[10px] h-5 px-1.5">
                                        {inv.status === 'OVERDUE' ? 'Po splatnosti' : 'K úhradě'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                        <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-3">
                            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-medium text-sm">Vše zaplaceno!</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                            Všechny vystavené faktury jsou uhrazeny. Skvělá práce.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
