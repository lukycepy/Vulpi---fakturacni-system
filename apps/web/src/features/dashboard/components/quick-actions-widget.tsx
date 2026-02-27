'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileText, Zap } from "lucide-react";
import Link from 'next/link';

export default function QuickActionsWidget() {
    return (
        <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Rychlé akce
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-2">
                <Button asChild className="w-full justify-start h-12" variant="outline">
                    <Link href="/invoices/new">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mr-3">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium">Nová faktura</span>
                            <span className="text-xs text-muted-foreground font-normal">Vystavit fakturu klientovi</span>
                        </div>
                    </Link>
                </Button>
                
                <Button asChild className="w-full justify-start h-12" variant="outline">
                    <Link href="/crm">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded mr-3">
                            <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium">Nový klient</span>
                            <span className="text-xs text-muted-foreground font-normal">Přidat kontakt do CRM</span>
                        </div>
                    </Link>
                </Button>

                 <Button asChild className="w-full justify-start h-12" variant="outline">
                    <Link href="/expenses/new">
                        <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded mr-3">
                            <Plus className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-medium">Nový výdaj</span>
                            <span className="text-xs text-muted-foreground font-normal">Zaevidovat účtenku</span>
                        </div>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
