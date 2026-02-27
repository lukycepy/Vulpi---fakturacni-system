
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Check, X } from "lucide-react";

export function AuditView({ auditItems, setAuditItems, setView, handleSubmitAudit }: {
    auditItems: any[];
    setAuditItems: (items: any[]) => void;
    setView: (view: 'overview' | 'audit') => void;
    handleSubmitAudit: () => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Probíhá inventura</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produkt</TableHead>
                                <TableHead>Očekáváno</TableHead>
                                <TableHead>Skutečnost</TableHead>
                                <TableHead>Rozdíl</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditItems.map((item, idx) => {
                                const diff = item.actualQty - item.expectedQty;
                                return (
                                    <TableRow key={item.productId}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.expectedQty}</TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                value={item.actualQty}
                                                onChange={e => {
                                                    const newItems = [...auditItems];
                                                    newItems[idx].actualQty = Number(e.target.value);
                                                    setAuditItems(newItems);
                                                }}
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell className={`font-bold ${diff < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                            {diff > 0 ? '+' : ''}{diff}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setView('overview')}>
                    <X className="mr-2 h-4 w-4" />
                    Zrušit
                </Button>
                
                <ConfirmDialog
                    trigger={
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                            <Check className="mr-2 h-4 w-4" />
                            Dokončit inventuru
                        </Button>
                    }
                    title="Dokončit inventuru?"
                    description="Tímto potvrdíte zadané stavy a aktualizujete skladové zásoby. Tuto akci nelze vrátit zpět."
                    actionLabel="Dokončit a přepsat stavy"
                    onConfirm={handleSubmitAudit}
                />
            </CardFooter>
        </Card>
    );
}
