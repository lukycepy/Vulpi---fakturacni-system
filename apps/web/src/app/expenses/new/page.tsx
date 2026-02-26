'use client';

import { useState } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function NewExpensePage() {
  const { currentOrg } = useOrganization();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
      supplierName: '',
      supplierIco: '',
      description: '',
      amount: '',
      issueDate: '',
      category: '',
      vatRate: '21'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setFile(e.target.files[0]);
      }
  };

  const analyzeFile = async () => {
      if (!file) return;
      setAnalyzing(true);
      
      const form = new FormData();
      form.append('file', file);
      
      try {
          const res = await fetch('/api/expenses/analyze', {
              method: 'POST',
              body: form
          });
          const data = await res.json();
          
          setFormData(prev => ({
              ...prev,
              supplierIco: data.supplierIco || prev.supplierIco,
              amount: data.amount ? String(data.amount) : prev.amount,
              issueDate: data.issueDate || prev.issueDate,
              category: data.category || prev.category,
              description: `Nákup - ${data.category || 'Neurčeno'}`
          }));
      } catch (e) {
          alert('Chyba při analýze souboru');
      } finally {
          setAnalyzing(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentOrg) return;

      const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              ...formData,
              organizationId: currentOrg.id,
              amount: Number(formData.amount),
              vatRate: Number(formData.vatRate)
          })
      });
      
      if (res.ok) {
          alert('Výdaj uložen');
          window.location.href = '/expenses/new'; // Reset or redirect
      } else {
          alert('Chyba při ukládání');
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nový výdaj</h1>

      {/* AI Upload Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded mb-8 border border-blue-100 dark:border-blue-800">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span>🤖</span> AI Skener
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Nahrajte účtenku nebo fakturu. AI automaticky vyplní údaje.
          </p>
          <div className="flex gap-4">
              <input type="file" onChange={handleFileChange} className="text-sm" accept="image/*,.pdf" />
              <button 
                  onClick={analyzeFile} 
                  disabled={!file || analyzing}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                  {analyzing ? 'Analyzuji...' : 'Analyzovat'}
              </button>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm font-medium mb-1">Popis</label>
              <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded p-2 dark:bg-gray-800"
                  required
              />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">IČO Dodavatele</label>
                  <input 
                      type="text" 
                      value={formData.supplierIco}
                      onChange={e => setFormData({...formData, supplierIco: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                  />
              </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Dodavatel (Název)</label>
                  <input 
                      type="text" 
                      value={formData.supplierName}
                      onChange={e => setFormData({...formData, supplierName: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                      required
                  />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Částka (CZK)</label>
                  <input 
                      type="number" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                      required
                  />
              </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Datum vystavení</label>
                  <input 
                      type="date" 
                      value={formData.issueDate}
                      onChange={e => setFormData({...formData, issueDate: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                      required
                  />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Kategorie (AI)</label>
                  <input 
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                  />
              </div>
               <div>
                  <label className="block text-sm font-medium mb-1">DPH (%)</label>
                  <select 
                      value={formData.vatRate}
                      onChange={e => setFormData({...formData, vatRate: e.target.value})}
                      className="w-full border rounded p-2 dark:bg-gray-800"
                  >
                      <option value="21">21%</option>
                      <option value="12">12%</option>
                      <option value="0">0%</option>
                  </select>
              </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold mt-6">
              Uložit výdaj
          </button>
      </form>
    </div>
  );
}
