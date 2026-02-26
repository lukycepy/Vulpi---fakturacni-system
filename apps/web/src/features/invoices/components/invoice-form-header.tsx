
export function InvoiceFormHeader({ 
    clientId, setClientId, clients, 
    issueDate, setIssueDate, 
    taxableSupplyDate, setTaxableSupplyDate, 
    dueDate, setDueDate 
}: {
    clientId: string; setClientId: (id: string) => void; clients: any[];
    issueDate: string; setIssueDate: (date: string) => void;
    taxableSupplyDate: string; setTaxableSupplyDate: (date: string) => void;
    dueDate: string; setDueDate: (date: string) => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-medium mb-1">Odběratel</label>
             <select 
               value={clientId}
               onChange={e => setClientId(e.target.value)}
               className="w-full border rounded p-2 bg-transparent"
             >
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
             <p className="text-xs text-gray-500 mt-1">Pro demo účely jsou klienti natvrdo</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">Vystaveno</label>
                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full border rounded p-2 bg-transparent" />
             </div>
             <div>
                <label className="block text-sm font-medium mb-1">DUZP</label>
                <input type="date" value={taxableSupplyDate} onChange={e => setTaxableSupplyDate(e.target.value)} className="w-full border rounded p-2 bg-transparent" />
             </div>
             <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Splatnost</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border rounded p-2 bg-transparent" />
             </div>
           </div>
        </div>
    );
}
