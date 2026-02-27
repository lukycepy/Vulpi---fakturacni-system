'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ShoppingCart, CreditCard, Banknote, Search, X, Plus, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function PosPage() {
  const { currentOrg } = useOrganization();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [cashDesks, setCashDesks] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  
  const [selectedDesk, setSelectedDesk] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/cash-desks?organizationId=${currentOrg.id}`).then(res => res.json()).then(setCashDesks);
        fetch(`/api/inventory/warehouses?organizationId=${currentOrg.id}`).then(res => res.json()).then(setWarehouses);
    }
  }, [currentOrg]);

  const search = async (q: string) => {
      setQuery(q);
      if (q.length > 2) {
          const res = await fetch(`/api/pos/products?organizationId=${currentOrg?.id}&q=${q}`);
          setProducts(await res.json());
      }
  };

  const addToCart = (product: any) => {
      const existing = cart.find(i => i.productId === product.id);
      if (existing) {
          setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
          setCart([...cart, { productId: product.id, name: product.name, price: Number(product.unitPrice), quantity: 1 }]);
      }
      setQuery('');
      setProducts([]);
  };

  const removeFromCart = (productId: string) => {
      setCart(cart.filter(i => i.productId !== productId));
  };

  const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const checkout = async (method: 'CASH' | 'CARD') => {
      if (!selectedDesk || !selectedWarehouse) {
          toast.error('Vyberte pokladnu a sklad!');
          return;
      }
      
      const res = await fetch('/api/pos/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              organizationId: currentOrg?.id,
              cashDeskId: selectedDesk,
              warehouseId: selectedWarehouse,
              items: cart,
              paymentMethod: method
          })
      });

      if (res.ok) {
          const receipt = await res.json();
          toast.success(`Zaplaceno! Účtenka: ${receipt.invoiceNumber}`);
          setCart([]);
          // Print Logic (window.print() or specialized library)
      } else {
          toast.error('Chyba při platbě.');
      }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left: Product Search & Grid */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
              <Select 
                  value={selectedDesk}
                  onValueChange={setSelectedDesk}
              >
                  <SelectTrigger>
                      <SelectValue placeholder="Vyberte pokladnu" />
                  </SelectTrigger>
                  <SelectContent>
                      {cashDesks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Select 
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
              >
                  <SelectTrigger>
                      <SelectValue placeholder="Vyberte sklad" />
                  </SelectTrigger>
                  <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                  autoFocus
                  placeholder="Hledat produkt (Název, EAN)..."
                  className="pl-9 h-12 text-lg shadow-sm"
                  value={query}
                  onChange={e => search(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
              {products.map(p => (
                  <Card 
                      key={p.id} 
                      onClick={() => addToCart(p)}
                      className="cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all active:scale-95 group"
                  >
                      <CardContent className="p-4 flex flex-col h-full justify-between gap-2">
                          <div>
                              <div className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{p.name}</div>
                              <div className="text-muted-foreground text-xs mt-1 font-mono">{p.ean}</div>
                          </div>
                          <div className="font-bold text-xl text-primary">{Number(p.unitPrice).toFixed(0)} Kč</div>
                      </CardContent>
                  </Card>
              ))}
              {products.length === 0 && query.length > 2 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground opacity-50">
                      <Package className="h-12 w-12 mb-2" />
                      <p>Žádné produkty nenalezeny</p>
                  </div>
              )}
          </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full md:w-96 bg-card shadow-2xl flex flex-col border-l z-10 h-full">
          <div className="p-6 bg-primary text-primary-foreground shadow-md">
              <div className="flex items-center gap-3 mb-1">
                  <ShoppingCart className="h-6 w-6 opacity-80" />
                  <h2 className="text-2xl font-bold tracking-tight">Košík</h2>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                  {cart.length} {cart.length === 1 ? 'položka' : (cart.length >= 2 && cart.length <= 4) ? 'položky' : 'položek'}
              </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors group">
                      <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium truncate" title={item.name}>{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {item.quantity} x {item.price} Kč
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="font-bold font-mono">{(item.quantity * item.price).toFixed(0)}</div>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                              onClick={() => removeFromCart(item.productId)}
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  </div>
              ))}
              {cart.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState
                        icon={ShoppingCart}
                        title="Košík je prázdný"
                        description="Naskenujte nebo vyhledejte produkty pro přidání do košíku."
                    />
                  </div>
              )}
          </div>

          <div className="p-6 bg-muted/30 border-t space-y-6 backdrop-blur-sm">
              <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground font-medium">Celkem k úhradě</span>
                  <span className="text-3xl font-bold tracking-tight">{total.toFixed(0)} Kč</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                  <ConfirmDialog
                      trigger={
                        <Button 
                            disabled={cart.length === 0}
                            variant="outline"
                            className="h-20 flex flex-col gap-1 border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-base"
                        >
                            <Banknote className="h-6 w-6 text-green-600 dark:text-green-500" />
                            <span>Hotovost</span>
                        </Button>
                      }
                      title="Potvrdit platbu hotovostí?"
                      description={`Opravdu chcete zaplatit ${total.toFixed(0)} Kč v hotovosti?`}
                      onConfirm={() => checkout('CASH')}
                      actionLabel="Zaplatit"
                  />
                  <ConfirmDialog
                      trigger={
                        <Button 
                            disabled={cart.length === 0}
                            className="h-20 flex flex-col gap-1 text-base"
                        >
                            <CreditCard className="h-6 w-6" />
                            <span>Karta</span>
                        </Button>
                      }
                      title="Potvrdit platbu kartou?"
                      description={`Opravdu chcete zaplatit ${total.toFixed(0)} Kč kartou?`}
                      onConfirm={() => checkout('CARD')}
                      actionLabel="Zaplatit"
                  />
              </div>
          </div>
      </div>
    </div>
  );
}
