'use client';

import { useState, useRef, useEffect } from 'react';

export default function SignContractPage({ params }: { params: { token: string } }) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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

      await fetch(`/api/contracts/public/${params.token}/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signatureImage })
      });
      alert('Smlouva podepsána!');
      window.location.reload();
  };

  if (loading) return <div>Načítání...</div>;
  if (!contract) return <div>Smlouva nenalezena.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg my-8 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">{contract.name}</h1>
          <div className={`px-3 py-1 rounded text-sm font-bold ${contract.status === 'SIGNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {contract.status === 'SIGNED' ? 'PODEPSÁNO' : 'ČEKÁ NA PODPIS'}
          </div>
      </div>

      <div className="prose max-w-none mb-12 p-8 border bg-gray-50 rounded" dangerouslySetInnerHTML={{ __html: contract.content }} />

      {contract.status !== 'SIGNED' && (
          <div className="border-t pt-8">
              <h3 className="text-lg font-bold mb-4">Podpis</h3>
              <p className="text-sm text-gray-500 mb-4">Prosím podepište se do pole níže myší nebo prstem.</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded mb-4 inline-block">
                  <canvas 
                      ref={canvasRef}
                      width={500}
                      height={200}
                      className="cursor-crosshair bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                  />
              </div>
              
              <div className="flex gap-4">
                  <button onClick={clearSignature} className="text-gray-500 hover:underline">Smazat podpis</button>
                  <button onClick={submitSignature} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                      Odeslat a Podepsat
                  </button>
              </div>
          </div>
      )}

      {contract.status === 'SIGNED' && (
          <div className="text-center p-8 bg-green-50 rounded border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-2">Dokument je platně podepsán.</h3>
              <p className="text-green-700">Děkujeme. Kopie vám byla odeslána na e-mail.</p>
          </div>
      )}
    </div>
  );
}
