'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    router.push('/admin/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="text-center max-w-sm w-full">
          <p className="text-xl mb-4">Access Denied</p>
          <Link href="/admin/login" className="btn-torii w-full py-3">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1">
              ← Back to Nihongo Talk Screen
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">Admin Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm text-[#8a8a8a] hover:text-[#d32f2f] px-3 py-1.5 rounded-lg hover:bg-[#f4c2c2]/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Welcome Message */}
        <div className="card-cultural p-6 mb-6 bg-gradient-to-br from-white to-[#fff5f5]">
          <h2 className="text-lg font-bold text-[#2d2d2d] mb-1">Welcome back!</h2>
          <p className="text-sm text-[#5a5a5a]">Manage your quiz content and categories here.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/host" className="card-cultural p-6 hover:shadow-lg transition-shadow cursor-pointer group border-2 border-[#f59e0b]/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎮
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] group-hover:text-[#f59e0b] transition-colors">Host Multiplayer</h2>
                <p className="text-sm text-[#5a5a5a] mt-1">Create a game room for students to join</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/questions" className="card-cultural p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d32f2f] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] group-hover:text-[#d32f2f] transition-colors">Manage Questions</h2>
                <p className="text-sm text-[#5a5a5a] mt-1">Add, edit, or delete quiz questions</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/categories" className="card-cultural p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📂
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] group-hover:text-[#10b981] transition-colors">Manage Categories</h2>
                <p className="text-sm text-[#5a5a5a] mt-1">Create or edit question categories</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}