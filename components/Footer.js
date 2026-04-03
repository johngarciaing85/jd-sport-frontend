import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <h3
            className="text-white font-black text-xl tracking-[0.2em] uppercase mb-4"
            style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
          >
            JD Sport
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Estilo y calidad en cada prenda.<br />Moda para dama y caballero. <br /> Los precios mas competitivos del hueco.
          </p>
          <div className="flex gap-3">
            {['WhatsApp', 'TikTok'].map((s) => (
              <span
                key={s}
                className="text-white/30 hover:text-white text-xs tracking-widest uppercase border border-white/10 hover:border-white/30 px-3 py-1.5 cursor-pointer transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase mb-6 font-medium">
            Navegación
          </h4>
          <ul className="flex flex-col gap-3">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/productos', label: 'Productos' },
              { href: '/productos?genero=dama', label: 'Dama' },
              { href: '/productos?genero=caballero', label: 'Caballero' },
              { href: '/login', label: 'Mi cuenta' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-white/40 hover:text-white text-sm tracking-wide transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase mb-6 font-medium">
            Contacto
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-white/40">
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              almacenjdsport@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.41a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              317 749 9434 <br /> 315 601 7912
            </li>
            <li className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Calle 48 No. 53 - 101<br />Cucuta con Pichincha
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <p className="text-white/25 text-xs tracking-[0.3em] uppercase">
          © 2026 JD Sport — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
