'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function HrDashboard() {
  const { currentOrg } = useOrganization();
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [view, setView] = useState<'employees' | 'payroll'>('employees');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/hr/employees?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setEmployees);
        
        const now = new Date();
        fetch(`/api/hr/payroll?organizationId=${currentOrg.id}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
            .then(res => res.json())
            .then(setPayroll);
    }
  }, [currentOrg]);

  const updateEmployee = async (id: string, data: any) => {
      await fetch(`/api/hr/employees/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      // Refresh
      const res = await fetch(`/api/hr/employees?organizationId=${currentOrg?.id}`);
      setEmployees(await res.json());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">HR & Mzdy</h1>

      <div className="flex gap-4 mb-6">
          <button 
              onClick={() => setView('employees')}
              className={`px-4 py-2 rounded ${view === 'employees' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
          >
              Zaměstnanci
          </button>
          <button 
              onClick={() => setView('payroll')}
              className={`px-4 py-2 rounded ${view === 'payroll' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}
          >
              Přehled mezd (Tento měsíc)
          </button>
      </div>

      {view === 'employees' && (
          <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                      <tr>
                          <th className="p-4">Jméno</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Fixní Plat</th>
                          <th className="p-4">Hodinová Sazba</th>
                          <th className="p-4">Účet (IBAN)</th>
                          <th className="p-4">Akce</th>
                      </tr>
                  </thead>
                  <tbody>
                      {employees.map(emp => (
                          <tr key={emp.id} className="border-b">
                              <td className="p-4 font-medium">{emp.user.name}</td>
                              <td className="p-4 text-sm text-gray-500">{emp.role}</td>
                              <td className="p-4">
                                  <input 
                                      type="number" 
                                      defaultValue={emp.monthlySalary}
                                      onBlur={e => updateEmployee(emp.id, { monthlySalary: Number(e.target.value) })}
                                      className="border rounded w-24 px-2 py-1 text-sm"
                                  /> CZK
                              </td>
                              <td className="p-4">
                                  <input 
                                      type="number" 
                                      defaultValue={emp.hourlyRate}
                                      onBlur={e => updateEmployee(emp.id, { hourlyRate: Number(e.target.value) })}
                                      className="border rounded w-24 px-2 py-1 text-sm"
                                  /> CZK/h
                              </td>
                              <td className="p-4">
                                  <input 
                                      type="text" 
                                      defaultValue={emp.bankAccount}
                                      onBlur={e => updateEmployee(emp.id, { bankAccount: e.target.value })}
                                      className="border rounded w-48 px-2 py-1 text-sm"
                                      placeholder="CZ..."
                                  />
                              </td>
                              <td className="p-4">
                                  <button className="text-blue-600 text-sm hover:underline">Smlouva</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {view === 'payroll' && (
          <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                      <tr>
                          <th className="p-4">Zaměstnanec</th>
                          <th className="p-4">Fixní část</th>
                          <th className="p-4">Odpracováno</th>
                          <th className="p-4">Variabilní část</th>
                          <th className="p-4 font-bold text-right">Celkem k výplatě</th>
                      </tr>
                  </thead>
                  <tbody>
                      {payroll.map(p => (
                          <tr key={p.userId} className="border-b">
                              <td className="p-4 font-medium">
                                  {p.name}
                                  <div className="text-xs text-gray-500">{p.bankAccount}</div>
                              </td>
                              <td className="p-4">{p.fixedSalary} CZK</td>
                              <td className="p-4">{p.hoursWorked} hod</td>
                              <td className="p-4">{p.hourlyPay} CZK</td>
                              <td className="p-4 text-right font-bold text-green-600">{p.totalPay} CZK</td>
                          </tr>
                      ))}
                      {payroll.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Žádná data pro tento měsíc.</td></tr>}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
}
