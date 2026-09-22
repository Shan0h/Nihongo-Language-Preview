'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CertificateModal from '@/app/components/CertificateModal';
import QrAccessModal from '@/app/components/QrAccessModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] dark:bg-[#0c080e] p-4 transition-colors">
        <div className="text-center max-w-sm w-full p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 shadow-xl">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-xl font-bold mb-2 text-stone-900 dark:text-white">Access Denied</p>
          <p className="text-xs text-stone-500 mb-6">Please log in to access the Admin Dashboard.</p>
          <Link href="/admin/login" className="btn-torii w-full py-3 inline-block font-bold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0c080e] p-4 sm:p-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1 font-medium transition-colors">
              ← Back to Nihongo Education
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d] dark:text-white">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Certificate Preview Button */}
            <button
              onClick={() => setShowCertModal(true)}
              className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>📜</span>
              <span>Certificate Preview</span>
            </button>

            {/* Quick QR Projector Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>📱</span>
              <span>QR Code</span>
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="text-sm text-[#8a8a8a] hover:text-[#d32f2f] px-3 py-1.5 rounded-lg hover:bg-[#f4c2c2]/20 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="card-cultural p-6 mb-6 bg-gradient-to-br from-white to-[#fff5f5] dark:from-stone-900 dark:to-stone-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#2d2d2d] dark:text-white mb-1">Welcome back, Admin! 🌸</h2>
              <p className="text-sm text-[#5a5a5a] dark:text-stone-400">
                Manage your quiz content, live multiplayer arenas, and student achievement certificates.
              </p>
            </div>
            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 self-start sm:self-center shrink-0">
              Course: UHB10802
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1. Certificate Studio & Preview Card */}
          <div className="card-cultural p-6 hover:shadow-xl transition-all border-2 border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-white to-[#fff8f8] dark:from-stone-900 dark:to-stone-950 relative overflow-hidden flex flex-col justify-between group">
            <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200">
              UHB10802 Official
            </span>
            <div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                  📜
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#c5221f] transition-colors leading-tight">
                    Certificate Studio
                  </h2>
                  <p className="text-sm text-[#5a5a5a] dark:text-stone-400 mt-1">
                    Preview, customize student names, and download official Japanese achievement certificates in PNG or PDF
                  </p>
                </div>
              </div>
            </div>

            {/* Card Buttons */}
            <div className="mt-4 pt-3 border-t border-rose-100/80 dark:border-white/10 flex items-center gap-2">
              <button
                onClick={() => setShowCertModal(true)}
                className="flex-1 py-2 px-3 bg-[#c5221f] hover:bg-[#a51d1a] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🌸</span>
                <span>Quick Preview</span>
              </button>
              <Link
                href="/certificate-preview"
                className="py-2 px-3 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold rounded-xl border border-stone-200 dark:border-white/10 shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>Full Page</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* 2. Classroom Game Studio */}
          <Link href="/admin/multiplayer" className="card-cultural p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-[#f59e0b] bg-gradient-to-br from-white to-[#fffcf5] dark:from-stone-900 dark:to-stone-950 relative overflow-hidden flex flex-col justify-between">
            <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300">
              Teacher Mode
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs flex-shrink-0">
                🎓
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#f59e0b] transition-colors leading-tight">
                  Classroom Game Studio
                </h2>
                <p className="text-sm text-[#5a5a5a] dark:text-stone-400 mt-1">
                  Configure topics, custom timers, question decks, and monitor student match records
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/80 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#f59e0b]">
              <span>Open Studio</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* 3. Mobile Access QR Projector Card */}
          <div 
            onClick={() => setShowQrModal(true)}
            className="card-cultural p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-300 dark:border-emerald-900/60 bg-gradient-to-br from-white to-[#f0fdf4] dark:from-stone-900 dark:to-stone-950 relative overflow-hidden flex flex-col justify-between group"
          >
            <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200">
              Mobile Join
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#10b981] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs flex-shrink-0">
                📱
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#10b981] transition-colors leading-tight">
                  Classroom QR Code
                </h2>
                <p className="text-sm text-[#5a5a5a] dark:text-stone-400 mt-1">
                  Display full-screen QR code on projector for students to access <span className="font-mono font-bold text-stone-700 dark:text-stone-300">nihongo.shan0h.my.id</span>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/80 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#10b981]">
              <span>Project QR on Screen</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* 4. Manage Questions */}
          <Link href="/admin/questions" className="card-cultural p-6 hover:shadow-lg transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d32f2f] text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                📝
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] dark:text-white group-hover:text-[#d32f2f] transition-colors leading-tight">
                  Manage Questions
                </h2>
                <p className="text-sm text-[#5a5a5a] dark:text-stone-400 mt-1">
                  Add, edit, or delete Japanese vocabulary and quiz questions
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#d32f2f]">
              <span>Edit Questions</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* 5. Manage Categories */}
          <Link href="/admin/categories" className="card-cultural p-6 hover:shadow-lg transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                📂
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2d2d2d] dark:text-white group-hover:text-purple-600 transition-colors leading-tight">
                  Manage Categories
                </h2>
                <p className="text-sm text-[#5a5a5a] dark:text-stone-400 mt-1">
                  Create or customize question categories, icons, and order
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Edit Categories</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Certificate Modal for Quick Preview */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        categoryName="Numbers"
        categoryEmoji="📚"
        score={470}
        totalPoints={470}
        totalQuestions={5}
        accuracyPercentage={100}
        initialPlayerName="Sample Student"
        rank="#1/1"
        eventCode="UHB10802"
      />

      {/* QR Code Projector Modal */}
      <QrAccessModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url="https://nihongo.shan0h.my.id"
      />
    </div>
  );
}