'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { Copy, Plus, Trash2, Key, Webhook } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DeveloperSettingsPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    if (currentOrg) {
        loadKeys();
        loadWebhooks();
    }
  }, [currentOrg]);

  const loadKeys = async () => {
    try {
      const res = await fetchWithAuth(`/api/api-keys?organizationId=${currentOrg?.id}`);
      if (res.ok) setKeys(await res.json());
    } catch (error) {
      console.error('Failed to load keys:', error);
      toast.error('Nepodařilo se načíst API klíče');
    }
  };

  const loadWebhooks = async () => {
    try {
      const res = await fetchWithAuth(`/api/webhooks?organizationId=${currentOrg?.id}`);
      if (res.ok) setWebhooks(await res.json());
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      toast.error('Nepodařilo se načíst webhooky');
    }
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error('Zadejte název klíče');
      return;
    }

    setLoading(true);
    try {
        const res = await fetchWithAuth('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId: currentOrg?.id, name: keyName })
        });
        
        if (!res.ok) throw new Error('Failed to create key');
        
        const data = await res.json();
        setNewKey(data.rawKey);
        loadKeys();
        setIsKeyModalOpen(false);
        setKeyName('');
        toast.success('API klíč vytvořen');
    } catch (error) {
        console.error(error);
        toast.error('Chyba při vytváření klíče');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
      try {
        const res = await fetchWithAuth(`/api/api-keys/${id}?organizationId=${currentOrg?.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete key');
        
        loadKeys();
        toast.success('API klíč smazán');
      } catch (error) {
        console.error(error);
        toast.error('Chyba při mazání klíče');
      }
  };

  const handleCreateWebhook = async () => {
      if (!webhookUrl.trim()) {
        toast.error('Zadejte URL webhooku');
        return;
      }
      
      try {
        const res = await fetchWithAuth('/api/webhooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                organizationId: currentOrg?.id, 
                url: webhookUrl,
                events: ['invoice.paid', 'invoice.sent'] // Default events
            })
        });

        if (!res.ok) throw new Error('Failed to create webhook');

        loadWebhooks();
        setIsWebhookModalOpen(false);
        setWebhookUrl('');
        toast.success('Webhook přidán');
      } catch (error) {
        console.error(error);
        toast.error('Chyba při vytváření webhooku');
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Zkopírováno do schránky');
  };

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vývojářské nastavení</h1>
        <p className="text-muted-foreground mt-2">
          Spravujte API klíče a webhooky pro integraci s externími systémy.
        </p>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Klíče
                </CardTitle>
                <CardDescription>
                    Klíče pro autentizaci vašich požadavků na API.
                </CardDescription>
            </div>
            <Button onClick={() => setIsKeyModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Generovat klíč
            </Button>
        </CardHeader>
        <CardContent>
            {newKey && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-md mb-6 relative">
                    <p className="font-bold mb-1">Váš nový API klíč:</p>
                    <div className="flex items-center gap-2">
                        <code className="bg-white dark:bg-black px-2 py-1 rounded border font-mono text-sm flex-1 break-all">
                            {newKey}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(newKey)} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs mt-2 opacity-90">
                        Uložte si ho bezpečně. Znovu se již nezobrazí!
                    </p>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setNewKey(null)} 
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-800"
                    >
                        <span className="sr-only">Zavřít</span>
                        ×
                    </Button>
                </div>
            )}

            {keys.length > 0 ? (
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="h-12 px-4 align-middle font-medium text-muted-foreground">Název</TableHead>
                                <TableHead className="h-12 px-4 align-middle font-medium text-muted-foreground">Prefix</TableHead>
                                <TableHead className="h-12 px-4 align-middle font-medium text-muted-foreground">Vytvořeno</TableHead>
                                <TableHead className="h-12 px-4 align-middle font-medium text-muted-foreground">Naposledy použito</TableHead>
                                <TableHead className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Akce</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map(key => (
                                <TableRow key={key.id}>
                                    <TableCell className="p-4 align-middle font-medium">{key.name}</TableCell>
                                    <TableCell className="p-4 align-middle font-mono text-xs">{key.keyPrefix}...</TableCell>
                                    <TableCell className="p-4 align-middle text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="p-4 align-middle text-muted-foreground">
                                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="p-4 align-middle text-right">
                                        <ConfirmDialog
                                            trigger={
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            }
                                            title="Smazat API klíč?"
                                            description={`Opravdu chcete smazat klíč "${key.name}"? Aplikace používající tento klíč přestanou fungovat.`}
                                            onConfirm={() => handleDeleteKey(key.id)}
                                            variant="destructive"
                                            actionLabel="Smazat"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                    </CardContent>
                </Card>
            ) : (
                <EmptyState
                    icon={Key}
                    title="Žádné API klíče"
                    description="Vytvořte si API klíč pro přístup k vašim datům z externích aplikací."
                    action={{
                        label: "Generovat klíč",
                        onClick: () => setIsKeyModalOpen(true)
                    }}
                />
            )}
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhooky
                </CardTitle>
                <CardDescription>
                    Nastavte URL adresy, kam budeme posílat notifikace o událostech (např. invoice.paid).
                </CardDescription>
            </div>
            <Button onClick={() => setIsWebhookModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Přidat Endpoint
            </Button>
        </CardHeader>
        <CardContent>
            {webhooks.length > 0 ? (
                <ul className="space-y-3">
                    {webhooks.map(wh => (
                        <li key={wh.id} className="border rounded-lg p-4 flex justify-between items-center bg-card hover:bg-accent/5 transition-colors">
                            <div className="space-y-1">
                                <div className="font-mono text-sm bg-muted inline-block px-2 py-0.5 rounded border">
                                    {wh.url}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Events: {wh.events.join(', ')}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    wh.isActive 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                    {wh.isActive ? 'Aktivní' : 'Neaktivní'}
                                </span>
                                {/* Add delete functionality for webhooks later if API supports it */}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={Webhook}
                    title="Žádné webhooky"
                    description="Zatím nemáte nastavené žádné webhooky pro notifikace."
                    action={{
                        label: "Přidat Endpoint",
                        onClick: () => setIsWebhookModalOpen(true)
                    }}
                />
            )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Vytvořit nový API klíč"
        description="Zadejte název pro identifikaci klíče (např. E-shop, Mobilní aplikace)."
        footer={
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={() => setIsKeyModalOpen(false)}>Zrušit</Button>
                <Button onClick={handleCreateKey} disabled={loading}>
                    {loading ? 'Vytváření...' : 'Vytvořit klíč'}
                </Button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label htmlFor="keyName" className="text-sm font-medium">Název klíče</label>
                <Input 
                    id="keyName" 
                    value={keyName} 
                    onChange={(e) => setKeyName(e.target.value)} 
                    placeholder="Např. Integrace E-shop"
                    autoFocus
                />
            </div>
        </div>
      </Modal>

      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="Přidat Webhook Endpoint"
        description="Zadejte URL adresu, na kterou budeme posílat POST požadavky při událostech."
        footer={
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={() => setIsWebhookModalOpen(false)}>Zrušit</Button>
                <Button onClick={handleCreateWebhook}>
                    Uložit webhook
                </Button>
            </div>
        }
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label htmlFor="webhookUrl" className="text-sm font-medium">Webhook URL</label>
                <Input 
                    id="webhookUrl" 
                    value={webhookUrl} 
                    onChange={(e) => setWebhookUrl(e.target.value)} 
                    placeholder="https://api.example.com/webhooks/vulpi"
                    autoFocus
                />
            </div>
        </div>
      </Modal>
    </div>
  );
}
