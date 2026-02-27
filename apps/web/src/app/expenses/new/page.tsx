'use client';

import { useState } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewExpensePage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
      supplierName: '',
      supplierIco: '',
      description: '',
      amount: '',
      issueDate: '',
      category: '',
      vatRate: '21'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setFile(e.target.files[0]);
      }
  };

  const analyzeFile = async () => {
      if (!file) return;
      setAnalyzing(true);
      
      const form = new FormData();
      form.append('file', file);
      
      try {
          const res = await fetch('/api/expenses/analyze', {
              method: 'POST',
              body: form
          });
          const data = await res.json();
          
          setFormData(prev => ({
              ...prev,
              supplierIco: data.supplierIco || prev.supplierIco,
              amount: data.amount ? String(data.amount) : prev.amount,
              issueDate: data.issueDate || prev.issueDate,
              category: data.category || prev.category,
              description: `Nákup - ${data.category || 'Neurčeno'}`
          }));
          toast.success('Analýza dokladu dokončena');
      } catch (e) {
          toast.error('Chyba při analýze souboru');
      } finally {
          setAnalyzing(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentOrg) return;
      setSaving(true);

      try {
        const res = await fetchWithAuth('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                organizationId: currentOrg.id,
                amount: Number(formData.amount),
                vatRate: Number(formData.vatRate)
            })
        });
        
        if (res.ok) {
            toast.success('Výdaj byl úspěšně uložen');
            // Optional: reset form or redirect
            window.location.href = '/expenses/new'; 
        } else {
            toast.error('Chyba při ukládání výdaje');
        }
      } catch (err) {
        toast.error('Neočekávaná chyba při ukládání');
      } finally {
        setSaving(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nový výdaj</h1>

      {/* AI Upload Section */}
      <Card className="mb-8 border-blue-100 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <span>🤖</span> AI Skener
            </CardTitle>
            <CardDescription>
                Nahrajte účtenku nebo fakturu. AI automaticky vyplní údaje.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
             <Input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*,.pdf" 
                className="bg-white dark:bg-gray-800 cursor-pointer" 
             />
             <Button 
                onClick={analyzeFile} 
                disabled={!file || analyzing}
                className="w-full sm:w-auto"
             >
                {analyzing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                {analyzing ? 'Analyzuji...' : 'Analyzovat'}
             </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
          <div className="space-y-2">
              <Label>Popis</Label>
              <Input 
                  type="text" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Např. Kancelářské potřeby"
              />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>IČO Dodavatele</Label>
                  <Input 
                      type="text" 
                      value={formData.supplierIco}
                      onChange={e => setFormData({...formData, supplierIco: e.target.value})}
                      placeholder="00000000"
                  />
              </div>
               <div className="space-y-2">
                  <Label>Dodavatel (Název)</Label>
                  <Input 
                      type="text" 
                      value={formData.supplierName}
                      onChange={e => setFormData({...formData, supplierName: e.target.value})}
                      required
                      placeholder="Např. Alza.cz"
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Částka (CZK)</Label>
                  <Input 
                      type="number" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      required
                      placeholder="0.00"
                  />
              </div>
               <div className="space-y-2">
                  <Label>Datum vystavení</Label>
                  <Input 
                      type="date" 
                      value={formData.issueDate}
                      onChange={e => setFormData({...formData, issueDate: e.target.value})}
                      required
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Kategorie (AI)</Label>
                  <Input 
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="Automaticky doplněno"
                  />
              </div>
               <div className="space-y-2">
                  <Label>DPH (%)</Label>
                  <Select 
                      value={String(formData.vatRate)}
                      onValueChange={(val) => setFormData({...formData, vatRate: val})}
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Vyberte sazbu" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="21">21%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="0">0%</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <Button 
            type="submit" 
            variant="green" 
            className="w-full font-bold mt-6 py-6 text-base"
            disabled={saving}
          >
              {saving ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
              {saving ? 'Ukládám...' : 'Uložit výdaj'}
          </Button>
      </form>
    </div>
  );
}
