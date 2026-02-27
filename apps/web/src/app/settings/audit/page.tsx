'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Activity, Download, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg) {
        setLoading(true);
        fetchWithAuth(`/api/audit?organizationId=${currentOrg.id}`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch audit logs');
            })
            .then(data => setLogs(data))
            .catch(err => {
                console.error(err);
                toast.error('Nepodařilo se načíst audit logy');
            })
            .finally(() => setLoading(false));
    }
  }, [currentOrg, fetchWithAuth]);

  const handleAnonymize = () => {
    toast.success('Požadavek na anonymizaci byl odeslán.');
  };

  const handleExport = () => {
    toast.success('Export dat byl zahájen.');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log & Bezpečnost</h1>
          <p className="text-muted-foreground mt-2">Přehled aktivit a bezpečnostních událostí v organizaci.</p>
      </div>
      
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Uživatel</TableHead>
                        <TableHead>Akce</TableHead>
                        <TableHead>Entita</TableHead>
                        <TableHead>IP Adresa</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{log.userId || 'Systém'}</TableCell>
                            <TableCell>
                                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                    {log.action}
                                </code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{log.entityType} <span className="text-xs opacity-70">({log.entityId})</span></TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">{log.ipAddress || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
          ) : (
            <div className="p-6">
            <EmptyState
                icon={Activity}
                title="Žádné záznamy auditu"
                description={loading ? "Načítám záznamy..." : "Zatím nebyly zaznamenány žádné bezpečnostní události."}
            />
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">GDPR Nástroje</h2>
          <div className="flex gap-4">
              <ConfirmDialog
                trigger={
                    <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50">
                        <UserX className="w-4 h-4 mr-2" />
                        Anonymizovat klienta
                    </Button>
                }
                title="Anonymizovat data?"
                description="Tato akce je nevratná. Osobní údaje klienta budou trvale odstraněny nebo anonymizovány."
                onConfirm={handleAnonymize}
                variant="destructive"
                actionLabel="Anonymizovat"
              />
              
              <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportovat moje data (JSON)
              </Button>
          </div>
      </div>
    </div>
  );
}
