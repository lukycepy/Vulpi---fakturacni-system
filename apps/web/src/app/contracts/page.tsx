'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function ContractsPage() {
  const { currentOrg } = useOrganization();
  const [contracts, setContracts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Generator State
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/contracts?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setContracts);
        
        fetch(`/api/contracts/templates?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setTemplates);

        fetch(`/api/clients?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setClients);
    }
  }, [currentOrg]);

  const createTemplate = async () => {
      const name = prompt('Název šablony:');
      if (!name) return;
      const content = `<h1>Smlouva o dílo</h1><p>Uzavřená mezi {{client_name}} (IČO: {{client_ico}}) a Dodavatelem.</p><p>Předmět: {{deal_title}}</p><p>Cena: {{deal_value}}</p><p>Datum: {{date}}</p>`;
      
      await fetch('/api/contracts/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: currentOrg?.id, name, content })
      });
      // Refresh
      const res = await fetch(`/api/contracts/templates?organizationId=${currentOrg?.id}`);
      setTemplates(await res.json());
  };

  const generateContract = async () => {
      if (!selectedTemplate || !selectedClient) return;
      
      await fetch('/api/contracts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              organizationId: currentOrg?.id,
              templateId: selectedTemplate,
              clientId: selectedClient,
              // dealId: ... (optional)
          })
      });
      setShowGenerator(false);
      // Refresh
      const res = await fetch(`/api/contracts?organizationId=${currentOrg?.id}`);
      setContracts(await res.json());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Smlouvy</h1>
          <div className="flex gap-2">
              <button onClick={createTemplate} className="bg-gray-200 px-4 py-2 rounded">Nová šablona</button>
              <button onClick={() => setShowGenerator(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Vygenerovat smlouvu</button>
          </div>
      </div>

      {showGenerator && (
          <div className="bg-white p-6 rounded shadow mb-8 border-l-4 border-blue-500">
              <h3 className="font-bold mb-4">Průvodce generováním</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">Klient</label>
                      <select 
                          className="w-full border rounded p-2"
                          value={selectedClient}
                          onChange={e => setSelectedClient(e.target.value)}
                      >
                          <option value="">Vyberte klienta</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Šablona</label>
                      <select 
                          className="w-full border rounded p-2"
                          value={selectedTemplate}
                          onChange={e => setSelectedTemplate(e.target.value)}
                      >
                          <option value="">Vyberte šablonu</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                  </div>
              </div>
              <button onClick={generateContract} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Vytvořit</button>
          </div>
      )}

      <div className="grid gap-4">
          {contracts.map(contract => (
              <div key={contract.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-lg">{contract.name}</h3>
                      <div className="text-sm text-gray-500">Klient: {contract.client.name} | Vytvořeno: {new Date(contract.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${contract.status === 'SIGNED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {contract.status}
                      </span>
                      <a 
                          href={`/portal/contract/${contract.publicToken}`} 
                          target="_blank"
                          className="text-blue-600 hover:underline text-sm"
                      >
                          Otevřít portál
                      </a>
                  </div>
              </div>
          ))}
          {contracts.length === 0 && <div className="text-gray-500 text-center p-8">Žádné smlouvy.</div>}
      </div>
    </div>
  );
}
