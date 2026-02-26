'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function TimeTrackingPage() {
  const { currentOrg } = useOrganization();
  const [entries, setEntries] = useState<any[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (currentOrg) {
        // Load Projects
        fetch(`/api/projects?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setProjects);

        // Load Entries
        fetch(`/api/time-tracking?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setEntries);
    }
  }, [currentOrg]);

  useEffect(() => {
    let interval: any;
    if (timerRunning && startTime) {
        interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
        }, 1000);
    } else {
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

  const startTimer = () => {
      setStartTime(new Date());
      setTimerRunning(true);
      setElapsed(0);
  };

  const stopTimer = async () => {
      setTimerRunning(false);
      if (!currentOrg || !startTime) return;
      
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await fetch('/api/time-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              organizationId: currentOrg.id,
              projectId: projectId || undefined,
              description: description || 'Práce',
              startTime,
              endTime,
              duration
          })
      });

      // Refresh
      const res = await fetch(`/api/time-tracking?organizationId=${currentOrg.id}`);
      setEntries(await res.json());
      
      setStartTime(null);
      setElapsed(0);
      setDescription('');
  };

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Měření času</h1>

      {/* Timer Widget */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8 flex items-center gap-4">
          <input 
              type="text" 
              placeholder="Na čem pracujete?" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
          />
          <select 
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="border rounded px-4 py-2 w-48"
          >
              <option value="">-- Projekt --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="font-mono text-2xl w-32 text-center">
              {formatTime(elapsed)}
          </div>
          {!timerRunning ? (
              <button 
                  onClick={startTimer}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold"
              >
                  START
              </button>
          ) : (
              <button 
                  onClick={stopTimer}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold"
              >
                  STOP
              </button>
          )}
      </div>

      {/* History */}
      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                  <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Projekt</th>
                      <th className="p-4">Popis</th>
                      <th className="p-4">Doba trvání</th>
                      <th className="p-4">Status</th>
                  </tr>
              </thead>
              <tbody>
                  {entries.map(entry => (
                      <tr key={entry.id} className="border-b">
                          <td className="p-4 text-gray-500">{new Date(entry.startTime).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{entry.project?.name || '-'}</td>
                          <td className="p-4">{entry.description}</td>
                          <td className="p-4 font-mono">{formatTime(entry.duration)}</td>
                          <td className="p-4">
                              {entry.isInvoiced ? (
                                  <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">VYFAKTUROVÁNO</span>
                              ) : (
                                  <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">NEFAKTUROVÁNO</span>
                              )}
                          </td>
                      </tr>
                  ))}
                  {entries.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Žádné záznamy</td></tr>}
              </tbody>
          </table>
      </div>
    </div>
  );
}
