import Link from 'next/link';

function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
            Almacen Sport
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Estilo y calidad en cada prenda.<br />Moda para dama y caballero. <br /> Los precios mas competitivos del hueco.
          </p>
          <div className="flex gap-3">
            <a
              href="https://wa.me/573177499434"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white text-xs tracking-widest uppercase border border-white/10 hover:border-white/30 px-3 py-1.5 transition-colors"
              style={{ color: 'rgba(37,211,102,0.7)' }}
            >
              <WhatsAppIcon size={14} />
              Línea 1
            </a>
            <a
              href="https://wa.me/573156017912"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white text-xs tracking-widest uppercase border border-white/10 hover:border-white/30 px-3 py-1.5 transition-colors"
              style={{ color: 'rgba(37,211,102,0.7)' }}
            >
              <WhatsAppIcon size={14} />
              Línea 2
            </a>
            <a
              href="https://www.tiktok.com/@jd.sport.store?_r=1&_t=ZS-95FBKgCeOKG"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white text-xs tracking-widest uppercase border border-white/10 hover:border-white/30 px-3 py-1.5 transition-colors"
            >
              TikTok
            </a>
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
              { href: '/productos?genero=mujer', label: 'Dama' },
              { href: '/productos?genero=hombre', label: 'Caballero' },
              { href: '/nosotros', label: 'Nosotros' },
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
              317 749 9434 · 315 601 7912
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

      <div className="border-t border-white/10 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs tracking-[0.3em] uppercase">
            © 2026 Almacen Sport — Todos los derechos reservados
          </p>
          <div className="flex items-center gap-8 pb-4 sm:pb-0 relative z-[51]">
            <Link href="/terminos" className="text-white/30 hover:text-white/60 text-xs tracking-wide transition-colors py-3 px-2 inline-block">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="text-white/30 hover:text-white/60 text-xs tracking-wide transition-colors py-3 px-2 inline-block">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}