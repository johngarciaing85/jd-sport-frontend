'use client';
import { useState, useEffect, useRef } from 'react';

const LINES = [
  { label: 'Línea 1', href: 'https://wa.me/573177499434' },
  { label: 'Línea 2', href: 'https://wa.me/573156017912' },
];

function WhatsAppIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.347.617 4.55 1.694 6.464L2.667 29.333l7.07-1.673A13.268 13.268 0 0 0 16 29.333c7.364 0 13.333-5.969 13.333-13.333S23.364 2.667 16 2.667z"
        fill="currentColor"
      />
      <path
        d="M22.07 19.547c-.31-.155-1.83-.9-2.113-1.003-.282-.103-.487-.155-.693.155-.205.31-.797.999-1.001 1.205-.183.206-.368.232-.678.078-.31-.155-1.307-.482-2.49-1.537-.92-.82-1.54-1.833-1.72-2.143-.181-.31-.02-.478.136-.632.14-.139.31-.362.465-.543.155-.182.206-.31.309-.515.103-.206.052-.387-.026-.542-.078-.155-.693-1.672-.95-2.288-.25-.6-.504-.518-.693-.528l-.59-.01c-.206 0-.54.077-.823.387-.283.31-1.08 1.055-1.08 2.572s1.106 2.983 1.26 3.189c.155.206 2.175 3.32 5.268 4.655.736.318 1.31.508 1.758.65.739.235 1.411.202 1.942.122.592-.088 1.83-.748 2.088-1.471.258-.723.258-1.343.18-1.471-.077-.129-.283-.207-.593-.362z"
        fill="white"
      />
    </svg>
  );
}

export default function WhatsappFloat() {
  const [open, setOpen]   = useState(false);
  const wrapRef           = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Popup ── */}
      <div
        className="transition-all duration-200 origin-bottom-right"
        style={{
          opacity:    open ? 1 : 0,
          transform:  open ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(8px)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="bg-[#0d0d0d] border border-white/15 w-64 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
            style={{ background: 'rgba(37,211,102,0.08)' }}>
            <div className="flex items-center gap-2.5">
              <span style={{ color: '#25D366' }}>
                <WhatsAppIcon size={18} />
              </span>
              <div>
                <p className="text-white text-xs font-bold tracking-wide leading-none">JD Sport</p>
                <p className="text-white/40 text-[10px] tracking-wide mt-0.5">Chat en línea</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/25 hover:text-white/60 transition-colors p-0.5"
              aria-label="Cerrar"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Subtitle */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-white/50 text-[11px] tracking-wide leading-relaxed">
              ¿En qué podemos ayudarte?<br />
              <span className="text-white/30">Elige una línea de atención.</span>
            </p>
          </div>

          {/* Lines */}
          <div className="p-3 flex flex-col gap-2">
            {LINES.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-white text-xs font-bold tracking-[0.15em] uppercase transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#25D366', borderRadius: 2 }}
              >
                <WhatsAppIcon size={16} />
                {label}
              </a>
            ))}
          </div>

          {/* Tip */}
          <p className="text-white/20 text-[9px] tracking-wide text-center pb-3">
            Respuesta inmediata en horario de atención
          </p>
        </div>
      </div>

      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir WhatsApp"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/40 transition-transform hover:scale-110 active:scale-95"
        style={{
          background: '#25D366',
          animation:  open ? 'none' : 'wa-bounce 3s ease-in-out 2s infinite',
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span style={{ color: 'white' }}><WhatsAppIcon size={28} /></span>
        )}
      </button>

      <style>{`
        @keyframes wa-bounce {
          0%, 60%, 100% { transform: translateY(0);  }
          70%            { transform: translateY(-8px); }
          80%            { transform: translateY(-4px); }
          90%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
