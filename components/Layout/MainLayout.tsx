import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--bg-secondary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto bg-[var(--bg-secondary)]">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
