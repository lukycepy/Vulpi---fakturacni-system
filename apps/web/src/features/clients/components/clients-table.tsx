'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { ClientDialog } from './client-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface ClientsTableProps {
  clients: any[];
  onRefresh: () => void;
}

export function ClientsTable({ clients, onRefresh }: ClientsTableProps) {
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      const res = await fetch(`/api/clients/${deletingId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Chyba při mazání');
      
      toast.success('Klient smazán');
      onRefresh();
    } catch (error) {
      toast.error('Nelze smazat klienta');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/50 py-4">
            <CardTitle className="text-lg">Seznam klientů</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Název / Firma</TableHead>
                  <TableHead>IČO / DIČ</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Adresa</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Zatím žádní klienti
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{client.ico || '-'}</div>
                        <div className="text-xs text-muted-foreground">{client.dic}</div>
                      </TableCell>
                      <TableCell>
                        {client.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" /> {client.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{client.address}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingId(client.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingClient && (
        <ClientDialog 
          open={!!editingClient} 
          onOpenChange={(open) => !open && setEditingClient(null)}
          client={editingClient}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Smazat klienta?"
        description="Opravdu chcete smazat tohoto klienta? Tato akce je nevratná."
      />
    </>
  );
}
