'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { currentOrg } = useOrganization();
  const [lists, setLists] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/pricing/lists?organizationId=${currentOrg.id}`).then(res => res.json()).then(setLists);
        fetch(`/api/inventory/products?organizationId=${currentOrg.id}`).then(res => res.json()).then(setProducts);
    }
  }, [currentOrg]);

  const createList = async () => {
      if (!newListName) return;
      try {
        await fetch('/api/pricing/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId: currentOrg?.id, name: newListName })
        });
        
        const res = await fetch(`/api/pricing/lists?organizationId=${currentOrg?.id}`);
        setLists(await res.json());
        setIsCreateModalOpen(false);
        setNewListName('');
        toast.success("Ceník vytvořen");
      } catch (e) {
          toast.error("Chyba při vytváření ceníku");
      }
  };

  const updatePrice = async (priceListId: string, productId: string, price: number) => {
      try {
        await fetch(`/api/pricing/lists/${priceListId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, price })
        });
        toast.success("Cena aktualizována");
      } catch (e) {
        toast.error("Chyba při ukládání ceny");
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ceníky (B2B)</h1>
            <p className="text-muted-foreground">Správa cenových hladin pro velkoodběratele</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nový ceník
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Lists */}
          <Card className="md:col-span-1 h-fit">
              <CardHeader>
                  <CardTitle className="text-sm uppercase text-muted-foreground">Vaše ceníky</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                  <ul className="space-y-1">
                      {lists.map(list => (
                          <li 
                              key={list.id} 
                              className={cn(
                                  "p-3 rounded-md cursor-pointer transition-colors text-sm font-medium",
                                  selectedList === list.id 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'hover:bg-muted'
                              )}
                              onClick={() => setSelectedList(list.id)}
                          >
                              {list.name}
                          </li>
                      ))}
                      {lists.length === 0 && (
                          <li className="text-center text-muted-foreground text-sm p-4">Žádné ceníky</li>
                      )}
                  </ul>
              </CardContent>
          </Card>

          {/* Product Grid */}
          <Card className="md:col-span-3 min-h-[500px]">
              <CardContent className="p-6">
                  {!selectedList ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                          <DollarSign className="w-12 h-12 mb-4 opacity-20" />
                          <p>Vyberte ceník pro editaci cen.</p>
                      </div>
                  ) : (
                      <div>
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {lists.find(l => l.id === selectedList)?.name}
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {products.length} produktů
                            </span>
                          </div>
                          
                          <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produkt</TableHead>
                                        <TableHead>Základní cena</TableHead>
                                        <TableHead>Cena v ceníku</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Package className="w-4 h-4 text-muted-foreground" />
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono">
                                                {Number(p.unitPrice).toFixed(2)} Kč
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        placeholder="Zadejte cenu"
                                                        className="w-32 h-9 font-mono text-right"
                                                        defaultValue={p.priceInList || ''} // Assuming backend returns this if joined, but currently simple update
                                                        onBlur={(e) => {
                                                            const val = e.target.value;
                                                            if (val) updatePrice(selectedList, p.id, Number(val));
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground text-xs">Kč</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {products.length === 0 && (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Žádné produkty k nacenění</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                          </div>
                      </div>
                  )}
              </CardContent>
          </Card>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nový ceník"
        description="Vytvořte nový ceník pro specifickou skupinu zákazníků."
        footer={
            <Button onClick={createList}>Vytvořit</Button>
        }
      >
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Název ceníku</label>
                  <Input 
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      placeholder="např. Velkoobchod 2024"
                  />
              </div>
          </div>
      </Modal>
    </div>
  );
}
