import { ReactNode } from 'react';
import { Header } from './Header';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Don't show header on the auth page
  const showHeader = location !== '/auth';
  
  return (
    <>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}