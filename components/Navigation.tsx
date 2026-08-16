'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Bell, MessageCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import { useEffect } from 'react'; 

interface NavigationProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  views: Record<string, { title: string; icon: React.ReactNode }>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

type PanelType = 'notifications' | 'whatsapp' | 'settings' | null;

export default function Navigation({
  selectedView,
  setSelectedView,
  views,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavigationProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const sideLinks = (
    <>
      <button
        onClick={() => setActivePanel('notifications')}
        className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3"
      >
        <Bell className="w-5 h-5" />
        <span className="text-sm">Notifications</span>
      </button>
      <button
        onClick={() => setActivePanel('whatsapp')}
        className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">WhatsApp Alerts</span>
      </button>
      <button
        onClick={() => setActivePanel('settings')}
        className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition flex items-center gap-3"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm">Settings</span>
      </button>
    </>
  );

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

          <div className="border-t border-slate-600 pt-4 space-y-2">{sideLinks}</div>

          <div className="border-t border-slate-600 pt-4">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition flex items-center gap-3 text-sm disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
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

            <div className="border-t border-slate-600 pt-4 space-y-2">{sideLinks}</div>

            <div className="border-t border-slate-600 mt-4 pt-4">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition flex items-center gap-3 text-sm disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panels */}
      {activePanel === 'notifications' && (
        <SidePanel title="Notifications" onClose={() => setActivePanel(null)}>
          <p className="text-sm text-slate-400">
            No notifications yet. Insights derived from your holdings will
            appear here as your portfolio grows.
          </p>
        </SidePanel>
      )}

      {activePanel === 'whatsapp' && (
        <WhatsAppPanel onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'settings' && (
        <SidePanel title="Settings" onClose={() => setActivePanel(null)}>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-400">Signed in as</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <p className="text-xs text-slate-500">
              Annual income and time horizon are set in the Capital Allocator
              tab.
            </p>
          </div>
        </SidePanel>
      )}
    </>
  );
}

function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-sm h-full glass-dark border-l border-slate-700 p-6 overflow-y-auto animate-slide-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function WhatsAppPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('family_members')
        .update({ phone })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidePanel title="WhatsApp Alerts" onClose={onClose}>
      <p className="text-sm text-slate-400 mb-4">
        Add your WhatsApp number to receive weekly summaries. Sending requires
        a Twilio account connected on the backend (see setup docs).
      </p>
      <label className="text-xs text-slate-400 mb-1 block">
        WhatsApp Number (with country code)
      </label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+919876543210"
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent mb-3"
      />
      {error && <p className="text-sm text-loss mb-3">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || !phone}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved ? 'Saved ✓' : 'Save Number'}
      </button>
    </SidePanel>
  );
}
