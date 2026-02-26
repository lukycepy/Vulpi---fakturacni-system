'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function SystemHealthPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/system-health')
        .then(res => res.json())
        .then(setLogs)
        .finally(() => setLoading(false));
  }, []);

  const restartJob = async (jobName: string) => {
      await fetch('/api/admin/system-health/restart-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobName })
      });
      alert(`Restart signal sent for ${jobName}`);
  };

  if (loading) return <div>Načítání...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Health & Monitoring</h1>

      <div className="grid gap-4">
          {logs.map(log => (
              <div key={log.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow flex justify-between items-center">
                  <div>
                      <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold">{log.jobName}</h2>
                          {log.status === 'SUCCESS' ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">ONLINE</span>
                          ) : (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">FAIL</span>
                          )}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                          Poslední běh: {new Date(log.executedAt).toLocaleString()} ({log.duration} ms)
                      </div>
                      {log.errorMessage && (
                          <div className="text-red-600 text-sm mt-2 font-mono bg-red-50 p-2 rounded">
                              Error: {log.errorMessage}
                          </div>
                      )}
                  </div>
                  <div>
                      <button 
                          onClick={() => restartJob(log.jobName)}
                          className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm"
                      >
                          Restartovat
                      </button>
                  </div>
              </div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">Žádné záznamy o úlohách.</div>}
      </div>
    </div>
  );
}
