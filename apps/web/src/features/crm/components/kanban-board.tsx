
import { DealCard } from './DealCard';

export function KanbanBoard({ stages, onDragStart, onDrop, createNewDeal }: { 
    stages: any[]; 
    onDragStart: (e: any, dealId: string) => void; 
    onDrop: (e: any, stageId: string) => void;
    createNewDeal: () => void;
}) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-8 h-[calc(100vh-300px)]">
            {stages.map(stage => (
                <div 
                    key={stage.id} 
                    className="min-w-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDrop(e, stage.id)}
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-2" style={{ borderColor: stage.color }}>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">{stage.name}</h3>
                        <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-500">
                            {stage.deals.length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto">
                        {stage.deals.map((deal: any) => (
                            <DealCard 
                                key={deal.id} 
                                deal={deal} 
                                onDragStart={onDragStart} 
                            />
                        ))}
                        {stage.order === 1 && (
                            <button onClick={createNewDeal} className="w-full py-2 text-gray-500 hover:bg-gray-200 rounded border border-dashed">
                                + Nový obchod
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
