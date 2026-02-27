'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, ExternalLink, Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export default function ContractsPage() {
  const { currentOrg } = useOrganization();
  const [contracts, setContracts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Generator State
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Template Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/contracts?organizationId=${currentOrg.id}`).then(res => res.json()).then(setContracts);
        fetch(`/api/contracts/templates?organizationId=${currentOrg.id}`).then(res => res.json()).then(setTemplates);
        fetch(`/api/clients?organizationId=${currentOrg.id}`).then(res => res.json()).then(setClients);
    }
  }, [currentOrg]);

  const createTemplate = async () => {
      if (!newTemplateName) return;
      
      const content = `<h1>Smlouva o dílo</h1><p>Uzavřená mezi {{client_name}} (IČO: {{client_ico}}) a Dodavatelem.</p><p>Předmět: {{deal_title}}</p><p>Cena: {{deal_value}}</p><p>Datum: {{date}}</p>`;
      
      try {
        await fetch('/api/contracts/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId: currentOrg?.id, name: newTemplateName, content })
        });
        
        const res = await fetch(`/api/contracts/templates?organizationId=${currentOrg?.id}`);
        setTemplates(await res.json());
        setIsTemplateModalOpen(false);
        setNewTemplateName('');
        toast.success("Šablona vytvořena");
      } catch (e) {
          toast.error("Chyba při vytváření šablony");
      }
  };

  const generateContract = async () => {
      if (!selectedTemplate || !selectedClient) {
          toast.error("Vyberte klienta a šablonu");
          return;
      }
      
      setIsGenerating(true);
      try {
        await fetch('/api/contracts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organizationId: currentOrg?.id,
                templateId: selectedTemplate,
                clientId: selectedClient,
            })
        });
        setShowGenerator(false);
        const res = await fetch(`/api/contracts?organizationId=${currentOrg?.id}`);
        setContracts(await res.json());
        toast.success("Smlouva vygenerována");
      } catch (e) {
          toast.error("Chyba při generování smlouvy");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smlouvy</h1>
            <p className="text-muted-foreground">Správa smluv a generování dokumentů</p>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nová šablona
              </Button>
              <Button onClick={() => setShowGenerator(!showGenerator)}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Vygenerovat smlouvu
              </Button>
          </div>
      </div>

      {showGenerator && (
          <Card className="border-l-4 border-l-primary animate-in slide-in-from-top-4">
              <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-lg">Průvodce generováním</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Klient</label>
                          <Select 
                              value={selectedClient} 
                              onValueChange={setSelectedClient}
                          >
                              <SelectTrigger>
                                  <SelectValue placeholder="Vyberte klienta" />
                              </SelectTrigger>
                              <SelectContent>
                                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Šablona</label>
                          <Select 
                              value={selectedTemplate} 
                              onValueChange={setSelectedTemplate}
                          >
                              <SelectTrigger>
                                  <SelectValue placeholder="Vyberte šablonu" />
                              </SelectTrigger>
                              <SelectContent>
                                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={generateContract} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generuji..." : "Vytvořit smlouvu"}
                    </Button>
                  </div>
              </CardContent>
          </Card>
      )}

      <div className="grid gap-4">
          {contracts.map(contract => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex justify-between items-center">
                      <div className="flex items-start gap-4">
                          <div className="bg-muted p-2 rounded-full">
                              <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg">{contract.name}</h3>
                              <div className="text-sm text-muted-foreground mt-1">
                                  Klient: {contract.client.name} • Vytvořeno: {new Date(contract.createdAt).toLocaleDateString()}
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <Badge variant={contract.status === 'SIGNED' ? 'default' : 'secondary'} className={contract.status === 'SIGNED' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                              {contract.status === 'SIGNED' ? 'PODEPSÁNO' : 'ČEKÁ NA PODPIS'}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                              <a 
                                  href={`/portal/contract/${contract.publicToken}`} 
                                  target="_blank"
                                  className="text-primary hover:text-primary/80"
                              >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Otevřít portál
                              </a>
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          ))}
          {contracts.length === 0 && (
              <EmptyState
                  title="Žádné smlouvy"
                  description="Zatím nemáte vytvořené žádné smlouvy. Vygenerujte první pomocí šablony."
                  action={{
                      label: "Vytvořit šablonu",
                      onClick: () => setIsTemplateModalOpen(true)
                  }}
                  icon={FileText}
              />
          )}
      </div>

      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Nová šablona"
        description="Vytvořte novou šablonu pro generování smluv."
        footer={
            <Button onClick={createTemplate}>Vytvořit</Button>
        }
      >
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Název šablony</label>
                  <Input 
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="např. Smlouva o dílo 2024"
                  />
              </div>
          </div>
      </Modal>
    </div>
  );
}