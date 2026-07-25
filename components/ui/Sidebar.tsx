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
  Flag,
  User,
  Menu,
  X,
  BookUser,
  Grid3x3,
} from "lucide-react";
import { Page } from "@/types";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/lib/context/auth-context";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isMaster } = useAuth();
  const pathname = usePathname();

  // Halaman aktif dibaca dari URL. `also` menandai sub-halaman yang ikut
  // menyalakan satu item nav (mis. form tamu umum/rombongan di bawah Input Tamu).
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
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:w-64 w-64
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          borderRight: "1px solid rgba(221,221,221,0.5)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(221,221,221,0.5)" }}
        >
          <div className="flex items-center gap-1">
            <img
              src="/logo-surakarta.png"
              alt="Logo Surakarta"
              className="w-11 h-11 object-contain"
            />
            <div>
              <h1
                className="text-sm font-bold text-neutral-black leading-tight"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Dinas Sosial <br></br> Kota Surakarta
              </h1>
              <p className="text-neutral-gray" style={{ fontSize: 10 }}>
                Sistem Taman Makam Pahlawan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          <Link
            href={ROUTES["dashboard"]}
            onClick={closeMobileMenu}
            className={`nav-item ${isActive("dashboard") ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Buku Tamu
            </p>
            <Link
              href={ROUTES["input-tamu"]}
              onClick={closeMobileMenu}
              className={`nav-item ${isActive("input-tamu", ["tamu-umum", "tamu-rombongan"]) ? "active" : ""}`}
            >
              <Plus size={18} />
              <span>Input Tamu</span>
            </Link>
            <Link
              href={ROUTES["daftar-tamu"]}
              onClick={closeMobileMenu}
              className={`nav-item ${isActive("daftar-tamu") ? "active" : ""}`}
            >
              <List size={18} />
              <span>Daftar Tamu</span>
            </Link>
          </div>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Database Makam
            </p>
            <Link
              href={ROUTES["daftar-blok"]}
              onClick={closeMobileMenu}
              className={`nav-item ${isActive("daftar-blok") ? "active" : ""}`}
            >
              <Grid3x3 size={18} />
              <span>Blok Makam</span>
            </Link>
            <Link
              href={ROUTES["daftar-makam"]}
              onClick={closeMobileMenu}
              className={`nav-item ${isActive("daftar-makam") ? "active" : ""}`}
            >
              <Database size={18} />
              <span>Daftar Makam</span>
            </Link>
          </div>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Sistem
            </p>
            {isMaster && (
              <Link
                href={ROUTES["user-management"]}
                onClick={closeMobileMenu}
                className={`nav-item ${isActive("user-management") ? "active" : ""}`}
              >
                <Users size={18} />
                <span>User Management</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Bottom Profile */}
        <div
          className="p-4 bg-white flex-shrink-0 "
          style={{ borderTop: "1px solid rgba(221,221,221,0.5)" }}
        >
          <div className="flex items-center gap-3 hover:bg-green-light p-2 rounded-lg transition-colors">
            <Link
              href={ROUTES["profile"]}
              className="flex items-center gap-3 flex-1 min-w-0 "
            >
              <div className="w-9 h-9 bg-green-light rounded-full flex items-center justify-center">
                <User size={18} className="text-green-primary" />
              </div>
              <div className="flex-1 min-w-0">
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
              className="p-1.5 text-neutral-gray hover:text-white hover:bg-green-primary rounded-lg transition-colors"
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
