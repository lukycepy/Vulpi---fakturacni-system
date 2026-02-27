'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw, Activity, Loader2 } from "lucide-react";

export default function SystemHealthPage() {
  const { fetchWithAuth } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/system-health')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load system health');
            return res.json();
        })
        .then(setLogs)
        .catch(err => {
            console.error(err);
            toast.error('Nepodařilo se načíst stav systému');
        })
        .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  const restartJob = async (jobName: string) => {
      toast.info(`Restarting ${jobName}...`);
      try {
        const res = await fetchWithAuth('/api/admin/system-health/restart-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobName })
        });
        
        if (!res.ok) throw new Error('Failed to restart job');
        
        toast.success(`Restart signal sent for ${jobName}`);
      } catch (e) {
        toast.error(`Failed to restart ${jobName}`);
      }
  };

  if (loading) return (
      <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Health & Monitoring</h1>
        <p className="text-muted-foreground">Monitorování stavu služeb, Cron jobů a systémových metrik</p>
      </div>

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
          {logs.length === 0 && (
            <EmptyState
                title="Žádné záznamy"
                description="Systém zatím nezaznamenal žádné běhy úloh."
                icon={Activity}
            />
          )}
      </div>
    </div>
  );
}