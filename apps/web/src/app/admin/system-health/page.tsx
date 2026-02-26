'use client';

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

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
      toast.info(`Restarting ${jobName}...`);
      try {
        await fetch('/api/admin/system-health/restart-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobName })
        });
        toast.success(`Restart signal sent for ${jobName}`);
      } catch (e) {
        toast.error(`Failed to restart ${jobName}`);
      }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Načítání...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Health & Monitoring</h1>

      <div className="grid gap-4">
          {logs.map(log => (
              <div key={log.id} className="bg-card border p-6 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                      <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold">{log.jobName}</h2>
                          {log.status === 'SUCCESS' ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">ONLINE</Badge>
                          ) : (
                              <Badge variant="destructive">FAIL</Badge>
                          )}
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                          Poslední běh: {new Date(log.executedAt).toLocaleString()} ({log.duration} ms)
                      </div>
                      {log.errorMessage && (
                          <div className="text-destructive text-sm mt-2 font-mono bg-destructive/10 p-2 rounded">
                              Error: {log.errorMessage}
                          </div>
                      )}
                  </div>
                  <div>
                      <ConfirmDialog
                          trigger={
                              <Button variant="outline">
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Restartovat
                              </Button>
                          }
                          title={`Restartovat ${log.jobName}?`}
                          description="Tato akce restartuje systémovou úlohu. Může to chvíli trvat."
                          onConfirm={() => restartJob(log.jobName)}
                          actionLabel="Restartovat"
                      />
                  </div>
              </div>
          ))}
          {logs.length === 0 && <div className="text-muted-foreground">Žádné záznamy o úlohách.</div>}
      </div>
    </div>
  );
}