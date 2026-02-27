'use client';

import React from 'react';
import { Card, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Calendar, User, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { Button } from "../../../../components/ui/button";

export function DealCard({ deal, onDragStart, onDelete }: { deal: any; onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void; onDelete: (dealId: string) => void }) {
    return (
        <Card 
            draggable
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, deal.id)}
            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group relative"
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ConfirmDialog
                    trigger={
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    }
                    title="Smazat obchod?"
                    description={`Opravdu chcete smazat obchod "${deal.title}"?`}
                    onConfirm={() => onDelete(deal.id)}
                    variant="destructive"
                    actionLabel="Smazat"
                />
            </div>
            <CardHeader className="p-4 pb-2 space-y-2">
                <CardTitle className="text-base font-semibold leading-none group-hover:text-primary transition-colors">
                    {deal.title}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{deal.client?.name || 'Neznámý klient'}</span>
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {Number(deal.value).toLocaleString('cs-CZ')} Kč
                </span>
                <Badge variant="secondary" className="text-[10px] font-normal gap-1 px-1.5 h-5">
                    <Calendar className="h-3 w-3" />
                    {new Date(deal.createdAt).toLocaleDateString()}
                </Badge>
            </CardFooter>
        </Card>
    );
}
