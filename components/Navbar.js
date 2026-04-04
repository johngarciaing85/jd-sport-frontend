'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCarrito, selectCantidadTotal } from '@/lib/carrito';
import { useAuth } from '@/lib/auth';

function DiamondMini() {
  return (
    <svg width="18" height="22" viewBox="0 0 80 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nav-t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d6eeff" />
          <stop offset="100%" stopColor="#4090ee" />
        </linearGradient>
        <linearGradient id="nav-l" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5599dd" />
          <stop offset="100%" stopColor="#003388" />
        </linearGradient>
        <linearGradient id="nav-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#aad4ff" />
          <stop offset="100%" stopColor="#2255bb" />
        </linearGradient>
        <linearGradient id="nav-pl" x1="1" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#1144aa" />
          <stop offset="100%" stopColor="#000828" />
        </linearGradient>
        <linearGradient id="nav-pc" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#2d66cc" />
          <stop offset="100%" stopColor="#00041a" />
        </linearGradient>
        <linearGradient id="nav-pr" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#3a77dd" />
          <stop offset="100%" stopColor="#001040" />
        </linearGradient>
      </defs>
      <polygon points="24,30 56,30 50,13 30,13" fill="url(#nav-t)" />
      <polygon points="7,30 24,30 30,13 40,4" fill="url(#nav-l)" />
      <polygon points="73,30 56,30 50,13 40,4" fill="url(#nav-r)" />
      <rect x="7" y="30" width="66" height="2.5" fill="rgba(180,220,255,0.35)" />
      <polygon points="7,32.5 24,32.5 40,96" fill="url(#nav-pl)" />
      <polygon points="24,32.5 56,32.5 40,96" fill="url(#nav-pc)" />
      <polygon points="73,32.5 56,32.5 40,96" fill="url(#nav-pr)" />
    </svg>
  );
}

function isAdmin(u) {
  return u?.is_admin || u?.is_staff || u?.es_admin || u?.rol === 'admin' || u?.role === 'admin';
}

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/login', label: 'Ingresar' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cantidadTotal = useCarrito(selectCantidadTotal);
  const { usuario, logout } = useAuth();

  useEffect(() => setMounted(true), []);

  const visibleLinks = mounted && usuario
    ? navLinks.filter(({ href }) => href !== '/login')
    : navLinks;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group" style={{ filter: 'drop-shadow(0 0 8px rgba(50,130,255,0.4))' }}>
          <DiamondMini />
          <span className="text-white font-black tracking-[0.15em] text-sm uppercase group-hover:text-white/80 transition-colors">
            JD Sport
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {visibleLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs tracking-[0.2em] uppercase transition-colors ${
                pathname === href ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          {mounted && isAdmin(usuario) && (
            <Link
              href="/admin/dashboard"
              className={`text-xs tracking-[0.2em] uppercase transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/admin') ? 'text-blue-400' : 'text-blue-400/50 hover:text-blue-400'
              }`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Administrar
            </Link>
          )}
        </nav>

        {/* Cart + auth + mobile toggle */}
        <div className="flex items-center gap-4">
          {/* Auth quick link */}
          {mounted && usuario ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/mis-pedidos" className="text-white/50 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors">
                {usuario.nombre ?? 'Mi cuenta'}
              </Link>
              <button onClick={logout} className="text-white/30 hover:text-white/60 text-xs tracking-[0.2em] uppercase transition-colors">
                Salir
              </button>
            </div>
          ) : null}

          {/* Cart icon */}
          <Link href="/carrito" className="relative text-white/70 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && cantidadTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cantidadTotal > 99 ? '99+' : cantidadTotal}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden bg-black border-t border-white/10 px-6 py-5 flex flex-col gap-5">
          {visibleLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm tracking-[0.2em] uppercase transition-colors ${
                pathname === href ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          {mounted && usuario && (
            <>
              {isAdmin(usuario) && (
                <Link href="/admin/dashboard" onClick={() => setMenuOpen(false)} className="text-blue-400/70 hover:text-blue-400 text-sm tracking-[0.2em] uppercase transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/mis-pedidos" onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white text-sm tracking-[0.2em] uppercase transition-colors">
                Mis pedidos
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-left text-white/30 hover:text-white/60 text-sm tracking-[0.2em] uppercase transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
