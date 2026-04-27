<div align="center">

# 💎 JD Sport — E-commerce Platform Frontend

### Plataforma full-stack de comercio electrónico en producción

[![Live](https://img.shields.io/badge/🌐_Live-almacenjdsport.com-1E40AF?style=for-the-badge)](https://almacenjdsport.com)
[![API](https://img.shields.io/badge/⚡_API-api.almacenjdsport.com-2563EB?style=for-the-badge)](https://api.almacenjdsport.com)
[![Monitoring](https://img.shields.io/badge/📊_Grafana-Dashboard-F46800?style=for-the-badge)](http://67.207.91.173:3000)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Hosted-0080FF?style=flat-square&logo=digitalocean&logoColor=white)

<br/>

**E-commerce real en producción** para un almacén de ropa deportiva en Medellín, Colombia.  
Desarrollado individualmente — backend, frontend, infraestructura, CI/CD y monitoreo.

</div>

---

## 📸 Screenshots

| Home | Productos | Admin Dashboard |
|------|-----------|-----------------|
| ![Home](https://almacenjdsport.com/og-image.png) | Catálogo con filtros y búsqueda | Panel con métricas en tiempo real |

---

## 🏗️ Arquitectura

```
Usuario → almacenjdsport.com (Vercel/CDN)
              ↓ API calls
         api.almacenjdsport.com
              ↓
         Nginx (SSL + Rate Limiting)
              ↓
         FastAPI (Docker)
              ↓
         PostgreSQL (Docker)
              ↓
         Prometheus → Grafana (Monitoreo)
```

| Componente | Tecnología | Hosting |
|-----------|-----------|---------|
| Frontend | Next.js 16 + Tailwind CSS | Vercel (CDN global) |
| Backend | FastAPI + SQLAlchemy | DigitalOcean (Docker) |
| Base de datos | PostgreSQL 16 | DigitalOcean (Docker) |
| Reverse Proxy | Nginx + Let's Encrypt SSL | DigitalOcean |
| Pagos | Wompi (producción) | — |
| Imágenes | Cloudinary | — |
| Monitoreo | Prometheus + Grafana | DigitalOcean (Docker) |
| CI/CD Backend | GitHub Actions + SSH | GitHub → DigitalOcean |
| CI/CD Frontend | Vercel Auto-deploy | GitHub → Vercel |

---

## ⚡ Stack Técnico

### Backend
```
Python 3.11 · FastAPI · SQLAlchemy 2 (async) · PostgreSQL 16 · Alembic
Uvicorn · Pydantic 2 · JWT (python-jose) · bcrypt · SlowAPI (rate limiting)
WeasyPrint (PDF) · dnspython (email validation) · prometheus-fastapi-instrumentator
```

### Frontend
```
Next.js 16 · React 19 · Tailwind CSS 4 · Zustand 5 (state management)
Axios · Recharts (admin charts)
```

### Infraestructura
```
Docker · Docker Compose · Nginx · Let's Encrypt · Certbot
Prometheus · Grafana · GitHub Actions · Vercel · DigitalOcean
```

---

## 🔥 Funcionalidades

### Cliente
- 🛍️ Catálogo con filtros por género, categoría y **búsqueda por nombre**
- 👤 Registro con **validación de email real** (DNS MX lookup)
- 🔐 Login con JWT (30 min expiración)
- 🛒 Carrito de compras persistente
- 💳 Pago online con **Wompi** (producción)
- 🏪 Separar productos para pagar en tienda física (reserva 48h)
- 🧾 Checkout como invitado (sin registro)
- 📦 Historial de pedidos con estado en tiempo real
- 📱 Contacto por WhatsApp desde pedidos
- 🔑 Recuperar contraseña por email
- ↩️ Solicitudes de cambio y devolución

### Administrador
- 📊 Dashboard con métricas: ventas, pedidos por estado, stock bajo
- 📦 CRUD completo de productos (múltiples imágenes, tallas, stock)
- 🗂️ CRUD de categorías
- 📋 Gestión de pedidos: confirmar pago, cambiar estado, cancelar reserva
- 👥 Gestión de clientes: activar/desactivar
- 🔄 Gestión de solicitudes (cambios/devoluciones)
- 📧 Notificaciones automáticas por email
- 🧾 Generación de facturas PDF

---

## 🔒 Seguridad

Se identificaron y corrigieron **12 vulnerabilidades** antes del lanzamiento:

| Severidad | Vulnerabilidad | Solución |
|-----------|---------------|----------|
| 🔴 Crítica | Secret key hardcodeada | Generación aleatoria en .env |
| 🔴 Crítica | URLs hardcodeadas a localhost | Centralizada con env vars |
| 🔴 Crítica | OpenAPI expuesto en producción | Deshabilitado en prod |
| 🟠 Alta | Webhook sin verificación de firma | Verificación obligatoria |
| 🟠 Alta | CORS abierto a cualquier origen | Restringido a dominios reales |
| 🟠 Alta | DEBUG=True en producción | False por defecto |
| 🟠 Alta | Sin rate limiting | 3-10 req/min por endpoint |
| 🟡 Media | JWT 24h expiración | Reducido a 30 minutos |
| 🟡 Media | CSP permite unsafe-eval | Removido |
| 🟡 Media | Pool de BD pequeño | 20 conexiones + pool_pre_ping |
| 🟡 Media | Sin cascade delete | Cascade en pedidos |
| 🟡 Media | Sin validación de email | DNS MX lookup |

**Headers de seguridad:** HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP, Permissions-Policy

---

## 📊 Monitoreo (Prometheus + Grafana)

Dashboard en tiempo real con:

| Panel | Métrica |
|-------|---------|
| Requests/s | `rate(http_requests_total[1m])` |
| Latencia promedio | `rate(duration_sum) / rate(duration_count)` |
| Total Requests | `sum(http_requests_total)` |
| Errores 5xx | `sum(http_requests_total{status=~"5.."})` |
| Latencia P95 | `histogram_quantile(0.95, ...)` |
| Usuarios Activos | `active_users_total` |
| Requests por endpoint | `sum by (handler) (http_requests_total)` |

---

## 🧪 Pruebas de Estrés (k6)

```
Escenario: 0 → 20 → 50 → 100 → 100 → 0 usuarios virtuales (3.5 min)
```

| Métrica | Resultado |
|---------|-----------|
| Total requests | **8,960** |
| Tasa de error | **0.00%** |
| Throughput | **42.5 req/s** |
| Latencia promedio | 1.18s |
| Latencia P95 | 2.31s |
| Checks passed | **100%** (5/5 endpoints) |

✅ **0% errores bajo 100 usuarios simultáneos**

---

## 🚀 CI/CD Pipeline

```
Developer pushes code
        ↓
   ┌────────────┐     ┌──────────────┐
   │  Frontend   │     │   Backend    │
   │  (Vercel)   │     │  (GH Actions)│
   └──────┬─────┘     └──────┬───────┘
          ↓                   ↓
   Auto-deploy          SSH → Droplet
   + CDN purge          git pull + rebuild
          ↓                   ↓
   almacenjdsport.com    api.almacenjdsport.com
```

---

## 🛠️ Desarrollo Local

### Backend
```bash
cd JD_Sport_Ecommers
docker-compose up --build
# API disponible en http://localhost:8000
# Admin panel en http://localhost:8000/admin
```

### Frontend
```bash
cd jd-sport-frontend
npm install
npm run dev
# App disponible en http://localhost:3000
```

### Variables de entorno (Backend)
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/jd_sport
SECRET_KEY=tu_clave_secreta
ALLOWED_ORIGINS=["http://localhost:3000"]
MAIL_USERNAME=tu@gmail.com
MAIL_PASSWORD=app_password
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Variables de entorno (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 📁 Estructura del Proyecto

```
Backend (FastAPI)                    Frontend (Next.js)
├── app/                             ├── app/
│   ├── api/routes/                  │   ├── page.js (Home)
│   │   ├── usuarios.py              │   ├── productos/
│   │   ├── productos.py             │   ├── carrito/
│   │   ├── pedidos.py               │   ├── login/
│   │   ├── pagos.py                 │   ├── registro/
│   │   ├── categorias.py            │   ├── mis-pedidos/
│   │   └── solicitudes.py           │   └── admin/
│   ├── core/                        │       ├── dashboard/
│   │   ├── config.py                │       ├── productos/
│   │   └── security.py              │       ├── pedidos/
│   ├── models/models.py             │       └── clientes/
│   ├── schemas/schemas.py           ├── components/
│   ├── services/                    │   ├── Navbar.js
│   │   ├── email_service.py         │   ├── Footer.js
│   │   ├── wompi_service.py         │   └── ProductCard.js
│   │   └── factura_service.py       └── lib/
│   └── main.py                          ├── api.js
├── docker-compose.prod.yml              ├── auth.js
├── Dockerfile                           └── carrito.js
└── .github/workflows/deploy.yml
```

---

## 📈 Base de Datos

```
usuarios ──→ pedidos ──→ items_pedido ──→ productos ──→ categorias
                │                              │
                ├──→ pagos                     ├──→ tallas_producto
                └──→ solicitudes               └──→ imagenes_producto
```

**Estados de pedido:** `pendiente` → `separado` → `pagado` → `enviado` → `entregado` | `cancelado`

---

## 🌍 Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://almacenjdsport.com |
| API | https://api.almacenjdsport.com |
| Admin Panel | https://api.almacenjdsport.com/admin/ |
| Grafana | http://67.207.91.173:3000 |

**Infraestructura:** DigitalOcean Droplet ($12/mes) + Vercel (gratis) + Namecheap (dominio)

---

<div align="center">

**Desarrollado por [John Garcia](https://github.com/johngarciaing85)**

FastAPI · Next.js · PostgreSQL · Docker · Prometheus · Grafana · Wompi · Cloudinary

</div>
