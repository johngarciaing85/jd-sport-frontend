import "./globals.css";

export const metadata = {
  title: "Almacen Sport — Moda Urbana y Deportiva",
  description: "Tienda de ropa deportiva y casual de alta calidad para dama y caballero en Medellín.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon-192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}