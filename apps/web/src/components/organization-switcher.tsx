'use client';

import { useOrganization } from './providers/organization-provider';
import Link from 'next/link';

export function OrganizationSwitcher() {
  const { currentOrg, organizations, setCurrentOrg, isLoading } = useOrganization();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Načítání...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 text-sm bg-white dark:bg-black"
        value={currentOrg?.id || ''}
        onChange={(e) => {
          const org = organizations.find((o) => o.id === e.target.value);
          if (org) setCurrentOrg(org);
        }}
      >
        <option value="" disabled>Vyberte organizaci</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name} ({org.ico})
          </option>
        ))}
      </select>
      <Link
        href="/organizations/new"
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        + Nová
      </Link>
    </div>
  );
}
