"use client";

import { useState } from "react";
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
import { useAuth } from "@/lib/context/auth-context";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isMaster } = useAuth();

  const navigate = (page: Page) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

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
            <div >
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
          <button
            onClick={() => navigate("dashboard")}
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Buku Tamu
            </p>
            <button
              onClick={() => navigate("input-tamu")}
              className={`nav-item ${["input-tamu", "tamu-umum", "tamu-rombongan"].includes(currentPage) ? "active" : ""}`}
            >
              <Plus size={18} />
              <span>Input Tamu</span>
            </button>
            <button
              onClick={() => navigate("daftar-tamu")}
              className={`nav-item ${currentPage === "daftar-tamu" ? "active" : ""}`}
            >
              <List size={18} />
              <span>Daftar Tamu</span>
            </button>
          </div>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Database Makam
            </p>
            <button
              onClick={() => navigate("daftar-blok")}
              className={`nav-item ${currentPage === "daftar-blok" ? "active" : ""}`}
            >
              <Grid3x3 size={18} />
              <span>Blok Makam</span>
            </button>
            <button
              onClick={() => navigate("daftar-makam")}
              className={`nav-item ${currentPage === "daftar-makam" ? "active" : ""}`}
            >
              <Database size={18} />
              <span>Daftar Makam</span>
            </button>
          </div>

          <div className="mt-6">
            <p className="px-4 text-xs font-semibold text-neutral-gray uppercase tracking-wider mb-2">
              Sistem
            </p>
            {isMaster && (
              <button
                onClick={() => navigate("user-management")}
                className={`nav-item ${currentPage === "user-management" ? "active" : ""}`}
              >
                <Users size={18} />
                <span>User Management</span>
              </button>
            )}
            <button
              onClick={() => navigate("profile")}
              className={`nav-item ${currentPage === "profile" ? "active" : ""}`}
            >
              <BookUser size={18} />
              <span>Profil</span>
            </button>
          </div>
        </nav>

        {/* Bottom Profile */}
        <div
          className="p-4 bg-white flex-shrink-0"
          style={{ borderTop: "1px solid rgba(221,221,221,0.5)" }}
        >
          <div className="flex items-center gap-3">
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
            <button
              onClick={logout}
              title="Logout"
              className="p-2 hover:bg-neutral-light-gray rounded-lg transition-colors"
            >
              <LogOut size={16} className="text-neutral-gray" />
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
