'use client';

import { InvoiceItem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function InvoiceItemsTable({ items, setItems }: { items: InvoiceItem[], setItems: (items: InvoiceItem[]) => void }) {
    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit: 'ks', unitPrice: 0, vatRate: 21 }]);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            const price = item.quantity * item.unitPrice;
            const vat = price * (item.vatRate / 100);
            return acc + price + vat;
        }, 0);
    };

    return (
        <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Položky faktury</CardTitle>
                <Button onClick={addItem} type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Přidat položku
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="hidden md:flex gap-4 text-sm font-medium text-muted-foreground mb-2 px-1">
                        <div className="flex-1">Popis</div>
                        <div className="w-20">Množství</div>
                        <div className="w-24">Jednotka</div>
                        <div className="w-32">Cena/jedn.</div>
                        <div className="w-24">DPH</div>
                        <div className="w-10"></div>
                    </div>
                    
                    {items.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-muted/50 p-3 md:p-0 rounded md:bg-transparent">
                            <div className="flex-1 w-full space-y-1">
                                <label className="md:hidden text-xs font-medium text-muted-foreground">Popis</label>
                                <Input 
                                    placeholder="Popis položky"
                                    value={item.description}
                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="w-1/2 md:w-20 space-y-1">
                                    <label className="md:hidden text-xs font-medium text-muted-foreground">Množství</label>
                                    <Input 
                                        type="number"
                                        placeholder="Mn."
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div className="w-1/2 md:w-24 space-y-1">
                                    <label className="md:hidden text-xs font-medium text-muted-foreground">Jednotka</label>
                                    <Input 
                                        placeholder="Jedn."
                                        value={item.unit}
                                        onChange={e => updateItem(idx, 'unit', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                 <div className="w-1/2 md:w-32 space-y-1">
                                    <label className="md:hidden text-xs font-medium text-muted-foreground">Cena/j.</label>
                                    <Input 
                                        type="number"
                                        placeholder="Cena/j."
                                        value={item.unitPrice}
                                        onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div className="w-1/2 md:w-24 space-y-1">
                                    <label className="md:hidden text-xs font-medium text-muted-foreground">DPH</label>
                                    <Select 
                                        value={item.vatRate.toString()}
                                        onValueChange={value => updateItem(idx, 'vatRate', Number(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="DPH" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="21">21%</SelectItem>
                                            <SelectItem value="15">15%</SelectItem>
                                            <SelectItem value="12">12%</SelectItem>
                                            <SelectItem value="0">0%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end w-full md:w-auto mt-2 md:mt-0 pt-1">
                                <ConfirmDialog
                                    trigger={
                                        <Button 
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    }
                                    title="Smazat položku?"
                                    description="Opravdu chcete odebrat tuto položku z faktury?"
                                    onConfirm={() => removeItem(idx)}
                                    variant="destructive"
                                    actionLabel="Odebrat"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t">
                         <div className="text-right">
                             <div className="text-sm text-muted-foreground">Celkem s DPH</div>
                             <div className="text-2xl font-bold">
                                 {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(calculateTotal())}
                             </div>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
