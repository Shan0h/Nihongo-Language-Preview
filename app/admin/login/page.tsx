'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
      <div className="card-cultural p-6 sm:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#2d2d2d]">Admin Login</h1>
          <p className="text-sm text-[#8a8a8a]">Enter your password to access the admin panel</p>
        </div>

        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f]">
            ← Back to Nihongo Education
          </Link>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#5a5a5a]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={isLoading}
              className="w-full border-2 border-[#f4c2c2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d32f2f] transition-colors disabled:opacity-50"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-torii w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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