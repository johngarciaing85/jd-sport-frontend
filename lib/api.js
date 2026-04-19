/**
 * Configuración centralizada de la API.
 *
 * En desarrollo:  NEXT_PUBLIC_API_URL no está definida → usa localhost.
 * En producción:  se define en .env.production o en Vercel/DigitalOcean.
 *
 * Ejemplo .env.production:
 *   NEXT_PUBLIC_API_URL=https://api.jdsport.com/api
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || `${API_URL}`;
 