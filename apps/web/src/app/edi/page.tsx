'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ArrowDown, ArrowUp, FileJson, Share2 } from 'lucide-react';

export default function EdiPage() {
  const { currentOrg } = useOrganization();
  const [logs, setLogs] = useState<any[]>([]);

  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/edi/logs?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setLogs);
    }
  }, [currentOrg]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">EDI Komunikace (Velkoobchod)</h1>
        <p className="text-muted-foreground mt-2">Logy elektronické výměny dat (EDIFACT/XML) s obchodními partnery.</p>
      </div>
      
      <div className="rounded-md border">
        {logs.length > 0 ? (
          <Table>
              <TableHeader className="bg-muted/50">
                  <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Typ zprávy</TableHead>
                      <TableHead>Směr</TableHead>
                      <TableHead>Stav</TableHead>
                      <TableHead className="text-right">Obsah</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {logs.map(log => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                          <TableCell className="text-muted-foreground text-sm">
                              {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono font-medium">{log.type}</TableCell>
                          <TableCell>
                              {log.direction === 'IN' ? (
                                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                      <ArrowDown className="w-3 h-3 mr-1" /> PŘÍCHOZÍ
                                  </Badge>
                              ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <ArrowUp className="w-3 h-3 mr-1" /> ODCHOZÍ
                                  </Badge>
                              )}
                          </TableCell>
                          <TableCell>
                              <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                                  {log.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedLog(log)}
                              >
                                <FileJson className="w-4 h-4 mr-2" />
                                Zobrazit
                              </Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        ) : (
            <EmptyState
                icon={Share2}
                title="Žádná EDI komunikace"
                description="Zatím neproběhla žádná elektronická výměna dat."
            />
        )}
      </div>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Detail zprávy ${selectedLog?.type}`}
        description={`ID: ${selectedLog?.id}`}
        footer={
            <div className="flex justify-end w-full">
                <Button onClick={() => setSelectedLog(null)}>Zavřít</Button>
            </div>
        }
      >
        <div className="py-4">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-xs border">
                {selectedLog?.content}
            </pre>
        </div>
      </Modal>
    </div>
  );
}
