'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function TravelPage() {
  const { currentOrg } = useOrganization();
  const [orders, setOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
      destination: '',
      purpose: '',
      vehicle: 'company_car',
      departureTime: '',
      arrivalTime: '',
      distanceKm: 0
  });

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/travel?organizationId=${currentOrg.id}`) // In real app, filter by userId if employee
            .then(res => res.json())
            .then(setOrders);
    }
  }, [currentOrg]);

  const submitOrder = async () => {
      await fetch('/api/travel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              ...newOrder,
              organizationId: currentOrg?.id,
              userId: 'user-1', // Mock User ID
          })
      });
      setShowForm(false);
      // Refresh
      const res = await fetch(`/api/travel?organizationId=${currentOrg?.id}`);
      setOrders(await res.json());
  };

  const approveOrder = async (id: string) => {
      await fetch(`/api/travel/${id}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverId: 'admin-1' })
      });
      // Refresh
      const res = await fetch(`/api/travel?organizationId=${currentOrg?.id}`);
      setOrders(await res.json());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cestovní příkazy</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
              + Nový cesťák
          </button>
      </div>

      {showForm && (
          <div className="bg-white p-6 rounded shadow mb-8">
              <h3 className="font-bold mb-4">Zadat cestu</h3>
              <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Cíl cesty" className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, destination: e.target.value})} />
                  <input placeholder="Účel" className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, purpose: e.target.value})} />
                  <select className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, vehicle: e.target.value})}>
                      <option value="company_car">Firemní auto</option>
                      <option value="private_car">Soukromé auto</option>
                      <option value="train">Vlak/Bus</option>
                  </select>
                  {newOrder.vehicle === 'private_car' && (
                      <input type="number" placeholder="Vzdálenost (km)" className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, distanceKm: Number(e.target.value)})} />
                  )}
                  <input type="datetime-local" className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, departureTime: e.target.value})} />
                  <input type="datetime-local" className="border p-2 rounded" onChange={e => setNewOrder({...newOrder, arrivalTime: e.target.value})} />
              </div>
              <button onClick={submitOrder} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Odeslat</button>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                  <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Zaměstnanec</th>
                      <th className="p-4">Cíl & Účel</th>
                      <th className="p-4">Doprava</th>
                      <th className="p-4 text-right">Diety</th>
                      <th className="p-4 text-right">Celkem</th>
                      <th className="p-4">Stav</th>
                      <th className="p-4">Akce</th>
                  </tr>
              </thead>
              <tbody>
                  {orders.map(order => (
                      <tr key={order.id} className="border-b">
                          <td className="p-4 text-sm text-gray-500">
                              {new Date(order.departureTime).toLocaleDateString()}
                          </td>
                          <td className="p-4">{order.user?.name || 'User'}</td>
                          <td className="p-4">
                              <div className="font-bold">{order.destination}</div>
                              <div className="text-xs text-gray-500">{order.purpose}</div>
                          </td>
                          <td className="p-4 text-sm">{order.vehicle}</td>
                          <td className="p-4 text-right">{Number(order.mealAllowance).toFixed(0)} CZK</td>
                          <td className="p-4 text-right font-bold">{Number(order.totalAmount).toFixed(0)} CZK</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  order.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                  {order.status}
                              </span>
                          </td>
                          <td className="p-4">
                              {order.status === 'SUBMITTED' && (
                                  <button onClick={() => approveOrder(order.id)} className="text-blue-600 hover:underline text-sm">Schválit</button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}
