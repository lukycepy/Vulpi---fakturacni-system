'use client';

import { DealCard } from './deal-card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function KanbanBoard({ stages, onDragStart, onDrop, createNewDeal }: { 
    stages: any[]; 
    onDragStart: (e: any, dealId: string) => void; 
    onDrop: (e: any, stageId: string) => void;
    createNewDeal: () => void;
}) {
    const hasDeals = stages.some(stage => stage.deals.length > 0);

    if (!hasDeals) {
        return (
            <EmptyState 
                title="Žádné obchody"
                description="Zatím nemáte žádné obchodní příležitosti. Vytvořte první a začněte prodávat."
                action={{
                    label: "Nový obchod",
                    onClick: createNewDeal
                }}
                icon={Briefcase}
            />
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-8 h-[calc(100vh-300px)]">
            {stages.map(stage => (
                <div 
                    key={stage.id} 
                    className={cn(
                        "min-w-[320px] rounded-xl bg-muted/50 p-4 flex flex-col border border-border/50 transition-colors",
                        "hover:bg-muted/70"
                    )}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDrop(e, stage.id)}
                >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                            <h3 className="font-semibold text-sm uppercase tracking-tight text-foreground">
                                {stage.name}
                            </h3>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {stage.deals.length}
                        </Badge>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                        {stage.deals.map((deal: any) => (
                            <DealCard 
                                key={deal.id} 
                                deal={deal} 
                                onDragStart={onDragStart} 
                            />
                        ))}
                        {stage.order === 1 && (
                            <Button 
                                onClick={createNewDeal} 
                                variant="ghost" 
                                className="w-full border border-dashed border-muted-foreground/20 hover:border-muted-foreground/50 hover:bg-muted text-muted-foreground"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nový obchod
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
