'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { Users, Banknote, FileText } from 'lucide-react';

export default function HrDashboard() {
  const { currentOrg } = useOrganization();
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [view, setView] = useState<'employees' | 'payroll'>('employees');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/hr/employees?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setEmployees)
            .catch(err => toast.error("Nepodařilo se načíst zaměstnance"));
        
        const now = new Date();
        fetch(`/api/hr/payroll?organizationId=${currentOrg.id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
            .then(res => res.json())
            .then(setPayroll)
            .catch(err => toast.error("Nepodařilo se načíst mzdy"));
    }
  }, [currentOrg]);

  const updateEmployee = async (id: string, data: any) => {
      try {
        const loadingToast = toast.loading("Aktualizuji zaměstnance...");
        await fetch(`/api/hr/employees/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        // Refresh
        const res = await fetch(`/api/hr/employees?organizationId=${currentOrg?.id}`);
        if (!res.ok) throw new Error('Refresh failed');
        setEmployees(await res.json());
        toast.dismiss(loadingToast);
        toast.success("Zaměstnanec aktualizován");
      } catch (e) {
        toast.error("Chyba při aktualizaci zaměstnance");
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">HR & Mzdy</h1>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button 
                variant={view === 'employees' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('employees')}
            >
                <Users className="w-4 h-4 mr-2" />
                Zaměstnanci
            </Button>
            <Button 
                variant={view === 'payroll' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('payroll')}
            >
                <Banknote className="w-4 h-4 mr-2" />
                Přehled mezd
            </Button>
        </div>
      </div>

      {view === 'employees' && (
          <Card>
              <CardHeader>
                  <CardTitle>Seznam zaměstnanců</CardTitle>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                    <EmptyState
                        title="Žádní zaměstnanci"
                        description="Zatím nemáte žádné zaměstnance. Přidejte je v nastavení organizace."
                        icon={Users}
                    />
                ) : (
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Jméno</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Fixní Plat</TableHead>
                              <TableHead>Hodinová Sazba</TableHead>
                              <TableHead>Účet (IBAN)</TableHead>
                              <TableHead>Akce</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {employees.map(emp => (
                              <TableRow key={emp.id}>
                                  <TableCell className="font-medium">{emp.user.name}</TableCell>
                                  <TableCell className="text-muted-foreground">{emp.role}</TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            defaultValue={emp.monthlySalary}
                                            onBlur={e => updateEmployee(emp.id, { monthlySalary: Number(e.target.value) })}
                                            className="w-24 h-8"
                                        />
                                        <span className="text-sm text-muted-foreground">CZK</span>
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            defaultValue={emp.hourlyRate}
                                            onBlur={e => updateEmployee(emp.id, { hourlyRate: Number(e.target.value) })}
                                            className="w-24 h-8"
                                        />
                                        <span className="text-sm text-muted-foreground">CZK/h</span>
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      <Input 
                                          type="text" 
                                          defaultValue={emp.bankAccount}
                                          onBlur={e => updateEmployee(emp.id, { bankAccount: e.target.value })}
                                          className="w-48 h-8"
                                          placeholder="CZ..."
                                      />
                                  </TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="sm" className="text-blue-600">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Smlouva
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                )}
              </CardContent>
          </Card>
      )}

      {view === 'payroll' && (
          <Card>
              <CardHeader>
                  <CardTitle>Přehled mezd (Tento měsíc)</CardTitle>
              </CardHeader>
              <CardContent>
                {payroll.length === 0 ? (
                    <EmptyState
                        title="Žádná data pro tento měsíc"
                        description="Zatím nebyla vypočítána žádná mzda."
                        icon={Banknote}
                    />
                ) : (
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Zaměstnanec</TableHead>
                              <TableHead>Fixní část</TableHead>
                              <TableHead>Odpracováno</TableHead>
                              <TableHead>Variabilní část</TableHead>
                              <TableHead className="text-right">Celkem k výplatě</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {payroll.map(p => (
                              <TableRow key={p.userId}>
                                  <TableCell className="font-medium">
                                      {p.name}
                                      <div className="text-xs text-muted-foreground">{p.bankAccount}</div>
                                  </TableCell>
                                  <TableCell>{p.fixedSalary} CZK</TableCell>
                                  <TableCell>{p.hoursWorked} hod</TableCell>
                                  <TableCell>{p.hourlyPay} CZK</TableCell>
                                  <TableCell className="text-right font-bold text-green-600">{p.totalPay} CZK</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                )}
              </CardContent>
          </Card>
      )}
    </div>
  );
}
