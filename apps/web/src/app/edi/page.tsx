'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function EdiPage() {
  const { currentOrg } = useOrganization();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/edi/logs?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setLogs);
    }
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">EDI Komunikace (Velkoobchod)</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                  <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Typ</th>
                      <th className="p-4">Směr</th>
                      <th className="p-4">Stav</th>
                      <th className="p-4">Obsah</th>
                  </tr>
              </thead>
              <tbody>
                  {logs.map(log => (
                      <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-4 text-sm text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-mono font-bold">{log.type}</td>
                          <td className="p-4">
                              {log.direction === 'IN' ? (
                                  <span className="text-blue-600 font-bold">⬇️ PŘÍCHOZÍ</span>
                              ) : (
                                  <span className="text-green-600 font-bold">⬆️ ODCHOZÍ</span>
                              )}
                          </td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.status}
                              </span>
                          </td>
                          <td className="p-4">
                              <details className="cursor-pointer text-xs text-gray-500">
                                  <summary>Zobrazit EDIFACT</summary>
                                  <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                      {log.content}
                                  </pre>
                              </details>
                          </td>
                      </tr>
                  ))}
                  {logs.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">
                              Zatím žádná EDI komunikace.
                          </td>
                  </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
