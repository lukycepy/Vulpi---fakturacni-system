'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientDialog } from '@/features/clients/components/client-dialog';
import { ClientsTable } from '@/features/clients/components/clients-table';

export default function ClientsPage() {
  const { currentOrg } = useOrganization();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchClients = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?organizationId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Failed to fetch clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentOrg]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adresář Klientů</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte své kontakty a firmy pro rychlejší fakturaci.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Přidat klienta
        </Button>
      </div>

      <ClientsTable clients={clients} onRefresh={fetchClients} />

      <ClientDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchClients}
      />
    </div>
  );
}
