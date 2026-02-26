'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Organization = {
  id: string;
  name: string;
  ico: string;
  allowedIps?: string[];
  vatPayer?: boolean;
  isOssRegistered?: boolean;
  inboxEmail?: string;
  logoUrl?: string;
};

type OrganizationContextType = {
  currentOrg: Organization | null;
  organizations: Organization[];
  setCurrentOrg: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
  isLoading: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrganizations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
        
        // If currentOrg is not set or not in the new list, pick first
        if (data.length > 0) {
             // Logic to keep current if valid...
             // For now just pick first if none selected
             if (!currentOrg) setCurrentOrg(data[0]);
        }
      } else if (res.status === 401) {
          // Handled by middleware mostly, but if we are here, maybe token expired
          // window.location.href = '/auth/login'; 
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshOrganizations();
  }, []);

  return (
    <OrganizationContext.Provider value={{ currentOrg, organizations, setCurrentOrg, refreshOrganizations, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
