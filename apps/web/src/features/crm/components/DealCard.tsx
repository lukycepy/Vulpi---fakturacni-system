
export function DealCard({ deal, onDragStart }: { deal: any; onDragStart: (e: any, dealId: string) => void }) {
    return (
        <div 
            draggable
            onDragStart={e => onDragStart(e, deal.id)}
            className="bg-white dark:bg-gray-700 p-4 rounded shadow cursor-grab active:cursor-grabbing hover:shadow-md transition"
        >
            <div className="font-bold mb-1">{deal.title}</div>
            <div className="text-sm text-gray-500 mb-2">{deal.client?.name || 'Neznámý klient'}</div>
            <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-blue-600">
                    {Number(deal.value).toFixed(0)} CZK
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    {new Date(deal.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
