'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, 
    FileText, 
    Receipt, 
    Wallet, 
    BarChart3, 
    Clock, 
    Package, 
    Users, 
    ShoppingCart, 
    Settings,
    LogOut,
    Building2,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null; 

  const isActive = (path: string) => pathname?.startsWith(path);

  const NavItem = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: any }) => {
    const active = isActive(href);
    return (
        <Link
        href={href}
        className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            active
            ? "bg-primary/10 text-primary hover:bg-primary/15" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        >
        <Icon className={cn("mr-3 h-4 w-4 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="flex-1">{children}</span>
        {active && <ChevronRight className="h-3 w-3 text-primary opacity-50" />}
        </Link>
    );
  };

  const isAdmin = user.role === 'SUPERADMIN' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT';
  const isWorker = user.role === 'USER';
  const isClient = user.role === 'CLIENT';

  return (
    <aside className="w-64 bg-card text-card-foreground min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 border-r shadow-sm">
      <div className="p-4 h-16 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                V
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Vulpi</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase px-2 py-0.5 bg-muted rounded border border-border">
            {user.role}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <nav className="space-y-1">
          {/* Dashboard */}
          {!isClient && (
            <NavItem href="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
          )}

          {/* Admin Only Sections */}
          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Finance
              </div>
              <NavItem href="/invoices" icon={FileText}>Faktury</NavItem>
              <NavItem href="/expenses" icon={Receipt}>Náklady</NavItem>
              <NavItem href="/finance/cash" icon={Wallet}>Pokladna</NavItem>
              <NavItem href="/reports" icon={BarChart3}>Reporty</NavItem>
            </>
          )}

          {/* Worker & Admin Sections */}
          {(isAdmin || isWorker) && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Package className="h-3 w-3" />
                Provoz
              </div>
              <NavItem href="/time-tracking" icon={Clock}>Výkazy práce</NavItem>
              <NavItem href="/inventory" icon={Package}>Sklad</NavItem>
              <NavItem href="/crm" icon={Users}>Obchod (CRM)</NavItem>
              <NavItem href="/sales" icon={ShoppingCart}>Prodej</NavItem>
            </>
          )}

          {/* Settings Group */}
          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-3 w-3" />
                Nastavení
              </div>
              <NavItem href="/settings" icon={Settings}>Nastavení</NavItem>
            </>
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 group-hover:border-primary/50 transition-colors">
                 {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden">
                 <div className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">{user.name || 'Uživatel'}</div>
                 <div className="text-xs text-muted-foreground truncate">{user.email}</div>
             </div>
        </div>
        <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Odhlásit se
        </Button>
      </div>
    </aside>
  );
}
