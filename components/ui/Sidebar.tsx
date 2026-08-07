"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Database,
  LogOut,
  Plus,
  List,
  User,
  Menu,
  X,
  Grid3x3,
  ChevronLeft,
  CalendarDays,
  Bell,
} from "lucide-react";
import { Page } from "@/types";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/lib/context/auth-context";
import { useSidebar } from "@/lib/context/sidebar-context";
import { useNotifications } from "@/lib/context/notification-context";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isMaster } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();

  const isActive = (page: Page, also: Page[] = []) =>
    [page, ...also].some((p) => pathname === ROUTES[p]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-primary dark:bg-dark-brand-secondary text-white rounded-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
        fixed left-0 top-0 h-full bg-surface z-40 flex flex-col
        transition-all duration-300 ease-out
        lg:translate-x-0 w-64
        ${collapsed ? "lg:w-20" : "lg:w-64"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          borderRight: "1px solid var(--border-subtle)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 items-center justify-center rounded-full bg-surface text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent z-50"
          style={{ border: "1px solid var(--border-subtle)", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>

        <div
          className="h-16 flex items-center px-5 flex-shrink-0 overflow-hidden"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-1">
            <img
              src="/logo-surakarta.png"
              alt="Logo Surakarta"
              className="w-11 h-11 object-contain flex-shrink-0"
            />
            <div className={collapsed ? "lg:hidden" : ""}>
              <h1
                className="text-sm font-bold text-text-primary leading-tight whitespace-nowrap"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Dinas Sosial <br></br> Kota Surakarta
              </h1>
              <p className="text-neutral-gray dark:text-dark-text-secondary whitespace-nowrap" style={{ fontSize: 10 }}>
                Sistem Taman Makam Pahlawan
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto overflow-x-hidden flex-1">
          {isMaster && (
            <Link
              href={ROUTES["dashboard"]}
              onClick={closeMobileMenu}
              title="Dashboard"
              className={`nav-item ${isActive("dashboard") ? "active" : ""}`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Dashboard</span>
            </Link>
          )}

          <Link
            href={ROUTES["notifikasi"]}
            onClick={closeMobileMenu}
            title="Notifikasi"
            className={`nav-item relative ${isActive("notifikasi") ? "active" : ""}`}
          >
            <span className="relative flex-shrink-0">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-status-danger text-white text-[9px] font-bold leading-none"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className={collapsed ? "lg:hidden" : ""}>Notifikasi</span>
          </Link>

          <div className="mt-6">
            <p className={`px-4 text-xs font-semibold text-neutral-gray dark:text-dark-text-secondary uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
              Buku Tamu
            </p>
            <Link
              href={ROUTES["input-tamu"]}
              onClick={closeMobileMenu}
              title="Input Tamu"
              className={`nav-item ${isActive("input-tamu", ["tamu-umum", "tamu-rombongan"]) ? "active" : ""}`}
            >
              <Plus size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Input Tamu</span>
            </Link>
            <Link
              href={ROUTES["daftar-tamu"]}
              onClick={closeMobileMenu}
              title="Daftar Tamu"
              className={`nav-item ${isActive("daftar-tamu") ? "active" : ""}`}
            >
              <List size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Daftar Tamu</span>
            </Link>
            <Link
              href={ROUTES["jadwal-tamu"]}
              onClick={closeMobileMenu}
              title="Jadwal Tamu"
              className={`nav-item ${isActive("jadwal-tamu") ? "active" : ""}`}
            >
              <CalendarDays size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Jadwal Tamu</span>
            </Link>
          </div>

          <div className="mt-6">
            <p className={`px-4 text-xs font-semibold text-neutral-gray dark:text-dark-text-secondary uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
              Database Makam
            </p>
            <Link
              href={ROUTES["daftar-blok"]}
              onClick={closeMobileMenu}
              title="Blok Makam"
              className={`nav-item ${isActive("daftar-blok") ? "active" : ""}`}
            >
              <Grid3x3 size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Blok Makam</span>
            </Link>
            <Link
              href={ROUTES["daftar-makam"]}
              onClick={closeMobileMenu}
              title="Daftar Makam"
              className={`nav-item ${isActive("daftar-makam") ? "active" : ""}`}
            >
              <Database size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>Daftar Makam</span>
            </Link>
          </div>

          {isMaster && (
            <div className="mt-6">
              <p className={`px-4 text-xs font-semibold text-neutral-gray dark:text-dark-text-secondary uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
                Sistem
              </p>
              <Link
                href={ROUTES["user-management"]}
                onClick={closeMobileMenu}
                title="User Management"
                className={`nav-item ${isActive("user-management") ? "active" : ""}`}
              >
                <Users size={18} className="flex-shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>User Management</span>
              </Link>
            </div>
          )}
        </nav>

        <div
          className="p-4 bg-surface flex-shrink-0 space-y-1"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <ThemeToggle showLabel={!collapsed} />
          <div className="flex items-center gap-3 hover:bg-green-light dark:hover:bg-dark-surface-hover p-2 rounded-lg transition-colors">
            <Link
              href={ROUTES["profile"]}
              title="Profil"
              className="flex items-center gap-3 flex-1 min-w-0 "
            >
              <div className="w-9 h-9 bg-green-light dark:bg-dark-brand-light rounded-full flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-green-primary dark:text-dark-brand-accent" />
              </div>
              <div className={`flex-1 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-neutral-gray dark:text-dark-text-secondary truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Logout"
              className={`p-1.5 text-neutral-gray dark:text-dark-text-secondary hover:text-white hover:bg-green-primary dark:hover:bg-dark-brand-secondary rounded-lg transition-colors flex-shrink-0 ${collapsed ? "lg:hidden" : ""}`}
            >
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}