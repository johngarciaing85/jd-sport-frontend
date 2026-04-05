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
  { href: '#introduccion',    label: '1. Introducción y aceptación' },
  { href: '#servicio',        label: '2. Descripción del servicio' },
  { href: '#compra',          label: '3. Proceso de compra y pago' },
  { href: '#envios',          label: '4. Política de envíos y entregas' },
  { href: '#devoluciones',    label: '5. Devoluciones y garantías' },
  { href: '#propiedad',       label: '6. Propiedad intelectual' },
  { href: '#responsabilidad', label: '7. Limitación de responsabilidad' },
  { href: '#ley',             label: '8. Ley aplicable' },
];

export default function TerminosPage() {
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
              Términos y<br />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>Condiciones</span>
            </h1>
            <p className="text-white/35 text-xs tracking-wide">Última actualización: abril de 2026</p>
          </div>
        </section>

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
            <Section id="introduccion" title="1. Introducción y aceptación">
              <p>
                Los presentes Términos y Condiciones regulan el uso del sitio web y los servicios de venta de
                <strong className="text-white/80"> JD Sport</strong>, tienda de ropa deportiva ubicada en Medellín,
                Antioquia, Colombia.
              </p>
              <p>
                Al realizar una compra o utilizar nuestros servicios, usted declara que ha leído, comprendido y
                acepta estos términos en su totalidad. Si no está de acuerdo con alguna disposición, le rogamos
                abstenerse de utilizar nuestros servicios.
              </p>
              <p>
                JD Sport se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán
                en vigor inmediatamente después de su publicación. El uso continuado del servicio implica la
                aceptación de los términos actualizados.
              </p>
            </Section>

            <Section id="servicio" title="2. Descripción del servicio">
              <p>
                JD Sport es una tienda colombiana especializada en ropa deportiva y casual de alta calidad para dama y
                caballero. Ofrecemos nuestros productos a través de:
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Tienda física en Medellín, Antioquia, Colombia.',
                  'Sitio web con catálogo en línea y proceso de compra digital.',
                  'Atención por WhatsApp para consultas, separado de productos y pedidos.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Los productos mostrados en el catálogo están sujetos a disponibilidad de stock. JD Sport se reserva
                el derecho de actualizar, modificar o descontinuar productos sin previo aviso.
              </p>
            </Section>

            <Section id="compra" title="3. Proceso de compra y pago">
              <p>
                Para realizar una compra en nuestro sitio web, el cliente puede optar por crear una cuenta o continuar
                como invitado. En ambos casos, se requerirá información de contacto básica para procesar el pedido.
              </p>
              <p className="text-white/70 font-medium">Métodos de pago aceptados:</p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Wompi: Pago seguro en línea con tarjeta débito/crédito, PSE o Nequi.',
                  'Pago en tienda: El producto se reserva hasta 24 horas; el cliente debe acercarse a pagar en nuestro local.',
                  'Contraentrega: El pago se realiza en el momento de recibir el pedido. Disponible según cobertura.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Los precios publicados incluyen IVA cuando aplique y están expresados en pesos colombianos (COP).
                JD Sport se reserva el derecho de corregir errores tipográficos en precios antes de confirmar el pedido.
              </p>
              <p>
                El pedido se considerará confirmado una vez JD Sport envíe la notificación de confirmación al correo
                electrónico o WhatsApp registrado por el cliente.
              </p>
            </Section>

            <Section id="envios" title="4. Política de envíos y entregas">
              <p>
                JD Sport realiza entregas en Medellín y área metropolitana. Para otras ciudades de Colombia,
                el despacho se coordina por WhatsApp y depende de la disponibilidad del servicio de mensajería.
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'El tiempo estimado de entrega en Medellín es de 1 a 3 días hábiles.',
                  'Los envíos a otras ciudades pueden tomar entre 3 y 8 días hábiles según el destino.',
                  'JD Sport no se hace responsable por retrasos ocasionados por la empresa transportadora.',
                  'El cliente debe verificar que la dirección de entrega sea correcta antes de confirmar el pedido.',
                  'Si el paquete no puede ser entregado por dirección incorrecta o ausencia del destinatario, los costos de re-envío serán asumidos por el cliente.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="devoluciones" title="5. Devoluciones y garantías">
              <p>
                JD Sport garantiza la calidad de todos sus productos. Si recibes una prenda con defecto de fabricación
                o diferente a la descrita, acéptamos devoluciones bajo las siguientes condiciones:
              </p>
              <ul className="list-none flex flex-col gap-2 pl-4">
                {[
                  'Plazo para solicitar devolución: hasta 30 días calendario después de recibir el producto.',
                  'El producto debe estar sin usar, con etiquetas originales y en su empaque original.',
                  'Las devoluciones por talla incorrecta aplican únicamente si el producto fue enviado en talla diferente a la solicitada.',
                  'No se aceptan devoluciones de prendas que hayan sido lavadas, usadas o alteradas.',
                  'Para iniciar el proceso de devolución, contáctanos a almacenjdsport@gmail.com o WhatsApp.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-white/20 mt-1 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                Una vez verificada la devolución, JD Sport ofrecerá al cliente la opción de cambio por otra prenda
                de igual valor o nota crédito para futuras compras.
              </p>
            </Section>

            <Section id="propiedad" title="6. Propiedad intelectual">
              <p>
                Todo el contenido publicado en el sitio web de JD Sport —incluyendo textos, imágenes, logotipos,
                diseños y código— es propiedad de JD Sport o de sus proveedores de contenido y está protegido por
                las leyes de propiedad intelectual de Colombia.
              </p>
              <p>
                Queda prohibida la reproducción, distribución, modificación o uso comercial de cualquier contenido
                del sitio sin autorización expresa y por escrito de JD Sport.
              </p>
              <p>
                Las marcas comerciales de los productos que vendemos pertenecen a sus respectivos fabricantes. La
                mención de dichas marcas no implica ningún tipo de asociación o patrocinio con JD Sport.
              </p>
            </Section>

            <Section id="responsabilidad" title="7. Limitación de responsabilidad">
              <p>
                JD Sport no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o
                imposibilidad de uso del servicio, incluyendo lucro cesante, pérdida de datos o interrupción del negocio.
              </p>
              <p>
                La responsabilidad total de JD Sport ante cualquier reclamación no excederá el valor pagado por el
                producto o servicio objeto de la reclamación.
              </p>
              <p>
                JD Sport no se responsabiliza por situaciones de fuerza mayor, eventos naturales, fallas en servicios
                de terceros (transportadoras, pasarelas de pago) o cualquier circunstancia fuera de su control razonable.
              </p>
            </Section>

            <Section id="ley" title="8. Ley aplicable y jurisdicción">
              <p>
                Estos términos se rigen e interpretan de conformidad con las leyes de la República de Colombia,
                en particular la Ley 1480 de 2011 (Estatuto del Consumidor), el Código de Comercio y demás
                normas aplicables al comercio electrónico.
              </p>
              <p>
                Para cualquier controversia derivada de estos términos, las partes intentarán resolverla
                amistosamente. De no lograrse, se someterán a la jurisdicción de los tribunales competentes
                de la ciudad de Medellín, Antioquia, Colombia.
              </p>
              <p>
                Para consultas sobre estos términos, puedes contactarnos en:{' '}
                <a href="mailto:almacenjdsport@gmail.com" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
                  almacenjdsport@gmail.com
                </a>
              </p>
            </Section>

            {/* Related */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/privacidad"
                className="flex-1 border border-white/10 px-5 py-4 hover:border-white/25 hover:bg-white/[0.02] transition-colors group"
              >
                <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Ver también</p>
                <p className="text-white text-sm font-bold tracking-wide group-hover:text-white/80 transition-colors">
                  Política de Privacidad →
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
