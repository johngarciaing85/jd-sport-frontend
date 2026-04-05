import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

function Section({ id, title, children }) {
  return (
    <section id={id} className="py-10 border-b border-white/8 last:border-0">
      <h2
        className="text-white font-black text-lg uppercase tracking-wide mb-5"
        style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-white/55 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

const TOC = [
  { href: '#responsable',  label: '1. Responsable del tratamiento' },
  { href: '#datos',        label: '2. Datos que recopilamos' },
  { href: '#finalidad',    label: '3. Finalidad del tratamiento' },
  { href: '#terceros',     label: '4. Compartir datos con terceros' },
  { href: '#derechos',     label: '5. Derechos del titular' },
  { href: '#ejercer',      label: '6. Cómo ejercer sus derechos' },
  { href: '#seguridad',    label: '7. Seguridad de la información' },
  { href: '#vigencia',     label: '8. Vigencia de la política' },
];

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 pt-16">

        {/* Hero */}
        <section
          className="relative py-20 px-6 overflow-hidden"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #0a1628 0%, #000 70%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">JD Sport — Legal</p>
            <h1
              className="text-white font-black uppercase leading-none mb-4"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                fontFamily: "'Geist Sans', 'Arial Black', sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              Política de<br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>Privacidad</span>
            </h1>
            <p className="text-white/35 text-xs tracking-wide mb-2">Última actualización: abril de 2026</p>
            <p className="text-white/30 text-xs tracking-wide">
              Conforme a la Ley 1581 de 2012 — Habeas Data Colombia
            </p>
          </div>
        </section>

        {/* Habeas Data notice */}
        <div className="bg-[#0a1628]/60 border-b border-blue-900/30 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/60 mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-white/40 text-xs tracking-wide leading-relaxed">
              Esta política cumple con la <strong className="text-white/60">Ley Estatutaria 1581 de 2012</strong> y el
              Decreto 1377 de 2013 sobre Protección de Datos Personales en Colombia. Como titular de sus datos, usted
              tiene derechos que puede ejercer en cualquier momento.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* Table of contents */}
          <aside className="hidden lg:block sticky top-24">
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase mb-4">Contenido</p>
            <nav className="flex flex-col gap-2">
              {TOC.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-white/35 hover:text-white text-xs tracking-wide transition-colors py-0.5"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <article>
            <Section id="responsable" title="1. Responsable del tratamiento">
              <p>
                El responsable del tratamiento de sus datos personales es:
              </p>
              <div className="border border-white/10 bg-[#0a0a0a] p-5 flex flex-col gap-2">
                {[
                  ['Razón social', 'JD Sport'],
                  ['Actividad', 'Venta de ropa deportiva y casual'],
                  ['Ciudad', 'Medellín, Antioquia, Colombia'],
                  ['Dirección', 'Medellín, Antioquia, Colombia'],
                  ['Correo', 'almacenjdsport@gmail.com'],
                  ['Teléfono', '317 749 9434 / 315 601 7912'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-xs">
                    <span className="text-white/30 w-28 shrink-0 tracking-wide">{k}:</span>
                    <span className="text-white/70">{v}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="datos" title="2. Datos que recopilamos">
              <p>
                JD Sport recopila únicamente los datos necesarios para prestar el servicio de venta y entrega de
                productos. Los datos que podemos recopilar son:
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  { dato: 'Nombre completo', uso: 'Identificación del cliente y facturación' },
                  { dato: 'Correo electrónico', uso: 'Confirmación de pedidos y comunicaciones' },
                  { dato: 'Número de teléfono / celular', uso: 'Coordinación de entrega y atención al cliente' },
                  { dato: 'Dirección de entrega', uso: 'Envío y entrega del pedido' },
                  { dato: 'Género (opcional)', uso: 'Personalización de recomendaciones de productos' },
                  { dato: 'Historial de pedidos', uso: 'Gestión de compras y soporte postventa' },
                ].map(({ dato, uso }) => (
                  <li key={dato} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>
                      <strong className="text-white/75">{dato}:</strong> {uso}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                No recopilamos datos sensibles como información financiera directamente. Los pagos son procesados por
                plataformas certificadas como <strong className="text-white/70">Wompi</strong>, que tienen sus propias
                políticas de seguridad y privacidad.
              </p>
            </Section>

            <Section id="finalidad" title="3. Finalidad del tratamiento">
              <p>Los datos personales recopilados serán utilizados exclusivamente para:</p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Procesar y gestionar sus pedidos de compra.',
                  'Generar y enviar facturas y comprobantes de pago.',
                  'Contactar al cliente sobre el estado de su pedido o para coordinar la entrega.',
                  'Prestar servicio de atención al cliente y soporte postventa.',
                  'Enviar confirmaciones de registro y notificaciones relacionadas con la cuenta.',
                  'Mejorar nuestros servicios y la experiencia de compra de forma agregada y anónima.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                JD Sport <strong className="text-white/75">no enviará comunicaciones de marketing</strong> sin el
                consentimiento expreso del titular. Si en algún momento desea recibir información sobre novedades y
                promociones, puede solicitarlo a través de nuestros canales de contacto.
              </p>
            </Section>

            <Section id="terceros" title="4. Compartir datos con terceros">
              <div className="border border-green-900/30 bg-green-950/10 px-5 py-4 flex gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500/60 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-white/60 text-xs tracking-wide leading-relaxed">
                  <strong className="text-white/80">JD Sport NO vende, alquila ni comparte sus datos personales</strong>{' '}
                  con terceros con fines comerciales o publicitarios sin su consentimiento expreso.
                </p>
              </div>
              <p>
                Sus datos únicamente pueden ser compartidos en los siguientes casos limitados:
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Con empresas de mensajería y logística, exclusivamente para gestionar la entrega de su pedido.',
                  'Con la pasarela de pago Wompi, para procesar transacciones de forma segura.',
                  'Cuando sea requerido por autoridades competentes en virtud de una obligación legal.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                En todos los casos, exigiremos a los terceros que traten sus datos con la misma seguridad y
                confidencialidad que JD Sport les otorga.
              </p>
            </Section>

            <Section id="derechos" title="5. Derechos del titular (Habeas Data)">
              <p>
                Conforme a la <strong className="text-white/75">Ley 1581 de 2012</strong> y sus decretos reglamentarios,
                usted como titular de sus datos personales tiene los siguientes derechos:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { titulo: 'Conocer', desc: 'Acceder a los datos personales que JD Sport tiene sobre usted.' },
                  { titulo: 'Actualizar', desc: 'Solicitar la corrección de datos inexactos o incompletos.' },
                  { titulo: 'Rectificar', desc: 'Exigir la corrección de información incorrecta.' },
                  { titulo: 'Suprimir', desc: 'Solicitar la eliminación de sus datos cuando no sean necesarios.' },
                  { titulo: 'Revocar', desc: 'Retirar su consentimiento para el tratamiento de datos en cualquier momento.' },
                  { titulo: 'Presentar quejas', desc: 'Acudir ante la Superintendencia de Industria y Comercio (SIC).' },
                ].map(({ titulo, desc }) => (
                  <div key={titulo} className="border border-white/8 bg-[#0a0a0a] p-4">
                    <p className="text-white/80 text-xs font-bold tracking-wide uppercase mb-1.5">{titulo}</p>
                    <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="ejercer" title="6. Cómo ejercer sus derechos">
              <p>
                Para ejercer cualquiera de sus derechos como titular, puede contactarnos a través de los siguientes
                canales:
              </p>
              <div className="border border-white/10 bg-[#0a0a0a] p-5 flex flex-col gap-4">
                <div className="flex gap-3 items-start">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 mt-0.5 shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-0.5">Correo electrónico</p>
                    <a href="mailto:almacenjdsport@gmail.com" className="text-white/70 hover:text-white text-sm transition-colors">
                      almacenjdsport@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 mt-0.5 shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.41a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-0.5">WhatsApp / Teléfono</p>
                    <p className="text-white/70 text-sm">317 749 9434 / 315 601 7912</p>
                  </div>
                </div>
              </div>
              <p>
                Su solicitud será atendida en un plazo máximo de <strong className="text-white/75">10 días hábiles</strong>{' '}
                conforme a lo establecido en la Ley 1581 de 2012. Si la solicitud requiere mayor tiempo, JD Sport le
                informará los motivos de la demora.
              </p>
              <p>
                Si considera que sus derechos no han sido atendidos adecuadamente, puede presentar una queja ante la
                Superintendencia de Industria y Comercio (SIC) de Colombia.
              </p>
            </Section>

            <Section id="seguridad" title="7. Seguridad de la información">
              <p>
                JD Sport implementa medidas técnicas y organizativas razonables para proteger sus datos personales
                contra acceso no autorizado, pérdida, alteración o divulgación.
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Las contraseñas de los usuarios se almacenan de forma encriptada.',
                  'Las comunicaciones con nuestro sitio web utilizan protocolo HTTPS.',
                  'El acceso a la base de datos está restringido a personal autorizado.',
                  'Los pagos son procesados por Wompi, plataforma con certificación PCI DSS.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Pese a las medidas implementadas, ningún sistema de seguridad es infalible. En caso de una brecha de
                seguridad que afecte sus datos, JD Sport le notificará a la brevedad posible.
              </p>
            </Section>

            <Section id="vigencia" title="8. Vigencia de la política">
              <p>
                La presente Política de Privacidad y Tratamiento de Datos Personales entra en vigor en{' '}
                <strong className="text-white/75">abril de 2026</strong> y permanecerá vigente hasta que sea
                modificada o reemplazada por una versión actualizada.
              </p>
              <p>
                Cualquier modificación sustancial será comunicada a través del sitio web y, cuando sea posible, por
                correo electrónico a los usuarios registrados con al menos 15 días de anticipación.
              </p>
              <p>
                Los datos personales recopilados serán conservados durante el tiempo necesario para cumplir con las
                finalidades descritas en esta política o según lo exija la ley colombiana.
              </p>
              <p>
                Para cualquier consulta sobre esta política, contáctenos en:{' '}
                <a href="mailto:almacenjdsport@gmail.com" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  almacenjdsport@gmail.com
                </a>
              </p>
            </Section>

            {/* Related */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/terminos"
                className="flex-1 border border-white/10 px-5 py-4 hover:border-white/25 hover:bg-white/[0.02] transition-colors group"
              >
                <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Ver también</p>
                <p className="text-white text-sm font-bold tracking-wide group-hover:text-white/80 transition-colors">
                  Términos y Condiciones →
                </p>
              </Link>
              <Link
                href="/nosotros"
                className="flex-1 border border-white/10 px-5 py-4 hover:border-white/25 hover:bg-white/[0.02] transition-colors group"
              >
                <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Conócenos</p>
                <p className="text-white text-sm font-bold tracking-wide group-hover:text-white/80 transition-colors">
                  Sobre Nosotros →
                </p>
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
