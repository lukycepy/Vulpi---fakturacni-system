'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import ShippingWidget from '@/features/sales/components/shipping-widget';

export default function OrdersPage() {
  const { currentOrg } = useOrganization();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/orders?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(data => setOrders(data));
    }
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Objednávky</h1>

      <div className="grid gap-4">
          {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                  <div className="flex justify-between items-start">
                      <div>
                          <h2 className="text-xl font-bold">{order.orderNumber}</h2>
                          <div className="text-gray-500">{order.client.name}</div>
                          <div className="text-sm mt-1">{new Date(order.issueDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-lg">{Number(order.totalAmount).toFixed(2)} {order.currency}</div>
                          <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 uppercase">
                              {order.status}
                          </span>
                      </div>
                  </div>

                  {/* Shipping Integration */}
                  <div className="mt-4 border-t pt-4">
                      <ShippingWidget order={order} />
                  </div>
              </div>
          ))}
          {orders.length === 0 && <div className="text-center text-gray-500 py-8">Žádné objednávky</div>}
      </div>
    </div>
  );
}
