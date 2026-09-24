'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScenicBackground from '@/app/components/ScenicBackground';
import TopLeftHomeButton from '@/app/components/TopLeftHomeButton';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Check securely via server-side Route Handler
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin');
        return;
      }

      // 2. Client-side fallback check (for direct nihongo2026 match)
      const clientFallback = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'nihongo2026';
      if (password === clientFallback) {
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin');
        return;
      }

      setError(data.error || 'Invalid password');
    } catch {
      // Offline fallback
      const clientFallback = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'nihongo2026';
      if (password === clientFallback) {
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin');
      } else {
        setError('Invalid password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fff0f3] dark:bg-[#0c080e] transition-colors duration-500 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden select-none">
      <ScenicBackground />
      <TopLeftHomeButton />

      <div className="relative z-10 card-cultural p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/80 dark:border-white/10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 drop-shadow-sm">🔒</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#4c0519] dark:text-white transition-colors">Admin Login</h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 font-medium">Enter your password to access the admin panel</p>
        </div>

        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            ← Back to Nihongo Education
          </Link>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold mb-1.5 text-stone-700 dark:text-zinc-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={isLoading}
              className="w-full border border-pink-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20 bg-white/85 dark:bg-zinc-900/80 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-500 backdrop-blur-md transition-all font-medium shadow-xs disabled:opacity-50"
            />
            {error && <p className="text-rose-600 dark:text-rose-400 text-xs sm:text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-torii w-full py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-rose-500/25 active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}