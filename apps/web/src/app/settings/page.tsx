'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { Loader2, Bell, FileText, Plus } from 'lucide-react';

export default function SettingsPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Reminders state
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [firstReminderDays, setFirstReminderDays] = useState(3);
  const [firstReminderText, setFirstReminderText] = useState("Upozornění: Faktura je po splatnosti.");
  const [secondReminderDays, setSecondReminderDays] = useState(7);
  const [secondReminderText, setSecondReminderText] = useState("Důrazné upozornění: Faktura je stále neuhrazena.");

  // Load settings on mount or org change
  useEffect(() => {
    if (!currentOrg) return;

    const loadSettings = async () => {
      setFetching(true);
      try {
        const res = await fetchWithAuth(`/api/organizations/${currentOrg.id}/reminder-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setRemindersEnabled(data.isEnabled ?? false);
            setFirstReminderDays(data.firstReminderDays ?? 3);
            setFirstReminderText(data.firstReminderText ?? "Upozornění: Faktura je po splatnosti.");
            setSecondReminderDays(data.secondReminderDays ?? 7);
            setSecondReminderText(data.secondReminderText ?? "Důrazné upozornění: Faktura je stále neuhrazena.");
          }
        }
      } catch (error) {
        console.error('Failed to load reminder settings:', error);
        toast.error('Nepodařilo se načíst nastavení upomínek');
      } finally {
        setFetching(false);
      }
    };

    loadSettings();
  }, [currentOrg, fetchWithAuth]);

  const handleSaveReminders = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/organizations/${currentOrg.id}/reminder-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: remindersEnabled,
          firstReminderDays,
          firstReminderText,
          secondReminderDays,
          secondReminderText
        })
      });

      if (!res.ok) throw new Error('Failed to save settings');
      
      toast.success("Nastavení upomínek bylo uloženo");
    } catch (error) {
      console.error(error);
      toast.error("Chyba při ukládání nastavení");
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nastavení organizace</h1>
        <p className="text-muted-foreground">
           Správa nastavení pro {currentOrg.name}
        </p>
      </div>

      <Tabs defaultValue="reminders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="reminders">Upomínky</TabsTrigger>
          <TabsTrigger value="recurring">Pravidelné faktury</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Bell className="h-5 w-5 text-primary" />
                 Automatické upomínky
              </CardTitle>
              <CardDescription>
                Nastavte, kdy a jak se mají odesílat upomínky klientům.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fetching ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableReminders" 
                      checked={remindersEnabled}
                      onCheckedChange={setRemindersEnabled}
                    />
                    <Label htmlFor="enableReminders">Povolit automatické upomínky</Label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>1. upomínka (dní po splatnosti)</Label>
                      <Input 
                        type="number" 
                        value={firstReminderDays}
                        onChange={(e) => setFirstReminderDays(Number(e.target.value))}
                        disabled={!remindersEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text upomínky</Label>
                      <Textarea 
                        rows={2} 
                        value={firstReminderText}
                        onChange={(e) => setFirstReminderText(e.target.value)}
                        disabled={!remindersEnabled}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>2. upomínka (dní po splatnosti)</Label>
                      <Input 
                        type="number" 
                        value={secondReminderDays}
                        onChange={(e) => setSecondReminderDays(Number(e.target.value))}
                        disabled={!remindersEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text upomínky</Label>
                      <Textarea 
                        rows={2} 
                        value={secondReminderText}
                        onChange={(e) => setSecondReminderText(e.target.value)}
                        disabled={!remindersEnabled}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveReminders} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Uložit nastavení
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="flex items-center gap-2">
                       <FileText className="h-5 w-5 text-primary" />
                       Šablony pravidelných faktur
                    </CardTitle>
                    <CardDescription>Správa šablon pro automatickou fakturaci.</CardDescription>
                 </div>
                 <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Nová šablona
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
               <EmptyState
                  icon={FileText}
                  title="Zatím nemáte žádné šablony"
                  description="Vytvořte první šablonu pro pravidelnou fakturaci."
                  action={{
                     label: "Vytvořit šablonu",
                     onClick: () => {}
                  }}
               />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
