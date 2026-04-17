'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCarrito, selectTotal, selectCantidadTotal } from '@/lib/carrito';
import { useAuth } from '@/lib/auth';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtCOP(n) { return `$${Number(n).toLocaleString('es-CO')}`; }

/* ─── City catalog ───────────────────────────────────────────────────────── */
const CIUDADES_GRUPOS = [
  {
    grupo: 'Medellín y Área Metropolitana',
    ciudades: ['Medellín','Envigado','Itagüí','Bello','Sabaneta','La Estrella','Copacabana','Caldas','Girardota','Barbosa'],
  },
  {
    grupo: 'Municipios de Antioquia',
    ciudades: ['Rionegro','Marinilla','El Retiro','Guarne','La Ceja','Santa Fe de Antioquia','Apartadó','Turbo','Caucasia','Jardín','Andes','Sonsón'],
  },
  {
    grupo: 'Otras Ciudades',
    ciudades: ['Bogotá','Cali','Barranquilla','Bucaramanga','Pereira','Manizales','Cartagena','Cúcuta','Ibagué','Pasto'],
  },
];

/* ─── Cart item ──────────────────────────────────────────────────────────── */
function CartItem({ item }) {
  const { quitar, actualizarCantidad } = useCarrito();
  const imgSrc = item.imagen_url ?? item.imagen ?? null;

  return (
    <div className="flex gap-4 py-6 border-b border-white/10 last:border-0">
      <div className="shrink-0 w-20 bg-[#111] border border-white/10 overflow-hidden" style={{ height: 104 }}>
        {imgSrc ? (
          <img src={imgSrc} alt={item.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-xl font-black">JD</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-white text-sm font-medium tracking-wide leading-snug mb-1">{item.nombre}</h3>
            {item.talla && item.talla !== 'Única' && (
              <p className="text-white/30 text-xs tracking-widest uppercase">Talla: {item.talla}</p>
            )}
          </div>
          <button onClick={() => quitar(item.id, item.talla)}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5" aria-label="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-white/15">
            <button onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad - 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base">−</button>
            <span className="w-8 text-center text-white text-xs font-medium">{item.cantidad}</span>
            <button onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad + 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base">+</button>
          </div>
          <span className="text-white font-bold text-sm">{fmtCOP(item.precio * item.cantidad)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Order summary ──────────────────────────────────────────────────────── */
function OrderSummary({ subtotal, tarifaEnvio, ciudad, onCheckout }) {
  const totalConEnvio = subtotal + tarifaEnvio;
  return (
    <div className="bg-[#0d0d0d] border border-white/10 p-6 sticky top-24">
      <h2 className="text-white font-bold text-sm tracking-[0.2em] uppercase mb-6">Resumen del pedido</h2>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Subtotal productos</span>
          <span className="text-white">{fmtCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm items-start gap-2">
          <span className="text-white/50 shrink-0">Envío</span>
          {tarifaEnvio > 0 ? (
            <span className="text-white text-xs text-right">
              a {ciudad}: <span className="font-bold">{fmtCOP(tarifaEnvio)}</span>
            </span>
          ) : (
            <span className="text-white/35 text-xs italic text-right">A calcular según ciudad</span>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 pt-4 mb-6">
        <div className="flex justify-between">
          <span className="text-white font-bold text-sm tracking-wide uppercase">Total</span>
          <span className="text-white font-black text-xl">{fmtCOP(totalConEnvio)}</span>
        </div>
        {tarifaEnvio === 0 && (
          <p className="text-white/25 text-[10px] tracking-wide mt-1 text-right">+ envío según ciudad</p>
        )}
      </div>
      <button onClick={onCheckout}
        className="w-full py-4 bg-white text-black text-xs font-black tracking-[0.3em] uppercase hover:bg-white/90 transition-colors">
        Ir a método de pago
      </button>
      <p className="text-white/20 text-[10px] tracking-wide text-center mt-4">
        Elige cómo quieres pagar tu pedido.
      </p>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="text-white/10 mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <p className="text-white/30 text-sm tracking-wide mb-8">Tu carrito está vacío</p>
      <Link href="/productos"
        className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors">
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

/* ─── Guest/Auth choice modal ─────────────────────────────────────────────── */
function AuthChoiceModal({ onGuest, onLogin, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Checkout</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">¿Cómo quieres continuar?</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          <button
            onClick={onGuest}
            className="flex items-start gap-4 p-4 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] text-left transition-colors group"
          >
            <span className="text-white/40 group-hover:text-white/70 transition-colors mt-0.5 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <div>
              <p className="text-white text-sm font-bold tracking-wide mb-1">Continuar como invitado</p>
              <p className="text-white/40 text-xs tracking-wide leading-relaxed">Sin necesidad de crear una cuenta.</p>
            </div>
          </button>

          <button
            onClick={onLogin}
            className="flex items-start gap-4 p-4 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] text-left transition-colors group"
          >
            <span className="text-white/40 group-hover:text-white/70 transition-colors mt-0.5 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </span>
            <div>
              <p className="text-white text-sm font-bold tracking-wide mb-1">Tengo cuenta / Registrarme</p>
              <p className="text-white/40 text-xs tracking-wide leading-relaxed">Inicia sesión para un checkout más rápido.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Address form ───────────────────────────────────────────────────────── */
function AddressForm({ fields, onChange, isGuest, showEnvio = true, ciudad, onCiudadChange, tarifaEnvio, infoEnvio, onEnvioFound, ciudadError }) {
  const INPUT    = 'w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide';
  const SELECT   = 'w-full bg-[#111] border text-sm px-4 py-2.5 focus:outline-none transition-colors tracking-wide appearance-none cursor-pointer pr-10';
  const [fetching, setFetching] = useState(false);

  const handleCiudadChange = async (value) => {
    onCiudadChange(value);
    if (!value) { onEnvioFound(0, null); return; }
    setFetching(true);
    try {
      const res = await axios.post('http://localhost:8000/api/envios/calcular', { ciudad: value });
      onEnvioFound(res.data.tarifa ?? 0, res.data);
    } catch {
      onEnvioFound(0, null);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {isGuest && (
        <>
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Nombre completo *</label>
            <input type="text" value={fields.nombre} onChange={(e) => onChange('nombre', e.target.value)}
              placeholder="Juan Pérez" className={INPUT} />
          </div>
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Email *</label>
            <input type="email" value={fields.email} onChange={(e) => onChange('email', e.target.value)}
              placeholder="juan@ejemplo.com" className={INPUT} />
            <p className="text-white/25 text-[9px] mt-1">Te enviaremos la confirmación de tu pedido</p>
          </div>
        </>
      )}
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Celular *</label>
        <input type="tel" value={fields.celular} onChange={(e) => onChange('celular', e.target.value)}
          placeholder="300 123 4567" className={INPUT} />
      </div>

      {/* ── City selector (delivery only) ── */}
      {showEnvio && <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Ciudad de entrega *</label>
        <div className="relative">
          <select
            value={ciudad}
            onChange={(e) => handleCiudadChange(e.target.value)}
            className={`${SELECT} ${ciudadError ? 'border-[#f87171]/60 text-white' : 'border-white/15 text-white'}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff60' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            <option value="" style={{ background: '#111', color: '#ffffff60' }}>Selecciona tu ciudad...</option>
            {CIUDADES_GRUPOS.map(({ grupo, ciudades }) => (
              <optgroup key={grupo} label={grupo} style={{ background: '#0d0d0d', color: '#ffffff99', fontStyle: 'normal' }}>
                {ciudades.map((c) => (
                  <option key={c} value={c} style={{ background: '#111', color: '#fff' }}>{c}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {fetching && (
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <Spinner />
            </span>
          )}
        </div>
        {ciudadError && (
          <p className="text-[#f87171] text-[10px] mt-1.5 tracking-wide">{ciudadError}</p>
        )}

        {/* Shipping info card */}
        {!fetching && ciudad && tarifaEnvio > 0 && infoEnvio && (
          <div className="mt-2 border border-white/10 bg-white/[0.03]">
            <div className="flex items-start gap-3 px-3 py-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 mt-0.5 shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="flex flex-col gap-0.5">
                <p className="text-white text-xs font-semibold tracking-wide">
                  Envío a {infoEnvio.ciudad ?? ciudad}
                </p>
                <p className="text-white/50 text-[11px] tracking-wide">
                  Costo:{' '}
                  <span className="text-white font-bold">{fmtCOP(tarifaEnvio)}</span>
                </p>
                {infoEnvio.tiempo_entrega && (
                  <p className="text-white/35 text-[10px] tracking-wide">
                    Entrega: {infoEnvio.tiempo_entrega}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {!fetching && ciudad && tarifaEnvio === 0 && infoEnvio === null && (
          <p className="text-white/30 text-[10px] mt-1.5 tracking-wide italic">Sin tarifa disponible para esta ciudad.</p>
        )}
      </div>}

      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Dirección</label>
        <input type="text" value={fields.direccion} onChange={(e) => onChange('direccion', e.target.value)}
          placeholder="Calle 10 # 5-20" className={INPUT} />
      </div>
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Barrio</label>
        <input type="text" value={fields.barrio} onChange={(e) => onChange('barrio', e.target.value)}
          placeholder="El Poblado" className={INPUT} />
      </div>
      <p className="text-white/25 text-[10px] tracking-wide leading-relaxed pt-1">
        Al continuar aceptas nuestros{' '}
        <Link href="/terminos" target="_blank" className="text-white/45 hover:text-white underline underline-offset-2 transition-colors">
          Términos y Condiciones
        </Link>
        {' '}y{' '}
        <Link href="/privacidad" target="_blank" className="text-white/45 hover:text-white underline underline-offset-2 transition-colors">
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  );
}

/* ─── Shipping breakdown ─────────────────────────────────────────────────── */
function EnvioBreakdown({ subtotal, tarifaEnvio, ciudad }) {
  const totalConEnvio = subtotal + tarifaEnvio;
  return (
    <div className="flex flex-col gap-1.5 py-3 border-y border-white/10">
      <div className="flex justify-between text-xs">
        <span className="text-white/40">Subtotal productos</span>
        <span className="text-white/70">{fmtCOP(subtotal)}</span>
      </div>
      <div className="flex justify-between text-xs items-start gap-2">
        <span className="text-white/40 shrink-0">Envío</span>
        {tarifaEnvio > 0 ? (
          <span className="text-white/70 text-right">
            a {ciudad}: <span className="font-semibold text-white">{fmtCOP(tarifaEnvio)}</span>
          </span>
        ) : (
          <span className="text-white/30 italic">A calcular</span>
        )}
      </div>
      <div className="flex justify-between text-sm pt-1 mt-0.5 border-t border-white/10">
        <span className="text-white font-bold tracking-wide">Total</span>
        <span className="text-white font-black">{fmtCOP(totalConEnvio)}</span>
      </div>
    </div>
  );
}

/* ─── Payment modal ──────────────────────────────────────────────────────── */
function MetodoPagoModal({ items, subtotal, token, isGuest, ciudad, onCiudadChange, tarifaEnvio, infoEnvio, onEnvioFound, onClose, onSuccess }) {
  const [step,        setStep]        = useState('select');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [ciudadError, setCiudadError] = useState(null);
  const [success,     setSuccess]     = useState(null);
  const [addr,        setAddr]        = useState({ nombre: '', email: '', celular: '', direccion: '', barrio: '' });

  const totalConEnvio = subtotal + tarifaEnvio;

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, loading]);

  const setField = (k, v) => setAddr((p) => ({ ...p, [k]: v }));

  const pedidoItems = items.map((i) => ({
    producto_id: i.id,
    cantidad:    i.cantidad,
    talla:       i.talla ?? null,
  }));

  /* ── Validation ── */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateAddress = () => {
    setCiudadError(null);
    if (step === 'separar') {
      if (!addr.nombre.trim())                        { setError('Ingresa tu nombre completo.'); return false; }
      if (!addr.email.trim())                         { setError('Ingresa tu email.'); return false; }
      if (!emailRegex.test(addr.email.trim()))        { setError('Ingresa un email válido (ej. juan@gmail.com)'); return false; }
      if (!addr.celular.trim())                       { setError('Ingresa tu número de celular.'); return false; }
      return true;
    }
    // wompi
    if (isGuest && !addr.nombre.trim())               { setError('Ingresa tu nombre completo.'); return false; }
    if (isGuest && !addr.email.trim())                { setError('Ingresa tu email.'); return false; }
    if (isGuest && !emailRegex.test(addr.email.trim())) { setError('Ingresa un email válido (ej. juan@gmail.com)'); return false; }
    if (!addr.celular.trim())                         { setError('Ingresa tu número de celular.'); return false; }
    if (!ciudad.trim())                               { setCiudadError('Selecciona la ciudad de entrega.'); setError('Selecciona la ciudad de entrega.'); return false; }
    if (!addr.direccion.trim())                       { setError('La dirección de entrega es obligatoria.'); return false; }
    return true;
  };

  /* ── Separar ── */
  const handleSeparar = async () => {
    if (!validateAddress()) return;
    setLoading(true);
    setError(null);
    try {
      if (isGuest) {
        const guestPayload = {
          items:       pedidoItems,
          nombre:      addr.nombre.trim(),
          email:       addr.email.trim(),
          celular:     addr.celular.trim(),
          metodo_pago: 'tienda',
        };
        console.log('[SEPARAR] guest payload:', guestPayload);
        const res = await axios.post('http://localhost:8000/api/pedidos/invitado', guestPayload);
        const pedidoId = res.data?.id ? ` #${res.data.id}` : '';
        setSuccess(`¡Reserva confirmada! Tu pedido${pedidoId} está separado por 48 horas. Revisa tu correo para los detalles.`);
      } else {
        const authPayload = {
          items:   pedidoItems,
          celular: addr.celular.trim(),
        };
        console.log('[SEPARAR] auth payload:', authPayload);
        const res = await axios.post(
          'http://localhost:8000/api/pedidos/separar',
          authPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pedidoId = res.data?.id ? ` #${res.data.id}` : '';
        setSuccess(`¡Reserva confirmada! Tu pedido${pedidoId} está separado por 48 horas. Revisa tu correo para los detalles.`);
      }
      onSuccess();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'Error al separar el pedido.'));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Wompi ── */
  const handleWompi = async () => {
    if (!validateAddress()) return;
    setLoading(true);
    setError(null);
    try {
      if (isGuest) {
        const res = await axios.post('http://localhost:8000/api/pedidos/invitado', {
          items:           pedidoItems,
          nombre:          addr.nombre.trim(),
          email:           addr.email.trim(),
          celular:         addr.celular.trim(),
          direccion_envio: [addr.direccion, addr.barrio].filter(Boolean).join(', '),
          ciudad:          ciudad.trim() || undefined,
          costo_envio:     tarifaEnvio,
          metodo_pago:     'wompi',
        });
        const wompiUrl = res.data?.wompi_url;
        if (!wompiUrl) {
          setError('No se pudo generar el link de pago. Intenta de nuevo.');
          setLoading(false);
          return;
        }
        onSuccess();
        window.location.href = wompiUrl;
      } else {
        const pedidoRes = await axios.post(
          'http://localhost:8000/api/pedidos/',
          {
            items:       pedidoItems,
            direccion:   addr.direccion.trim(),
            barrio:      addr.barrio.trim(),
            celular:     addr.celular.trim(),
            ciudad:      ciudad.trim() || undefined,
            costo_envio: tarifaEnvio,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pedidoId = pedidoRes.data?.id;
        const pagoRes = await axios.post(
          `http://localhost:8000/api/pagos/iniciar/${pedidoId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const wompiUrl = pagoRes.data?.link_pago ?? pagoRes.data?.url ?? pagoRes.data?.wompi_url ?? pagoRes.data?.redirect_url ?? pagoRes.data?.link;
        if (!wompiUrl) {
          setError('No se pudo generar el link de pago.');
          setLoading(false);
          return;
        }
        onSuccess();
        window.location.href = wompiUrl;
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'Error al procesar el pago.'));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const METHODS = [
    {
      key:   'separar',
      title: 'Separar y pagar en tienda',
      desc:  'Sin costo de envío. Reservamos tu pedido 24 horas, pagas cuando recoges.',
      icon:  (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key:   'wompi',
      title: 'Pagar con Wompi',
      desc:  'Pago seguro con tarjeta, PSE o Nequi.',
      icon:  (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
  ];

  const stepTitles = {
    wompi:   'Pagar con Wompi',
    separar: 'Separar y pagar en tienda',
  };

  // All methods collect address + city — always show form
  const needsForm = step !== 'select';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0d0d0d]">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">
              Checkout{isGuest && <span className="ml-2 text-white/20">· Invitado</span>}
            </p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              {step === 'select' ? 'Método de pago' : stepTitles[step]}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="text-white/30 hover:text-white transition-colors p-1 disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          {/* ── Success ── */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-white text-sm tracking-wide leading-relaxed">{success}</p>
              <button onClick={onClose}
                className="mt-2 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-6 py-2 transition-colors">
                Cerrar
              </button>
            </div>

          ) : step === 'select' ? (
            /* ── Method selection ── */
            <>
              <EnvioBreakdown subtotal={subtotal} tarifaEnvio={tarifaEnvio} ciudad={ciudad} />
              {METHODS.map(({ key, title, desc, icon }) => (
                <button key={key}
                  onClick={() => { setError(null); setCiudadError(null); setStep(key); }}
                  disabled={loading}
                  className="flex items-start gap-4 p-4 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] text-left transition-colors disabled:opacity-50 group">
                  <span className="text-white/40 group-hover:text-white/70 transition-colors mt-0.5 shrink-0">{icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold tracking-wide mb-1">{title}</p>
                    <p className="text-white/40 text-xs tracking-wide leading-relaxed">{desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-white/50 transition-colors mt-1 shrink-0">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
              {error && (
                <div className="px-4 py-3 text-xs border"
                  style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                  {error}
                </div>
              )}
            </>

          ) : needsForm ? (
            <>
              {step === 'separar' ? (
                /* ── Separar: contact info only ── */
                <div className="flex flex-col gap-3">
                  {(['nombre','email','celular']).map((key) => (
                    <div key={key}>
                      <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">
                        {key === 'nombre' ? 'Nombre completo *' : key === 'email' ? 'Email *' : 'Celular *'}
                      </label>
                      <input
                        type={key === 'email' ? 'email' : key === 'celular' ? 'tel' : 'text'}
                        value={addr[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder={key === 'nombre' ? 'Juan Pérez' : key === 'email' ? 'juan@ejemplo.com' : '300 123 4567'}
                        className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
                      />
                      {key === 'email' && (
                        <p className="text-white/25 text-[9px] mt-1">Te enviaremos la confirmación de tu reserva</p>
                      )}
                    </div>
                  ))}
                  {/* 48h notice */}
                  <div className="flex gap-3 px-4 py-3 mt-1 border"
                    style={{ borderColor: 'rgba(251,146,60,0.25)', background: 'rgba(251,146,60,0.06)' }}>
                    <span style={{ color: 'rgba(251,146,60,0.8)' }} className="shrink-0 mt-0.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(251,146,60,0.75)' }}>
                      Tu pedido quedará separado por <strong>48 horas</strong>. Debes acercarte a nuestra tienda física y realizar el pago antes de que expire la reserva. Recibirás un correo de confirmación.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Wompi: full address + shipping ── */
                <>
                  <EnvioBreakdown subtotal={subtotal} tarifaEnvio={tarifaEnvio} ciudad={ciudad} />
                  <AddressForm
                    fields={addr}
                    onChange={setField}
                    isGuest={isGuest}
                    showEnvio={true}
                    ciudad={ciudad}
                    onCiudadChange={onCiudadChange}
                    tarifaEnvio={tarifaEnvio}
                    infoEnvio={infoEnvio}
                    onEnvioFound={onEnvioFound}
                    ciudadError={ciudadError}
                  />
                </>
              )}
              {error && (
                <div className="px-4 py-3 text-xs border"
                  style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setStep('select'); setError(null); }} disabled={loading}
                  className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40">
                  Volver
                </button>
                <button
                  onClick={step === 'wompi' ? handleWompi : handleSeparar}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading && <Spinner />}
                  {loading ? 'Procesando...' : step === 'wompi' ? 'Ir a Wompi' : 'Confirmar reserva'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CarritoPage() {
  const router   = useRouter();
  const items    = useCarrito((s) => s.items);
  const vaciar   = useCarrito((s) => s.vaciar);
  const subtotal = useCarrito(selectTotal);
  const { usuario, token } = useAuth();

  const [mounted,      setMounted]      = useState(false);
  const [authChoice,   setAuthChoice]   = useState(false);
  const [pagoModal,    setPagoModal]    = useState(false);
  const [isGuest,      setIsGuest]      = useState(false);

  // Shipping state — lifted so sidebar and modal stay in sync
  const [ciudad,      setCiudad]      = useState('');
  const [tarifaEnvio, setTarifaEnvio] = useState(0);
  const [infoEnvio,   setInfoEnvio]   = useState(null);

  useEffect(() => setMounted(true), []);

  const handleEnvioFound = (tarifa, info) => {
    setTarifaEnvio(tarifa);
    setInfoEnvio(info);
  };

  const handleCheckout = () => {
    if (!mounted || items.length === 0) return;
    if (token && usuario) {
      setIsGuest(false);
      setPagoModal(true);
    } else {
      setAuthChoice(true);
    }
  };

  const handleGuestChoice = () => {
    setAuthChoice(false);
    setIsGuest(true);
    setPagoModal(true);
  };

  const handleLoginChoice = () => {
    setAuthChoice(false);
    router.push('/login');
  };

  const handlePaymentSuccess = () => {
    vaciar();
  };

  return (
    <>
      {authChoice && mounted && (
        <AuthChoiceModal
          onGuest={handleGuestChoice}
          onLogin={handleLoginChoice}
          onClose={() => setAuthChoice(false)}
        />
      )}

      {pagoModal && mounted && (
        <MetodoPagoModal
          items={items}
          subtotal={subtotal}
          token={token}
          isGuest={isGuest}
          ciudad={ciudad}
          onCiudadChange={setCiudad}
          tarifaEnvio={tarifaEnvio}
          infoEnvio={infoEnvio}
          onEnvioFound={handleEnvioFound}
          onClose={() => setPagoModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">Tu selección</p>
                <h1 className="text-white font-black text-4xl uppercase tracking-tight"
                  style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}>
                  Carrito
                </h1>
              </div>
              {mounted && items.length > 0 && (
                <button onClick={vaciar}
                  className="text-white/30 hover:text-white/60 text-xs tracking-[0.2em] uppercase transition-colors">
                  Vaciar carrito
                </button>
              )}
            </div>

            {!mounted ? null : items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Items */}
                <div className="lg:col-span-2">
                  <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-4 pb-4 border-b border-white/10">
                    {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                  </p>
                  <div>
                    {items.map((item) => (
                      <CartItem key={`${item.id}-${item.talla}`} item={item} />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/productos"
                      className="text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase border-b border-white/20 hover:border-white/50 pb-0.5 transition-colors">
                      ← Seguir comprando
                    </Link>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <OrderSummary
                    subtotal={subtotal}
                    tarifaEnvio={tarifaEnvio}
                    ciudad={ciudad}
                    onCheckout={handleCheckout}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
