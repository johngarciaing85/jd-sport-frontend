import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0a1628 0%, #000 70%)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(30,80,200,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-white/40 text-xs tracking-[0.4em] uppercase mb-6">
          Almacen Sport — Medellin
        </p>
        <h1
          className="text-white font-black uppercase leading-none mb-5"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontFamily: "'Geist Sans', 'Arial Black', sans-serif",
            letterSpacing: '-0.02em',
            textShadow: '0 0 80px rgba(50,120,255,0.2)',
          }}
        >
          Sobre
          <br />
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>Nosotros</span>
        </h1>
        <p className="text-white/50 text-base md:text-lg tracking-wide max-w-md mx-auto">
          Estilo y calidad en cada prenda
        </p>
      </div>
    </section>
  );
}

/* ─── Historia ───────────────────────────────────────────────────────────── */
function Historia() {
  return (
    <section className="bg-[#050505] py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">Quiénes somos</p>
            <h2
              className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight mb-8"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Nuestra Historia
            </h2>
            <div className="w-12 h-px bg-white/20 mb-8" />
            <div className="flex flex-col gap-5 text-white/55 text-sm leading-relaxed">
              <p>
                Almacen Sport nació en el corazón de <strong className="text-white/80">Medellin, Antioquia</strong>, con una visión clara: democratizar la moda deportiva y urbana de calidad para todos.
              </p>
              <p>
                Somos una tienda colombiana especializada en ropa deportiva y casual, con las mejores marcas y tendencias para <strong className="text-white/80">dama y caballero</strong>. Nos destacamos por ofrecer prendas premium a precios realmente competitivos.
              </p>
              <p>
                Nuestra <strong className="text-white/80">misión</strong> es simple: que cada cliente encuentre la prenda perfecta sin sacrificar su bolsillo. Calidad, estilo y precio justo, todo en un solo lugar.
              </p>
            </div>
          </div>

          {/* Decorative panel */}
          <div className="relative">
            <div
              className="border border-white/10 p-10 bg-[#0a0a0a]"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #0a1628 0%, #080808 80%)',
              }}
            >
              <div className="flex flex-col gap-8">
                {[
                  { num: '8+', label: 'Años en el mercado' },
                  { num: '8000+', label: 'Productos disponibles' },
                  { num: '2', label: 'Líneas de atención' },
                ].map(({ num, label }) => (
                  <div key={label} className="flex items-center gap-5">
                    <span
                      className="text-white font-black text-3xl"
                      style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
                    >
                      {num}
                    </span>
                    <span className="text-white/40 text-sm tracking-wide">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Corner accent */}
            <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b border-r border-blue-600/30" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Valores ────────────────────────────────────────────────────────────── */
function Valores() {
  const values = [
    {
      emoji: '💎',
      title: 'Calidad',
      desc: 'Seleccionamos materiales premium para garantizar durabilidad y comodidad en cada prenda que ofrecemos.',
    },
    {
      emoji: '🏷️',
      title: 'Precio justo',
      desc: 'Los mejores precios del mercado, sin intermediarios. Moda de calidad al alcance de todos.',
    },
    {
      emoji: '🚀',
      title: 'Variedad',
      desc: 'Las últimas tendencias en moda deportiva y urbana para dama y caballero, siempre actualizadas.',
    },
  ];

  return (
    <section className="bg-black py-24 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">Lo que nos define</p>
          <h2
            className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight"
            style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
          >
            Nuestros Valores
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="border border-white/10 p-8 bg-[#080808] hover:border-white/20 hover:bg-[#0d0d0d] transition-colors group"
            >
              <div className="text-3xl mb-5">{emoji}</div>
              <h3
                className="text-white font-black text-lg uppercase tracking-wide mb-4 group-hover:text-white/90"
                style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
              >
                {title}
              </h3>
              <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Ubicación ──────────────────────────────────────────────────────────── */
function Ubicacion() {
  const wa1 = 'https://wa.me/573177499434?text=Hola%2C%20vi%20su%20tienda%20JD%20Sport%20y%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n';
  const wa2 = 'https://wa.me/573156017912?text=Hola%2C%20vi%20su%20tienda%20JD%20Sport%20y%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n';

  return (
    <section className="bg-[#050505] py-24 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">Visítanos</p>
          <h2
            className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight"
            style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
          >
            Encuéntranos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="flex flex-col gap-8">
            {/* Address */}
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0 text-white/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2">Dirección</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Medellín, Antioquia<br />
                  <span className="text-white/40">Colombia</span>
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0 text-white/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.41a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2">Teléfono</p>
                <p className="text-white/80 text-sm">317 749 9434</p>
                <p className="text-white/80 text-sm">315 601 7912</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0 text-white/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2">Correo</p>
                <a
                  href="mailto:almacenjdsport@gmail.com"
                  className="text-white/80 text-sm hover:text-white transition-colors"
                >
                  almacenjdsport@gmail.com
                </a>
              </div>
            </div>

            {/* WhatsApp buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-white/30 text-xs tracking-[0.3em] uppercase">WhatsApp</p>
              <a
                href={wa1}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-white/15 px-5 py-3 hover:border-green-500/40 hover:bg-green-950/20 transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500/70 group-hover:text-green-500 transition-colors shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                <div>
                  <p className="text-white/70 text-xs tracking-wide group-hover:text-white transition-colors">Línea 1</p>
                  <p className="text-white/50 text-xs">317 749 9434</p>
                </div>
              </a>
              <a
                href={wa2}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-white/15 px-5 py-3 hover:border-green-500/40 hover:bg-green-950/20 transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500/70 group-hover:text-green-500 transition-colors shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                <div>
                  <p className="text-white/70 text-xs tracking-wide group-hover:text-white transition-colors">Línea 2</p>
                  <p className="text-white/50 text-xs">315 601 7912</p>
                </div>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="border border-white/10 overflow-hidden">
            <iframe
              src="https://maps.google.com/maps?q=Medellín,Antioquia,Colombia&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="400"
              style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Almacen Sport"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA strip ──────────────────────────────────────────────────────────── */
function CtaStrip() {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h3
          className="text-black font-black text-2xl md:text-3xl uppercase tracking-tight mb-4"
          style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
        >
          ¿Listo para explorar la colección?
        </h3>
        <p className="text-black/50 text-sm mb-8">
          Descubre las últimas tendencias en moda deportiva y urbana para dama y caballero.
        </p>
        <Link
          href="/productos"
          className="inline-block px-10 py-4 bg-black text-white text-xs font-bold tracking-[0.3em] uppercase hover:bg-black/80 transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 pt-16">
        <Hero />
        <Historia />
        <Valores />
        <Ubicacion />
        <CtaStrip />
      </main>
      <Footer />
    </div>
  );
}