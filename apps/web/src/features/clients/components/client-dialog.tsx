'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useOrganization } from '@/components/providers/organization-provider';

const clientSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  ico: z.string().optional(),
  dic: z.string().optional(),
  email: z.string().email('Neplatný email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
  onSuccess: () => void;
}

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const { currentOrg } = useOrganization();
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      ico: client?.ico || '',
      dic: client?.dic || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      city: client?.city || '',
      zip: client?.zip || '',
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      const url = client 
        ? `/api/clients/${client.id}`
        : '/api/clients';
        
      const method = client ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          organizationId: currentOrg.id,
        }),
      });

      if (!res.ok) throw new Error('Chyba při ukládání klienta');

      toast.success(client ? 'Klient aktualizován' : 'Klient vytvořen');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Něco se pokazilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? 'Upravit klienta' : 'Nový klient'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Název *</Label>
              <Input id="name" className="col-span-3" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-red-500 text-xs col-start-2 col-span-3">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ico" className="text-right">IČO</Label>
              <Input id="ico" className="col-span-3" {...form.register('ico')} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dic" className="text-right">DIČ</Label>
              <Input id="dic" className="col-span-3" {...form.register('dic')} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" className="col-span-3" {...form.register('email')} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Telefon</Label>
              <Input id="phone" className="col-span-3" {...form.register('phone')} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Adresa</Label>
              <Input id="address" className="col-span-3" {...form.register('address')} />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Zrušit</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ukládám...' : 'Uložit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
