'use client';

import React from 'react';
import { LogOut, Settings, Bell, MessageCircle } from 'lucide-react';

interface NavigationProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  views: Record<string, { title: string; icon: React.ReactNode }>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({
  selectedView,
  setSelectedView,
  views,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavigationProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block col-span-1">
        <div className="glass-dark rounded-lg p-4 sticky top-24 space-y-4">
          <nav className="space-y-2">
            {Object.entries(views).map(([key, { title, icon }]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedView(key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                  selectedView === key
                    ? 'bg-invest-accent text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {icon}
                {title}
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-600 pt-4 space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="text-sm">Notifications</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">WhatsApp Alerts</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
          </div>

          <div className="border-t border-slate-600 pt-4">
            <button className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition flex items-center gap-3 text-sm">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-64 h-full glass-dark border-r border-slate-700 p-4 overflow-y-auto">
            <nav className="space-y-2 mb-6">
              {Object.entries(views).map(([key, { title, icon }]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedView(key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                    selectedView === key
                      ? 'bg-invest-accent text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {icon}
                  {title}
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-600 pt-4 space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span className="text-sm">Notifications</span>
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">WhatsApp Alerts</span>
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </button>
            </div>

            <div className="border-t border-slate-600 mt-4 pt-4">
              <button className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition flex items-center gap-3 text-sm">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
