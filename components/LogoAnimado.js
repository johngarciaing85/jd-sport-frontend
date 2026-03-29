export default function LogoAnimado() {
  return (
    <div className="flex flex-col items-center select-none">
      {/* Realistic blue diamond — static, centered above letters */}
      <div className="mb-[-8px] z-10">
        <svg
          width="90"
          height="110"
          viewBox="0 0 80 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 14px rgba(50,130,255,0.7))" }}
        >
          <defs>
            {/* Table facet — bright highlight */}
            <linearGradient id="gTable" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d6eeff" />
              <stop offset="60%" stopColor="#7ab8ff" />
              <stop offset="100%" stopColor="#4090ee" />
            </linearGradient>
            {/* Left crown bezel */}
            <linearGradient id="gLeftCrown" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5599dd" />
              <stop offset="100%" stopColor="#003388" />
            </linearGradient>
            {/* Right crown bezel — slightly lighter for contrast */}
            <linearGradient id="gRightCrown" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#aad4ff" />
              <stop offset="100%" stopColor="#2255bb" />
            </linearGradient>
            {/* Left pavilion */}
            <linearGradient id="gLeftPav" x1="1" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#1144aa" />
              <stop offset="100%" stopColor="#000828" />
            </linearGradient>
            {/* Center pavilion */}
            <linearGradient id="gCenterPav" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#2d66cc" />
              <stop offset="100%" stopColor="#00041a" />
            </linearGradient>
            {/* Right pavilion */}
            <linearGradient id="gRightPav" x1="0" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#3a77dd" />
              <stop offset="100%" stopColor="#001040" />
            </linearGradient>
          </defs>

          {/* ── CROWN (top half) ── */}
          {/* Table — flat top facet */}
          <polygon points="24,30 56,30 50,13 30,13" fill="url(#gTable)" />
          {/* Left bezel */}
          <polygon points="7,30 24,30 30,13 40,4" fill="url(#gLeftCrown)" />
          {/* Right bezel */}
          <polygon points="73,30 56,30 50,13 40,4" fill="url(#gRightCrown)" />

          {/* ── GIRDLE (thin band) ── */}
          <rect x="7" y="30" width="66" height="2.5" fill="rgba(180,220,255,0.35)" />

          {/* ── PAVILION (bottom half) ── */}
          {/* Left pavilion facet */}
          <polygon points="7,32.5 24,32.5 40,96" fill="url(#gLeftPav)" />
          {/* Center pavilion facet */}
          <polygon points="24,32.5 56,32.5 40,96" fill="url(#gCenterPav)" />
          {/* Right pavilion facet */}
          <polygon points="73,32.5 56,32.5 40,96" fill="url(#gRightPav)" />

          {/* ── EDGE OUTLINES for crisp facet separation ── */}
          {/* Crown outline */}
          <polyline
            points="40,4 7,30 73,30 40,4"
            fill="none"
            stroke="rgba(180,220,255,0.5)"
            strokeWidth="0.6"
          />
          {/* Table outline */}
          <polygon
            points="24,30 56,30 50,13 30,13"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
          {/* Internal crown lines */}
          <line x1="30" y1="13" x2="7" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="50" y1="13" x2="73" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Pavilion outline */}
          <polyline
            points="7,32.5 40,96 73,32.5"
            fill="none"
            stroke="rgba(100,160,255,0.4)"
            strokeWidth="0.6"
          />
          {/* Internal pavilion lines */}
          <line x1="24" y1="32.5" x2="40" y2="96" stroke="rgba(100,160,255,0.25)" strokeWidth="0.5" />
          <line x1="56" y1="32.5" x2="40" y2="96" stroke="rgba(100,160,255,0.25)" strokeWidth="0.5" />

          {/* ── SPECULAR highlight on table ── */}
          <ellipse
            cx="36"
            cy="21"
            rx="7"
            ry="4"
            fill="rgba(255,255,255,0.22)"
            transform="rotate(-10 36 21)"
          />
        </svg>
      </div>

      {/* ── LETTERS J and D ── */}
      <div className="flex items-center gap-12 mt-2">
        <span
          className="logo-letter animate-slide-left"
          style={{
            fontSize: "clamp(4rem, 10vw, 7rem)",
            fontWeight: 900,
            fontFamily: "'Geist Sans', 'Arial Black', sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: "0 0 30px rgba(255,255,255,0.15)",
          }}
        >
          J
        </span>
        <span
          className="logo-letter animate-slide-right"
          style={{
            fontSize: "clamp(4rem, 10vw, 7rem)",
            fontWeight: 900,
            fontFamily: "'Geist Sans', 'Arial Black', sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: "0 0 30px rgba(255,255,255,0.15)",
          }}
        >
          D
        </span>
      </div>

      {/* ── SLOGAN ── */}
      <div
        className="animate-slogan flex flex-col items-center gap-1 mt-5"
        style={{ opacity: 0 }}
      >
        <p
          style={{
            fontSize: "clamp(0.6rem, 1.4vw, 0.75rem)",
            fontWeight: 300,
            fontFamily: "'Geist Sans', 'Helvetica Neue', Arial, sans-serif",
            color: "#ffffff",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Estilo y calidad en cada prenda
        </p>
        <p
          style={{
            fontSize: "clamp(0.55rem, 1.2vw, 0.68rem)",
            fontWeight: 300,
            fontFamily: "'Geist Sans', 'Helvetica Neue', Arial, sans-serif",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Para dama y caballero
        </p>
      </div>
    </div>
  );
}
