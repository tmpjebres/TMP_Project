'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

const STORAGE_KEY = 'sidebar-collapsed';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Baca preferensi tersimpan saat mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar harus dipakai di dalam SidebarProvider');
  return ctx;
}