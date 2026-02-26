
'use client';

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
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-3 font-medium text-muted-foreground">Produkt</th>
                                <th className="p-3 font-medium text-muted-foreground">Očekáváno</th>
                                <th className="p-3 font-medium text-muted-foreground">Skutečnost</th>
                                <th className="p-3 font-medium text-muted-foreground">Rozdíl</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditItems.map((item, idx) => (
                                <tr key={item.productId} className="border-b last:border-0">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-muted-foreground">{item.expectedQty}</td>
                                    <td className="p-3">
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
                                    </td>
                                    <td className={`p-3 font-bold ${item.actualQty - item.expectedQty < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {item.actualQty - item.expectedQty > 0 ? '+' : ''}{item.actualQty - item.expectedQty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
