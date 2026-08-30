'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { safeErrorMessage } from '@/lib/api';

function DiamondTiny() {
  return (
    <svg width="14" height="17" viewBox="0 0 80 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lg-t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6eeff" /><stop offset="100%" stopColor="#4090ee" />
        </linearGradient>
        <linearGradient id="lg-l" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5599dd" /><stop offset="100%" stopColor="#003388" />
        </linearGradient>
        <linearGradient id="lg-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#aad4ff" /><stop offset="100%" stopColor="#2255bb" />
        </linearGradient>
        <linearGradient id="lg-pc" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#2d66cc" /><stop offset="100%" stopColor="#00041a" />
        </linearGradient>
      </defs>
      <polygon points="24,30 56,30 50,13 30,13" fill="url(#lg-t)" />
      <polygon points="7,30 24,30 30,13 40,4" fill="url(#lg-l)" />
      <polygon points="73,30 56,30 50,13 40,4" fill="url(#lg-r)" />
      <polygon points="7,32.5 73,32.5 40,96" fill="url(#lg-pc)" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const failCountRef = useRef(0);
  const lockUntilRef = useRef(0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    const now = Date.now();
    if (now < lockUntilRef.current) {
      const secs = Math.ceil((lockUntilRef.current - now) / 1000);
      setError(`Demasiados intentos. Espera ${secs} segundos.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      failCountRef.current = 0;
      router.push('/');
    } catch (err) {
      failCountRef.current += 1;
      if (failCountRef.current >= 5) {
        lockUntilRef.current = Date.now() + 30000;
      } else if (failCountRef.current >= 3) {
        lockUntilRef.current = Date.now() + 10000;
      }
      setError(safeErrorMessage(err, 'Credenciales incorrectas. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 group" style={{ filter: 'drop-shadow(0 0 6px rgba(50,130,255,0.4))' }}>
          <DiamondTiny />
          <span className="text-white font-black tracking-[0.15em] text-sm uppercase group-hover:text-white/70 transition-colors">
            Almacen Sport
          </span>
        </Link>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-10">
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Bienvenido</p>
            <h1
              className="text-white font-black text-3xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Ingresar
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-red-400 text-xs tracking-wide">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors tracking-wide"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
                  Contraseña
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
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors tracking-wide"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-[10px] tracking-[0.2em] uppercase">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register link */}
          <p className="text-center text-white/40 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-white hover:text-white/70 underline underline-offset-4 transition-colors">
              Regístrate
            </Link>
          </p>

          {/* Forgot password */}
          <p className="text-center mt-4">
            <Link href="/recuperar-password" className="text-white/30 hover:text-white/60 text-xs tracking-wide transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}