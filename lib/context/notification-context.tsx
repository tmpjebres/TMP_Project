'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { NotificationItem, NotifType, SecurityAlert } from '@/types';
import { useAuth } from '@/lib/context/auth-context';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/features/notifikasi/api';
import {
  fetchSecurityAlerts,
  markAllSecurityAlertsRead,
  markSecurityAlertRead,
} from '@/features/notifikasi/security-api';

interface NotificationContextType {
  items: NotificationItem[];
  securityAlerts: SecurityAlert[];
  loading: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (jadwalTamuId: string, notifType: NotifType) => Promise<void>;
  markAllRead: () => Promise<void>;
  markSecurityRead: (id: string) => Promise<void>;
  markAllSecurityRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isMaster } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSecurityAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const jadwalPromise = fetchNotifications(user.id);
    const securityPromise = isMaster ? fetchSecurityAlerts() : Promise.resolve({ data: [] as SecurityAlert[] });

    const [jadwalResult, securityResult] = await Promise.all([jadwalPromise, securityPromise]);
    setItems(jadwalResult.data);
    setSecurityAlerts(securityResult.data);
    setLoading(false);
  }, [user, isMaster]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = useCallback(
    async (jadwalTamuId: string, notifType: NotifType) => {
      if (!user) return;
      setItems((prev) =>
        prev.map((i) => (i.jadwalTamuId === jadwalTamuId && i.notifType === notifType ? { ...i, isRead: true } : i))
      );
      await markNotificationRead(jadwalTamuId, notifType, user.id);
    },
    [user]
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const snapshot = items;
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    await markAllNotificationsRead(snapshot, user.id);
  }, [user, items]);

  const markSecurityRead = useCallback(
    async (id: string) => {
      if (!user) return;
      setSecurityAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
      await markSecurityAlertRead(id, user.id);
    },
    [user]
  );

  const markAllSecurityRead = useCallback(async () => {
    if (!user) return;
    const unreadIds = securityAlerts.filter((a) => !a.isRead).map((a) => a.id);
    setSecurityAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    await markAllSecurityAlertsRead(unreadIds, user.id);
  }, [user, securityAlerts]);

  const unreadCount = useMemo(() => {
    const jadwalUnread = items.filter((i) => !i.isRead).length;
    const securityUnread = securityAlerts.filter((a) => !a.isRead).length;
    return jadwalUnread + securityUnread;
  }, [items, securityAlerts]);

  return (
    <NotificationContext.Provider
      value={{
        items,
        securityAlerts,
        loading,
        unreadCount,
        refresh,
        markRead,
        markAllRead,
        markSecurityRead,
        markAllSecurityRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
