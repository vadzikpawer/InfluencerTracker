import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageContainer({ children, title, subtitle, action }: PageContainerProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-black">
      <Header />
      
      <main className="flex-grow p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {(title || action) && (
            <div className="mb-6 flex justify-between items-center">
              <div>
                {title && <h1 className="text-2xl font-bold font-sf-pro mb-1">{title}</h1>}
                {subtitle && <p className="text-neutral-700/70 dark:text-neutral-300/70 text-sm">{subtitle}</p>}
              </div>
              
              {action && <div>{action}</div>}
            </div>
          )}
          
          {children}
        </div>
      </main>
      
      {user && <MobileNav />}
    </div>
  );
}
