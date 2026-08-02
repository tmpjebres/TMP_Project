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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-primary text-white rounded-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
        fixed left-0 top-0 h-full bg-white z-40 flex flex-col
        transition-all duration-300 ease-out
        lg:translate-x-0 w-64
        ${collapsed ? "lg:w-20" : "lg:w-64"}
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          borderRight: "1px solid rgba(221,221,221,0.5)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Tombol collapse (desktop only) */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 items-center justify-center rounded-full bg-white text-neutral-gray hover:text-green-primary z-50"
          style={{ border: "1px solid rgba(221,221,221,0.8)", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>

        {/* Logo */}
        <div
          className="h-16 flex items-center px-5 flex-shrink-0 overflow-hidden"
          style={{ borderBottom: "1px solid rgba(221,221,221,0.5)" }}
        >
          <div className="flex items-center gap-1">
            <img
              src="/logo-surakarta.png"
              alt="Logo Surakarta"
              className="w-11 h-11 object-contain flex-shrink-0"
            />
            <div className={collapsed ? "lg:hidden" : ""}>
              <h1
                className="text-sm font-bold text-neutral-black leading-tight whitespace-nowrap"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Dinas Sosial <br></br> Kota Surakarta
              </h1>
              <p className="text-neutral-gray whitespace-nowrap" style={{ fontSize: 10 }}>
                Sistem Taman Makam Pahlawan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
            <p className={`px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
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
            <p className={`px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
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
              <p className={`px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
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

        {/* Bottom Profile */}
        <div
          className="p-4 bg-white flex-shrink-0 "
          style={{ borderTop: "1px solid rgba(221,221,221,0.5)" }}
        >
          <div className="flex items-center gap-3 hover:bg-green-light p-2 rounded-lg transition-colors">
            <Link
              href={ROUTES["profile"]}
              title="Profil"
              className="flex items-center gap-3 flex-1 min-w-0 "
            >
              <div className="w-9 h-9 bg-green-light rounded-full flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-green-primary" />
              </div>
              <div className={`flex-1 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
                <p className="text-sm font-medium text-neutral-black truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-neutral-gray truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Logout"
              className={`p-1.5 text-neutral-gray hover:text-white hover:bg-green-primary rounded-lg transition-colors flex-shrink-0 ${collapsed ? "lg:hidden" : ""}`}
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