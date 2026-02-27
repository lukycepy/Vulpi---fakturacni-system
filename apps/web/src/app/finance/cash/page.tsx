'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ArrowUpRight, ArrowDownLeft, FileText, Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CashDeskPage() {
  const { currentOrg } = useOrganization();
  const [cashDesks, setCashDesks] = useState<any[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<any>(null);
  const [newTransaction, setNewTransaction] = useState({ type: 'EXPENSE', amount: 0, description: '' });
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeskName, setNewDeskName] = useState('');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/cash-desks?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(data => {
                setCashDesks(data);
                if (data.length > 0) setSelectedDesk(data[0]);
            });
    }
  }, [currentOrg]);

  const createDesk = async () => {
      if (!newDeskName || !currentOrg) return;
      
      try {
        await fetch('/api/cash-desks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId: currentOrg.id, name: newDeskName, currency: 'CZK' })
        });
        
        const res = await fetch(`/api/cash-desks?organizationId=${currentOrg.id}`);
        setCashDesks(await res.json());
        setIsCreateModalOpen(false);
        setNewDeskName('');
        toast.success("Pokladna vytvořena");
      } catch (e) {
          toast.error("Chyba při vytváření pokladny");
      }
  };

  const submitTransaction = async () => {
      if (!selectedDesk || !newTransaction.amount || !newTransaction.description) {
          toast.error("Vyplňte všechna pole");
          return;
      }
      
      try {
          await fetch(`/api/cash-desks/${selectedDesk.id}/transactions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...newTransaction,
                  transactionDate: new Date().toISOString()
              })
          });
          
          setNewTransaction({ type: 'EXPENSE', amount: 0, description: '' });
          
          const res = await fetch(`/api/cash-desks/${selectedDesk.id}`);
          const updated = await res.json();
          setSelectedDesk(updated);
          setCashDesks(prev => prev.map(d => d.id === updated.id ? updated : d));
          
          toast.success("Transakce uložena");
      } catch (e) {
          toast.error('Chyba: ' + e);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pokladna</h1>
            <p className="text-muted-foreground">Správa hotovosti a pokladních knih</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nová pokladna
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cashDesks.map(desk => (
              <div 
                  key={desk.id} 
                  onClick={() => setSelectedDesk(desk)}
                  className={cn(
                      "p-6 rounded-lg shadow-sm cursor-pointer border-2 transition-all hover:shadow-md",
                      selectedDesk?.id === desk.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent bg-card hover:border-primary/20'
                  )}
              >
                  <div className="flex items-center gap-3 mb-2">
                      <Wallet className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-bold text-lg">{desk.name}</h3>
                  </div>
                  <div className={cn(
                      "text-2xl font-bold font-mono",
                      Number(desk.currentBalance) < 0 ? 'text-destructive' : 'text-green-600'
                  )}>
                      {Number(desk.currentBalance).toFixed(2)} {desk.currency}
                  </div>
              </div>
          ))}
      </div>

      {selectedDesk && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transaction Form */}
              <div className="lg:col-span-1 bg-card p-6 rounded-lg shadow-sm border h-fit space-y-4">
                  <h3 className="font-bold text-lg">Nová transakce</h3>
                  
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-sm font-medium">Typ transakce</label>
                          <div className="grid grid-cols-2 gap-2">
                              <Button 
                                  variant={newTransaction.type === 'EXPENSE' ? 'destructive' : 'outline'}
                                  onClick={() => setNewTransaction({...newTransaction, type: 'EXPENSE'})}
                                  className="w-full"
                              >
                                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                                  Výdaj
                              </Button>
                              <Button 
                                  variant={newTransaction.type === 'INCOME' ? 'default' : 'outline'}
                                  onClick={() => setNewTransaction({...newTransaction, type: 'INCOME'})}
                                  className={cn("w-full", newTransaction.type === 'INCOME' && "bg-green-600 hover:bg-green-700")}
                              >
                                  <ArrowUpRight className="w-4 h-4 mr-2" />
                                  Příjem
                              </Button>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium">Popis</label>
                          <Input 
                              value={newTransaction.description}
                              onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                              placeholder="Nákup kancelářských potřeb"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-sm font-medium">Částka</label>
                          <Input 
                              type="number" 
                              value={newTransaction.amount}
                              onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                              placeholder="0.00"
                          />
                      </div>

                      <ConfirmDialog
                        trigger={
                            <Button 
                                className={cn(
                                    "w-full font-bold mt-4",
                                    newTransaction.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'
                                )}
                            >
                                {newTransaction.type === 'INCOME' ? 'Přijmout hotovost' : 'Vydat hotovost'}
                            </Button>
                        }
                        title={newTransaction.type === 'INCOME' ? "Potvrdit příjem?" : "Potvrdit výdaj?"}
                        description={`Opravdu chcete zaúčtovat ${newTransaction.type === 'INCOME' ? 'příjem' : 'výdaj'} ve výši ${newTransaction.amount} Kč?`}
                        onConfirm={submitTransaction}
                        actionLabel="Potvrdit"
                        variant={newTransaction.type === 'EXPENSE' ? "destructive" : "default"}
                      />
                  </div>
              </div>

              {/* History */}
              <Card className="lg:col-span-2 border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="p-4 border-b bg-muted/30">
                      <CardTitle className="font-bold text-base">Historie transakcí</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Popis</TableHead>
                                <TableHead className="text-right">Příjem</TableHead>
                                <TableHead className="text-right">Výdaj</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedDesk.transactions.map((tx: any) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(tx.transactionDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{tx.description}</TableCell>
                                    <TableCell className="text-right text-green-600 font-bold font-mono">
                                        {tx.type === 'INCOME' ? `+${tx.amount}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-bold font-mono">
                                        {tx.type === 'EXPENSE' ? `-${tx.amount}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/api/cash-desks/transactions/${tx.id}/pdf`} target="_blank">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Doklad
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
                  {selectedDesk.transactions.length === 0 && (
                      <div className="p-6">
                        <EmptyState
                            title="Žádné transakce"
                            description="Zatím nebyly provedeny žádné transakce."
                            icon={Receipt}
                        />
                      </div>
                  )}
                  </CardContent>
              </Card>
          </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nová pokladna"
        description="Vytvořte novou pokladní knihu pro evidenci hotovosti."
        footer={
            <Button onClick={createDesk}>Vytvořit</Button>
        }
      >
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label className="text-sm font-medium">Název</Label>
                  <Input 
                      value={newDeskName}
                      onChange={e => setNewDeskName(e.target.value)}
                      placeholder="např. Hlavní CZK"
                  />
              </div>
          </div>
      </Modal>
    </div>
  );
}
