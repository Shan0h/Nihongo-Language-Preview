'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { supabase } from '@/app/utils/supabase';

export interface ScoreEntry {
  id: string;
  name: string;
  category: string;
  points: number;
  accuracy: number;
  created_at: string;
  badge: string;
}

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);
        
      if (!error && data) {
        setScores(data);
      }
      setLoading(false);
    }
    
    fetchLeaderboard();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leaderboard' }, payload => {
        setScores(current => {
          const newScores = [...current, payload.new as ScoreEntry];
          return newScores.sort((a, b) => b.points - a.points).slice(0, 50);
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f4c2c2]/60">
          <Link href="/" className="btn-torii px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1">
            ← Home
          </Link>
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-black gradient-text-torii flex items-center justify-center gap-2">
              <span>🏆</span> EXHIBITION SCOREBOARD
            </h1>
            <p className="text-xs sm:text-sm text-[#5a5a5a] font-bold mt-1">
              UHB10802 Japanese Communication 1 — Hall of Fame
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Top 3 Champions Podium Banner */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="text-4xl animate-bounce">⛩️</div></div>
        ) : scores.length === 0 ? (
          <div className="text-center p-12 text-[#8a8a8a] font-bold">No scores yet! Be the first to play.</div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {scores.slice(0, 3).map((score, i) => {
            const crown = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            const borderCol = i === 0 ? 'border-amber-400 bg-amber-500/10' : i === 1 ? 'border-slate-300 bg-slate-300/10' : 'border-amber-700/40 bg-amber-700/10';
            return (
              <div key={score.id} className={`card-cultural p-5 border-2 ${borderCol} text-center flex flex-col justify-between`}>
                <div>
                  <div className="text-4xl mb-1">{crown}</div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 font-black text-[10px] text-[#d32f2f] uppercase tracking-wider mb-1">
                    {score.badge}
                  </span>
                  <h3 className="text-lg font-black text-[#2d2d2d] truncate">{score.name}</h3>
                  <p className="text-xs text-[#8a8a8a] font-semibold">{score.category}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-2xl font-black glow-score-gold font-mono">{String(score.points).padStart(6, '0')}</div>
                  <div className="text-[11px] font-bold text-[#5a5a5a]">{score.accuracy}% Accuracy</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Rankings Table */}
        <div className="card-cultural p-5 lg:p-6 mb-6">
          <h2 className="text-base font-black text-[#2d2d2d] mb-4 flex items-center justify-between border-b pb-3">
            <span>📊 ALL TIME LEADERBOARD</span>
            <span className="text-xs font-bold text-[#d32f2f]">{scores.length} Players</span>
          </h2>

          <div className="space-y-3">
            {scores.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#f4c2c2]/50 bg-white hover:border-[#d32f2f] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-[#5a5a5a]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-base text-[#2d2d2d] truncate">{entry.name}</div>
                    <div className="text-xs text-[#8a8a8a] font-medium">
                      Topic: <span className="font-semibold text-[#5a5a5a]">{entry.category}</span> • {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-[#d32f2f] font-mono">
                    {String(entry.points).padStart(6, '0')} PTS
                  </div>
                  <div className="text-xs text-green-700 font-bold">
                    {entry.accuracy}% Correct
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4">
          <Link href="/topics" className="btn-torii px-8 py-3 text-base font-black shadow-lg">
            🎯 Choose Solo Topic
          </Link>
          <Link href="/play" className="btn-gold px-8 py-3 text-base font-black shadow-lg">
            📱 Join Multiplayer
          </Link>
        </div>

      </div>
    </div>
  );
}
