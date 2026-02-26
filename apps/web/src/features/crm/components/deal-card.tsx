'use client';

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

export function DealCard({ deal, onDragStart }: { deal: any; onDragStart: (e: any, dealId: string) => void }) {
    return (
        <Card 
            draggable
            onDragStart={e => onDragStart(e, deal.id)}
            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group"
        >
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
