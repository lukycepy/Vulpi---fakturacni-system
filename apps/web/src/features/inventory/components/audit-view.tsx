
export function AuditView({ auditItems, setAuditItems, setView, handleSubmitAudit }: {
    auditItems: any[];
    setAuditItems: (items: any[]) => void;
    setView: (view: 'overview' | 'audit') => void;
    handleSubmitAudit: () => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Probíhá inventura</h2>
            <div className="overflow-x-auto mb-6">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3">Produkt</th>
                            <th className="p-3">Očekáváno</th>
                            <th className="p-3">Skutečnost</th>
                            <th className="p-3">Rozdíl</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditItems.map((item, idx) => (
                            <tr key={item.productId} className="border-b">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-gray-500">{item.expectedQty}</td>
                                <td className="p-3">
                                    <input 
                                        type="number" 
                                        value={item.actualQty}
                                        onChange={e => {
                                            const newItems = [...auditItems];
                                            newItems[idx].actualQty = Number(e.target.value);
                                            setAuditItems(newItems);
                                        }}
                                        className="border rounded w-20 px-2 py-1"
                                    />
                                </td>
                                <td className={`p-3 font-bold ${item.actualQty - item.expectedQty < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {item.actualQty - item.expectedQty > 0 ? '+' : ''}{item.actualQty - item.expectedQty}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end gap-4">
                <button onClick={() => setView('overview')} className="text-gray-500 hover:underline">Zrušit</button>
                <button onClick={handleSubmitAudit} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Dokončit inventuru</button>
            </div>
        </div>
    );
}
