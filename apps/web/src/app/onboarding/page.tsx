'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { currentOrg } = useOrganization();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({});

  useEffect(() => {
      if (currentOrg) {
          setData((prev: any) => ({ ...prev, organizationId: currentOrg.id }));
          // If org exists, maybe jump to step 2? For now, let's just assume we start from scratch or edit existing.
          setStep(2); 
      }
  }, [currentOrg]);

  const nextStep = () => setStep(step + 1);

  const saveOrg = async () => {
      // Mock ARES fetch
      const res = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, ico: data.ico })
      });
      const org = await res.json();
      setData({ ...data, organizationId: org.id });
      nextStep();
  };

  const saveBank = async () => {
      await fetch('/api/bank-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              organizationId: data.organizationId,
              accountNumber: data.accountNumber,
              bankCode: data.bankCode
          })
      });
      nextStep();
  };

  const saveLogo = async () => {
      // Mock Upload
      nextStep();
  };

  const finish = () => {
      router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {s}
                  </div>
              ))}
          </div>

          {step === 1 && (
              <div>
                  <h2 className="text-2xl font-bold mb-4">Vítejte ve Vulpi! 👋</h2>
                  <p className="mb-4 text-gray-600">Začněme přidáním vaší firmy. Zadejte IČO a my zbytek načteme z ARES.</p>
                  <input placeholder="IČO (např. 12345678)" className="w-full border p-3 rounded mb-4" onChange={e => setData({...data, ico: e.target.value})} />
                  <input placeholder="Název firmy" className="w-full border p-3 rounded mb-4" onChange={e => setData({...data, name: e.target.value})} />
                  <button onClick={saveOrg} className="w-full bg-blue-600 text-white py-3 rounded font-bold">Pokračovat</button>
              </div>
          )}

          {step === 2 && (
              <div>
                  <h2 className="text-2xl font-bold mb-4">Bankovní spojení 🏦</h2>
                  <p className="mb-4 text-gray-600">Kam vám mají klienti posílat peníze?</p>
                  <input placeholder="Číslo účtu" className="w-full border p-3 rounded mb-4" onChange={e => setData({...data, accountNumber: e.target.value})} />
                  <input placeholder="Kód banky (např. 0800)" className="w-full border p-3 rounded mb-4" onChange={e => setData({...data, bankCode: e.target.value})} />
                  <button onClick={saveBank} className="w-full bg-blue-600 text-white py-3 rounded font-bold">Uložit a Pokračovat</button>
              </div>
          )}

          {step === 3 && (
              <div>
                  <h2 className="text-2xl font-bold mb-4">Váš Brand 🎨</h2>
                  <p className="mb-4 text-gray-600">Nahrajte logo, aby vaše faktury vypadaly profesionálně.</p>
                  <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded mb-4 cursor-pointer hover:bg-gray-50">
                      Klikněte pro nahrání loga
                  </div>
                  <div className="flex gap-4">
                      <button onClick={nextStep} className="flex-1 text-gray-500">Přeskočit</button>
                      <button onClick={saveLogo} className="flex-1 bg-blue-600 text-white py-3 rounded font-bold">Pokračovat</button>
                  </div>
              </div>
          )}

          {step === 4 && (
              <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4 text-green-600">Hotovo! 🎉</h2>
                  <p className="mb-6 text-gray-600">Vše je nastaveno. Můžete začít fakturovat.</p>
                  <button onClick={finish} className="w-full bg-green-600 text-white py-3 rounded font-bold text-lg shadow-lg hover:bg-green-700">
                      Přejít do Vulpi
                  </button>
              </div>
          )}
      </div>
    </div>
  );
}
