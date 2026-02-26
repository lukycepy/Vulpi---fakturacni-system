
import { StockTable } from './stock-table';

export function WarehouseList({ warehouses, createWarehouse, startAudit }: {
    warehouses: any[];
    createWarehouse: () => void;
    startAudit: (warehouseId: string) => void;
}) {
    return (
        <div>
            <div className="flex justify-end mb-4 gap-2">
                <button onClick={createWarehouse} className="bg-blue-600 text-white px-4 py-2 rounded">+ Nový sklad</button>
            </div>

            <div className="grid gap-6">
                {warehouses.map(wh => (
                    <div key={wh.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{wh.name}</h2>
                            <button 
                                onClick={() => startAudit(wh.id)}
                                className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200"
                            >
                                Zahájit inventuru
                            </button>
                        </div>
                        
                        <StockTable stocks={wh.stocks} />
                    </div>
                ))}
            </div>
        </div>
    );
}
