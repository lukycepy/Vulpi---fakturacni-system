'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function CashDeskPage() {
  const { currentOrg } = useOrganization();
  const [cashDesks, setCashDesks] = useState<any[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<any>(null);
  const [newTransaction, setNewTransaction] = useState({ type: 'EXPENSE', amount: 0, description: '' });

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/cash-desks?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(data => {
                setCashDesks(data);
                if (data.length > 0) setSelectedDesk(data[0]);
            });
    }
  }, [currentOrg]);

  const createDesk = async () => {
      const name = prompt('Název pokladny (např. Hlavní CZK):');
      if (!name || !currentOrg) return;
      await fetch('/api/cash-desks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: currentOrg.id, name, currency: 'CZK' })
      });
      // Refresh
      const res = await fetch(`/api/cash-desks?organizationId=${currentOrg.id}`);
      setCashDesks(await res.json());
  };

  const submitTransaction = async () => {
      if (!selectedDesk || !newTransaction.amount || !newTransaction.description) return;
      
      try {
          await fetch(`/api/cash-desks/${selectedDesk.id}/transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...newTransaction,
                  transactionDate: new Date().toISOString()
              })
          });
          
          setNewTransaction({ type: 'EXPENSE', amount: 0, description: '' });
          // Refresh Desk
          const res = await fetch(`/api/cash-desks/${selectedDesk.id}`);
          const updated = await res.json();
          setSelectedDesk(updated);
          
          // Update list
          setCashDesks(prev => prev.map(d => d.id === updated.id ? updated : d));
      } catch (e) {
          alert('Chyba: ' + e);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pokladna</h1>
          <button onClick={createDesk} className="bg-blue-600 text-white px-4 py-2 rounded">
              + Nová pokladna
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cashDesks.map(desk => (
              <div 
                  key={desk.id} 
                  onClick={() => setSelectedDesk(desk)}
                  className={`p-6 rounded shadow cursor-pointer border-2 ${selectedDesk?.id === desk.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}
              >
                  <h3 className="font-bold text-lg">{desk.name}</h3>
                  <div className={`text-2xl font-bold mt-2 ${Number(desk.currentBalance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(desk.currentBalance).toFixed(2)} {desk.currency}
                  </div>
              </div>
          ))}
      </div>

      {selectedDesk && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transaction Form */}
              <div className="lg:col-span-1 bg-white p-6 rounded shadow h-fit">
                  <h3 className="font-bold mb-4">Nová transakce</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1">Typ</label>
                          <select 
                              value={newTransaction.type}
                              onChange={e => setNewTransaction({...newTransaction, type: e.target.value})}
                              className="w-full border rounded px-3 py-2"
                          >
                              <option value="EXPENSE">Výdaj (-)</option>
                              <option value="INCOME">Příjem (+)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Popis</label>
                          <input 
                              type="text" 
                              value={newTransaction.description}
                              onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                              className="w-full border rounded px-3 py-2"
                              placeholder="Nákup kancelářských potřeb"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Částka</label>
                          <input 
                              type="number" 
                              value={newTransaction.amount}
                              onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                              className="w-full border rounded px-3 py-2"
                          />
                      </div>
                      <button 
                          onClick={submitTransaction}
                          className={`w-full text-white px-4 py-2 rounded font-bold ${newTransaction.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                          {newTransaction.type === 'INCOME' ? 'Přijmout hotovost' : 'Vydat hotovost'}
                      </button>
                  </div>
              </div>

              {/* History */}
              <div className="lg:col-span-2 bg-white rounded shadow overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                          <tr>
                              <th className="p-4">Datum</th>
                              <th className="p-4">Popis</th>
                              <th className="p-4 text-right">Příjem</th>
                              <th className="p-4 text-right">Výdaj</th>
                              <th className="p-4"></th>
                          </tr>
                      </thead>
                      <tbody>
                          {selectedDesk.transactions.map((tx: any) => (
                              <tr key={tx.id} className="border-b">
                                  <td className="p-4 text-sm text-gray-500">
                                      {new Date(tx.transactionDate).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 font-medium">{tx.description}</td>
                                  <td className="p-4 text-right text-green-600 font-bold">
                                      {tx.type === 'INCOME' ? `+${Number(tx.amount).toFixed(2)}` : ''}
                                  </td>
                                  <td className="p-4 text-right text-red-600 font-bold">
                                      {tx.type === 'EXPENSE' ? `-${Number(tx.amount).toFixed(2)}` : ''}
                                  </td>
                                  <td className="p-4 text-right">
                                      <a href={`/api/cash-desks/transactions/${tx.id}/pdf`} target="_blank" className="text-blue-600 hover:underline text-xs">
                                          Doklad
                                      </a>
                                  </td>
                              </tr>
                          ))}
                          {selectedDesk.transactions.length === 0 && (
                              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Žádné transakce</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
}
