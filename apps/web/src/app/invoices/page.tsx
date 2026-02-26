'use client';

import { useOrganization } from '@/components/providers/organization-provider';
import { useInvoices } from '@/features/invoices/hooks/use-invoices';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Loader2 } from 'lucide-react';

export default function InvoicesPage() {
    const { currentOrg } = useOrganization();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || undefined;
    
    const { data: invoices, loading, error } = useInvoices(currentOrg?.id, { type });

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
    if (error) return <div className="p-8 text-center text-destructive">Chyba při načítání: {error.message}</div>;

    if (invoices.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        {type === 'credit_note' ? 'Dobropisy' : 'Faktury'}
                    </h1>
                </div>
                <EmptyState
                    title="Zatím tu je prázdno"
                    description="Vypadá to, že jste zatím nevytvořili žádnou fakturu. Pojďme to napravit!"
                    action={{
                        label: "Vytvořit první fakturu",
                        href: "/invoices/new"
                    }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    {type === 'credit_note' ? 'Dobropisy' : 'Faktury'}
                </h1>
                <Button asChild variant="blue">
                    <Link href="/invoices/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nová faktura
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Číslo</TableHead>
                                    <TableHead>Klient</TableHead>
                                    <TableHead>Vystaveno</TableHead>
                                    <TableHead>Splatnost</TableHead>
                                    <TableHead className="text-right">Částka</TableHead>
                                    <TableHead>Stav</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((inv: any) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                                            <Link href={`/invoices/${inv.id}`}>{inv.number}</Link>
                                        </TableCell>
                                        <TableCell className="font-medium">{inv.client?.name || 'Neznámý klient'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(inv.issueDate).toLocaleDateString('cs-CZ')}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(inv.dueDate).toLocaleDateString('cs-CZ')}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {Number(inv.totalAmount).toLocaleString('cs-CZ', { style: 'currency', currency: inv.currency || 'CZK' })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                inv.status === 'PAID' ? 'success' :
                                                inv.status === 'OVERDUE' ? 'destructive' :
                                                inv.status === 'DRAFT' ? 'secondary' : 'default'
                                            }>
                                                {inv.status === 'PAID' ? 'Zaplaceno' :
                                                 inv.status === 'OVERDUE' ? 'Po splatnosti' :
                                                 inv.status === 'DRAFT' ? 'Návrh' : inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/invoices/${inv.id}`}>Detail</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
