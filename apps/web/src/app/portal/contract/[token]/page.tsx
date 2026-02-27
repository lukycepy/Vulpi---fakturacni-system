'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Loader2, PenTool, RotateCcw } from 'lucide-react';

export default function SignContractPage({ params }: { params: { token: string } }) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/public/${params.token}`)
        .then(res => res.json())
        .then(setContract)
        .finally(() => setLoading(false));
  }, [params.token]);

  const startDrawing = (e: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: any) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const clearSignature = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitSignature = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const signatureImage = canvas.toDataURL();

      setSubmitting(true);
      const toastId = toast.loading('Odesílám podpis...');
      try {
        const res = await fetch(`/api/contracts/public/${params.token}/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signatureImage })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message || 'Podpis se nepodařilo odeslat.', { id: toastId });
          return;
        }
        toast.success('Smlouva podepsána.', { id: toastId });
        window.location.reload();
      } catch {
        toast.error('Podpis se nepodařilo odeslat.', { id: toastId });
      } finally {
        setSubmitting(false);
      }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!contract) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
      Smlouva nenalezena.
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{contract.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {contract.status === 'SIGNED' ? 'Dokument je platně podepsán.' : 'Dokument čeká na podpis.'}
              </div>
            </div>
            <div
              className={[
                "px-3 py-1 rounded-full text-xs font-semibold border",
                contract.status === 'SIGNED'
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200",
              ].join(" ")}
            >
              {contract.status === 'SIGNED' ? 'Podepsáno' : 'Čeká na podpis'}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="prose max-w-none p-6 rounded-lg border bg-background"
              dangerouslySetInnerHTML={{ __html: contract.content }}
            />

            {contract.status !== 'SIGNED' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold">
                  <PenTool className="h-4 w-4 text-primary" />
                  Podpis
                </div>
                <div className="text-sm text-muted-foreground">
                  Podepište se myší nebo prstem do pole níže.
                </div>

                <div className="border-2 border-dashed border-border rounded-lg inline-block bg-background p-2">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={200}
                    className="cursor-crosshair bg-background rounded"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={clearSignature} disabled={submitting}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Smazat podpis
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button className="sm:ml-auto" variant="blue" disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Odeslat a podepsat
                      </Button>
                    }
                    title="Odeslat podpis?"
                    description="Potvrďte odeslání podpisu. Po odeslání se dokument označí jako podepsaný."
                    actionLabel="Odeslat"
                    onConfirm={submitSignature}
                  />
                </div>
              </div>
            )}

            {contract.status === 'SIGNED' && (
              <div className="text-center p-6 rounded-lg border bg-green-50 border-green-200">
                <div className="text-lg font-semibold text-green-800">Dokument je podepsaný.</div>
                <div className="text-sm text-green-700 mt-1">
                  Děkujeme. Kopie vám byla odeslána na e-mail.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
