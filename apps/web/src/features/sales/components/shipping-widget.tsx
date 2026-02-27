'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Download, ExternalLink } from 'lucide-react';

export default function ShippingWidget({ order }: { order: any }) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(order.trackingNumber);
  const [labelUrl, setLabelUrl] = useState(order.shippingLabelUrl);

  const createLabel = async () => {
    setLoading(true);
    try {
        const res = await fetchWithAuth('/api/shipping/create-label', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id })
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create label');
        }

        const data = await res.json();
        setTracking(data.trackingNumber);
        setLabelUrl(data.labelUrl);
        toast.success('Štítek byl úspěšně vytvořen');
    } catch (e: any) {
        toast.error('Chyba při vytváření štítku: ' + (e.message || 'Neznámá chyba'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Logistika
            </CardTitle>
        </CardHeader>
        <CardContent>
            {tracking ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">Zásilkovna</span>
                        <span className="font-mono font-bold">{tracking}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={labelUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Stáhnout štítek
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`https://tracking.packeta.com/cs/?id=${tracking}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Sledovat zásilku
                            </a>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Objednávka je připravena k expedici.</p>
                    <Button 
                        onClick={createLabel} 
                        disabled={loading}
                        className="w-full sm:w-auto"
                        variant="default"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                        {loading ? 'Generuji...' : 'Vytvořit štítek (Zásilkovna)'}
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
