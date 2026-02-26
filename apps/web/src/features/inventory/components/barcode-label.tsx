'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function BarcodeLabel({ value, text }: { value: string, text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
        try {
            JsBarcode(canvasRef.current, value, {
                format: "CODE128",
                width: 2,
                height: 50,
                displayValue: true,
                text: text || value
            });
        } catch (e) {
            console.error('Barcode error', e);
        }
    }
  }, [value, text]);

  return (
    <div className="border p-4 inline-block bg-white text-center rounded shadow-sm">
        <div className="text-sm font-bold mb-2 truncate max-w-[200px]">{text}</div>
        <canvas ref={canvasRef} />
    </div>
  );
}
