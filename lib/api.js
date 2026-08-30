import axios from 'axios';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({ baseURL: API_URL });

const INTERNAL_ERROR_PATTERNS =
  /traceback|exception|at line|file "|\/[a-z]+\.(py|js)|stack trace|internal server/i;

export function safeErrorMessage(err, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg).join(', ');
  }
  if (typeof detail === 'string' && !INTERNAL_ERROR_PATTERNS.test(detail)) {
    return detail;
  }
  const message = err.response?.data?.message;
  if (typeof message === 'string' && !INTERNAL_ERROR_PATTERNS.test(message)) {
    return message;
  }
  return fallback;
}

const ALLOWED_REDIRECT_HOSTS = ['checkout.wompi.co', 'wompi.co', 'sandbox.wompi.co'];

export function isAllowedRedirect(url) {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_REDIRECT_HOSTS.some(
      (h) => hostname === h || hostname.endsWith('.' + h)
    );
  } catch {
    return false;
  }
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file) {
  if (!file) return 'Selecciona un archivo.';
  if (file.size > MAX_IMAGE_SIZE) return 'El archivo no debe superar 5 MB.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return 'Solo se permiten archivos JPG, PNG o WEBP.';
  return null;
}

export function validatePassword(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password))
    return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(password))
    return 'Debe incluir al menos una letra minúscula.';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número.';
  return null;
}
