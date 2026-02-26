'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function AuditPage() {
  const { currentOrg } = useOrganization();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/audit?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(data => setLogs(data));
    }
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Audit Log & Bezpečnost</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                  <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Uživatel</th>
                      <th className="p-4">Akce</th>
                      <th className="p-4">Entita</th>
                      <th className="p-4">IP Adresa</th>
                  </tr>
              </thead>
              <tbody>
                  {logs.map(log => (
                      <tr key={log.id} className="border-b">
                          <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="p-4">{log.userId || 'Systém'}</td>
                          <td className="p-4 font-mono">{log.action}</td>
                          <td className="p-4 text-gray-500">{log.entityType} ({log.entityId})</td>
                          <td className="p-4 text-gray-500">{log.ipAddress || '-'}</td>
                      </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Žádné záznamy</td></tr>}
              </tbody>
          </table>
      </div>
      
      <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">GDPR Nástroje</h2>
          <div className="flex gap-4">
              <button className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-50">
                  Anonymizovat klienta
              </button>
              <button className="px-4 py-2 border border-blue-500 text-blue-600 rounded hover:bg-blue-50">
                  Exportovat moje data (JSON)
              </button>
          </div>
      </div>
    </div>
  );
}
