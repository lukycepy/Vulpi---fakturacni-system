'use client';

import { StockTable } from './stock-table';
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function WarehouseList({ warehouses, createWarehouse, startAudit }: {
    warehouses: any[];
    createWarehouse: () => void;
    startAudit: (warehouseId: string) => void;
}) {
    if (warehouses.length === 0) {
        return (
            <EmptyState 
                title="Žádné sklady"
                description="Zatím nemáte vytvořený žádný sklad. Vytvořte první pro evidenci zásob."
                action={{
                    label: "Vytvořit sklad",
                    onClick: createWarehouse
                }}
                icon={Package}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={createWarehouse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nový sklad
                </Button>
            </div>

            <div className="grid gap-6">
                {warehouses.map(wh => (
                    <Card key={wh.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                {wh.name}
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startAudit(wh.id)}
                                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-800"
                            >
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Zahájit inventuru
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <StockTable stocks={wh.stocks} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
