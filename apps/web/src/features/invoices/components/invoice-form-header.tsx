'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InvoiceFormHeader({ 
    clientId, setClientId, clients, 
    issueDate, setIssueDate, 
    taxableSupplyDate, setTaxableSupplyDate, 
    dueDate, setDueDate 
}: {
    clientId: string; setClientId: (id: string) => void; clients: any[];
    issueDate: string; setIssueDate: (date: string) => void;
    taxableSupplyDate: string; setTaxableSupplyDate: (date: string) => void;
    dueDate: string; setDueDate: (date: string) => void;
}) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Základní údaje</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Odběratel
                 </label>
                 <select 
                   value={clientId}
                   onChange={e => setClientId(e.target.value)}
                   className={cn(
                       "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                   )}
                 >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <p className="text-xs text-muted-foreground">Pro demo účely jsou klienti natvrdo</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Vystaveno
                    </label>
                    <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        DUZP
                    </label>
                    <Input type="date" value={taxableSupplyDate} onChange={e => setTaxableSupplyDate(e.target.value)} />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Splatnost
                    </label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                 </div>
               </div>
            </CardContent>
        </Card>
    );
}
