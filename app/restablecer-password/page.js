'use client';
import { API_URL } from '@/lib/api';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function RestablecerContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [form, setForm]       = useState({ nueva_password: '', confirmar_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nueva_password || !form.confirmar_password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (form.nueva_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.nueva_password !== form.confirmar_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        nueva_password: form.nueva_password,
      });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'El enlace es inválido o ha expirado. Solicita uno nuevo.'));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Acceso</p>
            <h1
              className="text-white font-black text-3xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Nueva<br />contraseña
            </h1>
          </div>

          {success ? (
            <div className="flex flex-col gap-6">
              <div className="border border-white/10 bg-[#0a0a0a] px-5 py-6 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm leading-relaxed tracking-wide">
                  Tu contraseña fue restablecida correctamente.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full block text-center bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors"
              >
                Ingresar ahora
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-red-400 text-xs tracking-wide">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
                      Nueva contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
                    >
                      {showPass ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="nueva_password"
                    value={form.nueva_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors tracking-wide"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="confirmar_password"
                    value={form.confirmar_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors tracking-wide"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
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

export default function RestablecerPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RestablecerContent />
    </Suspense>
  );
}