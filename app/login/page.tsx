'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push('/');
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage(
          'Account created. If email confirmation is enabled on your Supabase project, check your inbox before signing in.'
        );
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-invest-accent rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold">Wealth Manager</h1>
          <p className="text-sm text-slate-400">Your personal AI investment analyst</p>
        </div>

        <div className="glass-dark rounded-lg p-6">
          <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'signin' ? 'bg-invest-accent text-white' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                mode === 'signup' ? 'bg-invest-accent text-white' : 'text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-invest-accent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-loss bg-red-900/20 border border-red-800 rounded p-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-gain bg-green-900/20 border border-green-800 rounded p-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-invest-accent text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Your portfolio data is private to your account and stored in your own
          Supabase project.
        </p>
      </div>
    </div>
  );
}
