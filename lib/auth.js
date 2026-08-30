import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from './api';

function parseJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const useAuth = create(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      _hasHydrated: false,

      async login(email, password) {
        const res = await api.post('/usuarios/login', { email, password });
        const token = res.data.access_token;
        const usuario = res.data.usuario;
        set({ token, usuario });
        return res.data;
      },

      async registro(datos) {
        const res = await api.post('/auth/registro/', datos);
        const token = res.data.token ?? res.data.access ?? null;
        const usuario = res.data.user ?? res.data.usuario ?? null;
        if (token) {
          set({ token, usuario });
        }
        return res.data;
      },

      logout() {
        set({ usuario: null, token: null });
      },

      setAuth(usuario, token) {
        set({ usuario, token });
      },

      isAuthenticated() {
        const { token } = get();
        if (!token) return false;
        const exp = parseJwtExp(token);
        if (exp && Date.now() > exp) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'jd-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usuario: state.usuario, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          const exp = parseJwtExp(state.token);
          if (exp && Date.now() > exp) {
            useAuth.setState({ usuario: null, token: null, _hasHydrated: true });
            return;
          }
        }
        useAuth.setState({ _hasHydrated: true });
      },
    }
  )
);
