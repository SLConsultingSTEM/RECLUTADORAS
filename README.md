# Portal Reclutadoras (Optima SL)

SPA de React + TypeScript para registro y seguimiento de participantes por proyecto.

## Stack

- React 19 + React Router 7
- TypeScript (strict)
- Vite 8
- Zod (validación de formularios / respuestas críticas)
- DOMPurify (sanitización HTML)
- Oxlint + Vitest

## Arquitectura

Módulos con capas:

- `domain` — tipos y reglas
- `application` — casos de uso
- `infrastructure` — API HTTP o mocks
- `presentation` — UI

Autenticación: token Bearer en `sessionStorage`. Autorización de rutas solo en frontend; el backend Go debe validar JWT/roles en cada endpoint.

## Requisitos

- Node.js 22+
- npm

## Configuración

Copie `.env.example` a `.env`:

```bash
cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | Base URL de la API Go (sin secretos) |
| `VITE_USE_MOCK` | `true` = mocks locales; `false` = API real |

Comportamiento:

- En desarrollo (`npm run dev`), si `VITE_USE_MOCK` no está definida → mocks activos.
- En build de producción, si no está definida → `false` (API real).
- No desplegar producción con `VITE_USE_MOCK=true` salvo demos controladas.

## Scripts

```bash
npm install
npm run dev          # desarrollo
npm run typecheck    # TypeScript
npm run lint         # Oxlint
npm test             # Vitest
npm run build        # producción
npm run preview      # preview local (incluye headers de seguridad básicos)
npm run audit:deps   # npm audit (prod)
```

## Credenciales mock (solo desarrollo)

Cuando los mocks están activos:

- Usuario `reclutadora` / contraseña de demo local
- Usuario `coordinadora` / contraseña de demo local

Estas credenciales viajan en el bundle del frontend mock y **no** deben usarse en producción.

## Despliegue

1. Build con `VITE_USE_MOCK=false` y `VITE_API_URL` apuntando a la API real.
2. Servir `dist/` detrás de HTTPS.
3. Configurar en el reverse proxy/CDN los headers de seguridad (CSP, HSTS, etc.). `vite preview` incluye una CSP de referencia; ajústela al host de la API.
4. Verificar que la API aplica authn/authz, rate limiting y validación de entrada.

## Seguridad (frontend)

- HTML de proyectos sanitizado con DOMPurify antes de `dangerouslySetInnerHTML`.
- URLs de piezas gráficas restringidas a rutas relativas, `http(s)` o `data:image` (sin SVG).
- Respuesta de login validada con Zod (rol en allowlist).
- Errores de login genéricos (sin enumeración de usuarios).

La autorización efectiva debe residir siempre en el backend.
