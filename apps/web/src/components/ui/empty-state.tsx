'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, PackageOpen } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

export function EmptyState({ 
    title = "Zatím tu nic není", 
    description = "Vypadá to, že v této sekci zatím nejsou žádná data.", 
    icon: Icon = PackageOpen,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-lg bg-muted/30", className)}>
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            
            {action && (
                action.href ? (
                    <Button asChild>
                        <Link href={action.href}>
                            {action.label}
                        </Link>
                    </Button>
                ) : (
                    <Button onClick={action.onClick}>
                        {action.label}
                    </Button>
                )
            )}
        </div>
    );
}
