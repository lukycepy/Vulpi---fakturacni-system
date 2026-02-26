
import { InvoiceItem } from '../types';

export function InvoiceItemsTable({ items, setItems }: { items: InvoiceItem[], setItems: (items: InvoiceItem[]) => void }) {
    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit: 'ks', unitPrice: 0, vatRate: 21 }]);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => {
            const price = item.quantity * item.unitPrice;
            const vat = price * (item.vatRate / 100);
            return acc + price + vat;
        }, 0);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="font-semibold mb-4">Položky</h2>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1">
                            <input 
                                placeholder="Popis položky"
                                value={item.description}
                                onChange={e => updateItem(idx, 'description', e.target.value)}
                                className="w-full border rounded p-2 bg-transparent"
                                required
                            />
                        </div>
                        <div className="w-20">
                            <input 
                                type="number"
                                placeholder="Mn."
                                value={item.quantity}
                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                className="w-full border rounded p-2 bg-transparent"
                                min="0"
                            />
                        </div>
                        <div className="w-20">
                            <input 
                                placeholder="Jedn."
                                value={item.unit}
                                onChange={e => updateItem(idx, 'unit', e.target.value)}
                                className="w-full border rounded p-2 bg-transparent"
                            />
                        </div>
                        <div className="w-24">
                            <input 
                                type="number"
                                placeholder="Cena"
                                value={item.unitPrice}
                                onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                                className="w-full border rounded p-2 bg-transparent"
                                min="0"
                            />
                        </div>
                        <div className="w-20">
                            <select 
                                value={item.vatRate}
                                onChange={e => updateItem(idx, 'vatRate', e.target.value)}
                                className="w-full border rounded p-2 bg-transparent"
                            >
                                <option value="21">21%</option>
                                <option value="12">12%</option>
                                <option value="0">0%</option>
                            </select>
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:text-red-700">×</button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="mt-4 text-blue-600 hover:underline text-sm">+ Přidat položku</button>
            
            <div className="mt-8 border-t pt-4 flex justify-end">
                <div className="text-right">
                    <div className="text-sm text-gray-500">Celkem s DPH</div>
                    <div className="text-2xl font-bold">{calculateTotal().toFixed(2)} CZK</div>
                </div>
            </div>
        </div>
    );
}
