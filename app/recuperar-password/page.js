'use client';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RecuperarPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:8000/api/auth/solicitar-reset', { email: email.trim() });
      setSent(true);
    } catch {
      // Always show success message to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-10">
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Acceso</p>
            <h1
              className="text-white font-black text-3xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Recuperar<br />contraseña
            </h1>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col gap-6">
              <div className="border border-white/10 bg-[#0a0a0a] px-5 py-6 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm leading-relaxed tracking-wide">
                  Si el email existe, recibirás un enlace en tu correo.
                </p>
              </div>
              <Link
                href="/login"
                className="text-white/35 hover:text-white text-xs tracking-[0.25em] uppercase transition-colors"
              >
                ← Volver a ingresar
              </Link>
            </div>

          ) : (
            /* ── Form ── */
            <>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {error && (
                <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-red-400 text-xs tracking-wide">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div>
                  <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors tracking-wide"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>

              <p className="text-center mt-8">
                <Link href="/login" className="text-white/30 hover:text-white/60 text-xs tracking-wide transition-colors">
                  ← Volver a ingresar
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
