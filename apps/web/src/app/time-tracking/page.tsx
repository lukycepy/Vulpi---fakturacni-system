'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { useOrganization } from '@/components/providers/organization-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Timer, Trash2 } from 'lucide-react';

export default function TimeTrackingPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
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
        fetchWithAuth(`/api/projects?organizationId=${currentOrg.id}`)
            .then((res: Response) => res.json())
            .then(setProjects);

        // Load Entries
        fetchWithAuth(`/api/time-tracking?organizationId=${currentOrg.id}`)
            .then((res: Response) => res.json())
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

      await fetchWithAuth('/api/time-tracking', {
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
      const res = await fetchWithAuth(`/api/time-tracking?organizationId=${currentOrg.id}`);
      setEntries(await res.json());
      
      setStartTime(null);
      setElapsed(0);
      setDescription('');
  };

  const deleteEntry = async (id: string) => {
      try {
          const res = await fetchWithAuth(`/api/time-tracking/${id}?organizationId=${currentOrg?.id}`, {
              method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete entry');
          
          setEntries(entries.filter(e => e.id !== id));
          toast.success('Záznam smazán');
      } catch (error) {
          console.error(error);
          toast.error('Chyba při mazání záznamu');
      }
  };

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Měření času</h1>
        <p className="text-muted-foreground mt-2">Sledujte čas strávený na projektech pro přesnou fakturaci.</p>
      </div>

      {/* Timer Widget */}
      <Card className="p-6 flex flex-col md:flex-row items-center gap-4 bg-muted/30">
          <div className="flex-1 w-full">
            <Input 
              type="text" 
              placeholder="Na čem pracujete?" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-background"
            />
          </div>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="-- Projekt --" />
            </SelectTrigger>
            <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="font-mono text-2xl w-32 text-center font-bold text-primary">
              {formatTime(elapsed)}
          </div>
          {!timerRunning ? (
              <Button 
                  onClick={startTimer}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
              >
                  <Play className="w-4 h-4 mr-2 fill-current" /> START
              </Button>
          ) : (
              <Button 
                  onClick={stopTimer}
                  variant="destructive"
                  size="lg"
                  className="w-full md:w-auto"
              >
                  <Square className="w-4 h-4 mr-2 fill-current" /> STOP
              </Button>
          )}
      </Card>

      {/* History */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {entries.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Projekt</TableHead>
                      <TableHead>Popis</TableHead>
                      <TableHead>Doba trvání</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map(entry => (
                        <TableRow key={entry.id}>
                            <TableCell className="text-muted-foreground">{new Date(entry.startTime).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{entry.project?.name || '-'}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                            <TableCell className="font-mono">{formatTime(entry.duration)}</TableCell>
                            <TableCell>
                                {entry.isInvoiced ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">VYFAKTUROVÁNO</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground bg-muted/50">NEFAKTUROVÁNO</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {!entry.isInvoiced && (
                                  <ConfirmDialog
                                      trigger={
                                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      }
                                      title="Smazat záznam?"
                                      description="Opravdu chcete smazat tento časový záznam?"
                                      onConfirm={() => deleteEntry(entry.id)}
                                      variant="destructive"
                                      actionLabel="Smazat"
                                  />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
          ) : (
              <div className="p-6">
              <EmptyState
                  icon={Timer}
                  title="Žádné časové záznamy"
                  description="Začněte měřit čas pro sledování vaší práce."
              />
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
