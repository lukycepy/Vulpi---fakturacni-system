'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import ShippingWidget from '@/features/sales/components/shipping-widget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CreditCard } from "lucide-react";

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'zaplaceno':
        return 'success'; // Assuming we have a success variant or stick to default/secondary
      case 'pending':
      case 'čeká na platbu':
        return 'secondary';
      case 'cancelled':
      case 'zrušeno':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Objednávky</h1>

      <div className="grid gap-4">
          {orders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start">
                          <div className="space-y-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                  {order.orderNumber}
                                  <Badge variant={getStatusBadgeVariant(order.status)} className="ml-2 uppercase text-[10px]">
                                      {order.status}
                                  </Badge>
                              </CardTitle>
                              <div className="flex items-center text-sm text-muted-foreground gap-4">
                                  <div className="flex items-center gap-1">
                                      <User className="h-3.5 w-3.5" />
                                      {order.client.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {new Date(order.issueDate).toLocaleDateString('cs-CZ')}
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-mono font-bold text-xl text-primary">
                                  {Number(order.totalAmount).toLocaleString('cs-CZ', { style: 'currency', currency: order.currency || 'CZK' })}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                  Celkem s DPH
                              </div>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                      {/* Shipping Integration */}
                      <ShippingWidget order={order} />
                  </CardContent>
              </Card>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-muted-foreground">Zatím zde nejsou žádné objednávky.</p>
            </div>
          )}
      </div>
    </div>
  );
}
