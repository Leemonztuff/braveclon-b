'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, onAuthChange, AuthUser } from '@/lib/auth';
import GameDatabase from '@/components/GameDatabase';

export default function LandingPage() {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser as AuthUser | null);
      setLoading(false);
    };
    checkAuth();

    const authListener = onAuthChange((user) => {
      setUser(user);
    });

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-400 animate-spin text-4xl">⚔️</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-zinc-950 to-zinc-950" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 mb-6">
              <span className="text-6xl">⚔️</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-amber-400 tracking-tight">
              BRAVECLON
            </h1>
            <p className="mt-4 text-xl text-zinc-400">
              RPG Táctico por Turnos
            </p>
          </div>

          {/* Auth State */}
          {user ? (
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="flex items-center gap-3 bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-black">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-zinc-300">Conectado</span>
              </div>
              <Link
                href="/game"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 text-zinc-950 font-black text-lg rounded-full hover:bg-amber-300 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                <span>🎮</span>
                CONTINUAR
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/game"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 text-zinc-950 font-black text-lg rounded-full hover:bg-amber-300 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                <span>🎮</span>
                JUGAR AHORA
              </Link>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <div className="text-2xl font-black text-amber-400">50+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Unidades</div>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <div className="text-2xl font-black text-sky-400">6</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Elementos</div>
            </div>
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
              <div className="text-2xl font-black text-emerald-400">∞</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Combates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full py-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-between px-6"
        >
          <span className="font-bold text-lg">Características del Juego</span>
          <span className="text-2xl transition-transform duration-300" style={{ transform: showFeatures ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▼
          </span>
        </button>

        {showFeatures && (
          <div className="mt-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 space-y-6">
            <div className="flex gap-4">
              <div className="text-3xl">🎴</div>
              <div>
                <h3 className="font-bold text-amber-400 text-lg">Gacha System</h3>
                <p className="text-zinc-400 text-sm">Summon unidades legendary, elite y rare. Sistema de pity integrado.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">⚔️</div>
              <div>
                <h3 className="font-bold text-amber-400 text-lg">Combate Táctico</h3>
                <p className="text-zinc-400 text-sm">Sistema por turnos con ventajas elementales y Brave Bursts.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🧬</div>
              <div>
                <h3 className="font-bold text-amber-400 text-lg">Fusión & Evolución</h3>
                <p className="text-zinc-400 text-sm">Fusiona unidades para ganar EXP y evoluciona para desbloquear su potencial.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">📱</div>
              <div>
                <h3 className="font-bold text-amber-400 text-lg">Progressive Web App</h3>
                <p className="text-zinc-400 text-sm">Juega en tu navegador o instálalo en tu móvil. Guardado en la nube.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowDatabase(!showDatabase)}
          className="w-full mt-4 py-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center justify-between px-6"
        >
          <span className="font-bold text-lg text-amber-400">📚 Game Database</span>
          <span className="text-2xl text-amber-400 transition-transform duration-300" style={{ transform: showDatabase ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▼
          </span>
        </button>

        {showDatabase && (
          <div className="mt-4">
            <GameDatabase />
          </div>
        )}
      </div>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-zinc-600 text-sm">
          Braveclon es un fan game inspirado en Brave Frontier. No asociado con Alim o gumi.
        </p>
        <p className="text-zinc-700 text-xs mt-2">
          © 2024 Braveclon. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
