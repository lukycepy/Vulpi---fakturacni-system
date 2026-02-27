'use client';

import { useOrganization } from './providers/organization-provider';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export function OrganizationSwitcher() {
  const { currentOrg, organizations, setCurrentOrg, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Načítání...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentOrg?.id}
        onValueChange={(value) => {
          const org = organizations.find((o) => o.id === value);
          if (org) setCurrentOrg(org);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Vyberte organizaci" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name} ({org.ico})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button asChild size="sm" variant="default">
        <Link href="/organizations/new">
          <Plus className="h-4 w-4 mr-1" />
          Nová
        </Link>
      </Button>
    </div>
  );
}
