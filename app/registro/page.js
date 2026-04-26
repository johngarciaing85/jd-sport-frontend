'use client';
import { API_URL } from '@/lib/api';
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

function DiamondTiny() {
  return (
    <svg width="14" height="17" viewBox="0 0 80 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rg-t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6eeff" /><stop offset="100%" stopColor="#4090ee" />
        </linearGradient>
        <linearGradient id="rg-l" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5599dd" /><stop offset="100%" stopColor="#003388" />
        </linearGradient>
        <linearGradient id="rg-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#aad4ff" /><stop offset="100%" stopColor="#2255bb" />
        </linearGradient>
        <linearGradient id="rg-pc" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#2d66cc" /><stop offset="100%" stopColor="#00041a" />
        </linearGradient>
      </defs>
      <polygon points="24,30 56,30 50,13 30,13" fill="url(#rg-t)" />
      <polygon points="7,30 24,30 30,13 40,4" fill="url(#rg-l)" />
      <polygon points="73,30 56,30 50,13 40,4" fill="url(#rg-r)" />
      <polygon points="7,32.5 73,32.5 40,96" fill="url(#rg-pc)" />
    </svg>
  );
}

const GENEROS = ['Dama', 'Caballero', 'Prefiero no decir'];

export default function RegistroPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    password: '',
    confirmar: '',
    genero: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.password || !form.confirmar) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      genero: form.genero || undefined,
      telefono: form.celular || undefined,
    };

    try {
      await axios.post(`${API_URL}/usuarios/registro`, payload);
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : (err.response?.data?.email?.[0] || err.response?.data?.message || 'No se pudo crear la cuenta. Intenta de nuevo.'));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-4 text-5xl font-black text-white"
          style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
        >
          ✓
        </div>
        <h2 className="text-white font-black text-2xl uppercase tracking-tight mb-3">
          ¡Cuenta creada!
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Tu cuenta ha sido registrada exitosamente.
        </p>
        <Link
          href="/login"
          className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors"
        >
          Ingresar ahora
        </Link>
      </div>
    );
  }

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
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Únete a nosotros</p>
            <h1
              className="text-white font-black text-3xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Crear cuenta
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-red-400 text-xs tracking-wide">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                  Nombre <span className="text-white/60">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  autoComplete="given-name"
                  placeholder="María"
                  className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  autoComplete="family-name"
                  placeholder="García"
                  className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                Correo electrónico <span className="text-white/60">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            {/* Celular */}
            <div>
              <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                Número de celular
              </label>
              <input
                type="tel"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="300 123 4567"
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                Género
              </label>
              <select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Seleccionar...</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g.toLowerCase()}>{g}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
                  Contraseña <span className="text-white/60">*</span>
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
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/50 transition-colors"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-white/40 text-[10px] tracking-[0.3em] uppercase mb-2">
                Confirmar contraseña <span className="text-white/60">*</span>
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full bg-[#111] border text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none transition-colors ${
                  form.confirmar && form.password !== form.confirmar
                    ? 'border-red-500/50'
                    : 'border-white/15 focus:border-white/50'
                }`}
              />
              {form.confirmar && form.password !== form.confirmar && (
                <p className="text-red-400 text-[10px] mt-1.5 tracking-wide">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => { setAceptaTerminos(e.target.checked); setError(null); }}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${
                  aceptaTerminos ? 'bg-white border-white' : 'bg-transparent border-white/25 group-hover:border-white/50'
                }`}>
                  {aceptaTerminos && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-white/40 text-xs leading-relaxed tracking-wide">
                Acepto los{' '}
                <Link href="/terminos" target="_blank" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link href="/privacidad" target="_blank" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  Política de Privacidad
                </Link>
                {' '}de Almacen Sport.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-[10px] tracking-[0.2em] uppercase">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login link */}
          <p className="text-center text-white/40 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-white hover:text-white/70 underline underline-offset-4 transition-colors">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}