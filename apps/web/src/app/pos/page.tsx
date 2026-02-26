'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

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
          alert('Vyberte pokladnu a sklad!');
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
          alert(`Zaplaceno! Účtenka: ${receipt.invoiceNumber}`);
          setCart([]);
          // Print Logic (window.print() or specialized library)
      } else {
          alert('Chyba při platbě.');
      }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
      {/* Left: Product Search & Grid */}
      <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4 flex gap-4">
              <select 
                  className="border p-2 rounded"
                  value={selectedDesk}
                  onChange={e => setSelectedDesk(e.target.value)}
              >
                  <option value="">Vyberte pokladnu</option>
                  {cashDesks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select 
                  className="border p-2 rounded"
                  value={selectedWarehouse}
                  onChange={e => setSelectedWarehouse(e.target.value)}
              >
                  <option value="">Vyberte sklad</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
          </div>

          <input 
              autoFocus
              placeholder="Hledat produkt (Název, EAN)..."
              className="w-full p-4 text-xl border rounded shadow mb-4"
              value={query}
              onChange={e => search(e.target.value)}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
              {products.map(p => (
                  <div 
                      key={p.id} 
                      onClick={() => addToCart(p)}
                      className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer hover:bg-blue-50 active:scale-95 transition"
                  >
                      <div className="font-bold text-lg mb-1">{p.name}</div>
                      <div className="text-gray-500 text-sm mb-2">{p.ean}</div>
                      <div className="font-bold text-blue-600">{Number(p.unitPrice).toFixed(0)} CZK</div>
                  </div>
              ))}
          </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 shadow-xl flex flex-col border-l">
          <div className="p-6 bg-blue-600 text-white">
              <h2 className="text-2xl font-bold">Košík</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center border-b pb-2">
                      <div>
                          <div className="font-bold">{item.name}</div>
                          <div className="text-sm text-gray-500">
                              {item.quantity} x {item.price} CZK
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="font-bold">{(item.quantity * item.price).toFixed(0)}</div>
                          <button onClick={() => removeFromCart(item.productId)} className="text-red-500 font-bold">×</button>
                      </div>
                  </div>
              ))}
              {cart.length === 0 && <div className="text-center text-gray-400 mt-10">Košík je prázdný</div>}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t">
              <div className="flex justify-between text-2xl font-bold mb-6">
                  <span>Celkem:</span>
                  <span>{total.toFixed(0)} CZK</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <button 
                      onClick={() => checkout('CASH')}
                      disabled={cart.length === 0}
                      className="bg-green-600 text-white py-4 rounded font-bold text-lg hover:bg-green-700 disabled:opacity-50"
                  >
                      HOTOVOST
                  </button>
                  <button 
                      onClick={() => checkout('CARD')}
                      disabled={cart.length === 0}
                      className="bg-blue-600 text-white py-4 rounded font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                      KARTA
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
