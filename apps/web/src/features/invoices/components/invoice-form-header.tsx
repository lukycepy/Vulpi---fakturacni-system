'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                 <Label>Odběratel</Label>
                 <Select 
                   value={clientId} 
                   onValueChange={setClientId}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Vyberte klienta" />
                   </SelectTrigger>
                   <SelectContent>
                     {clients.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                            {c.name}
                        </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Vystaveno</Label>
                    <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>DUZP</Label>
                    <Input type="date" value={taxableSupplyDate} onChange={e => setTaxableSupplyDate(e.target.value)} />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <Label>Splatnost</Label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                 </div>
               </div>
            </CardContent>
        </Card>
    );
}
