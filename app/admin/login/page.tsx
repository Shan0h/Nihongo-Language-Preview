'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'nihongo2026';
    if (password === validPassword) {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin');
    } else {
      setError('Invalid password');
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
              className="w-full border-2 border-[#f4c2c2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d32f2f] transition-colors"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button type="submit" className="btn-torii w-full py-3 text-sm">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}