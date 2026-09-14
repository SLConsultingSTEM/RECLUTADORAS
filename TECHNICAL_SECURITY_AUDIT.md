# TECHNICAL_SECURITY_AUDIT.md

Fecha: 2026-09-11  
Alcance: repositorio `RECLUTADORAS` (SPA frontend).  
Backend Go, base de datos, infraestructura de despliegue real: **NO VERIFICADO** (no están en este repo).

---

## Executive Summary

Aplicación **frontend-only** (React 19 + TypeScript strict + Vite 8) con arquitectura por módulos (`domain` / `application` / `infrastructure` / `presentation`). Consume una API Go externa o mocks locales.

El código muestra buena separación de responsabilidades y tipado estricto, pero **no está listo para producción** sin endurecer el backend (authz, rate limit, secretos) y el hosting (HTTPS, CSP/HSTS reales). En este repo se corrigieron fallos de build TypeScript, defaults inseguros de mock, XSS en HTML de proyectos, validación de login/URLs y se añadieron tests + CI básicos.

| Dimensión | Puntuación | Nota |
| --- | --- | --- |
| Security | **6.5/10** | Controles frontend mejorados; authz real depende del backend |
| Code Quality | **7.5/10** | Strict TS; quedan warnings Oxlint de hooks |
| Architecture | **7.5/10** | Capas claras; sin overengineering grave |
| Performance | **6.5/10** | Bundle principal >500 kB; falta más code-splitting |
| Testing | **4.0/10** | 9 tests unitarios críticos; sin E2E/API |
| Maintainability | **7.0/10** | README usable; módulos grandes en formularios |
| Production Readiness | **5.5/10** | Build OK; faltan backend verificado + hosting hardening |

---

## Critical Findings

### C-01 — Autorización solo en cliente (Broken Access Control / BOLA potencial)
- **Ubicación:** `src/app/guards/RequireAuth.tsx`, `RequireCoordinadora.tsx`, `sessionStorage.ts`
- **Problema:** El rol y el token viven en `sessionStorage`. Un usuario puede manipular el JSON local y ver UI de coordinadora. Si la API no revalida JWT/roles, hay escalación.
- **Tipo:** vulnerabilidad potencial (confirmada en frontend; backend **NO VERIFICADO**)
- **Riesgo:** escalación vertical / acceso a `/admin` y mutaciones
- **Solución recomendada:** JWT firmado con claims de rol; authz DENY-BY-DEFAULT en cada endpoint Go; no confiar en el rol del cliente
- **Estado:** documentado; no corregible solo en este repo
- **Dificultad:** media (backend) · **Regresión:** baja si se mantiene contrato de API

### C-02 — Mocks / credenciales demo en bundle
- **Ubicación:** `src/modules/auth/infrastructure/MockAuthRepository.ts`, `src/shared/config/env.ts` (antes default `useMock=true` siempre)
- **Problema:** Credenciales demo hardcodeadas. Si un build de producción se publica con mocks, cualquiera autentica.
- **Tipo:** vulnerabilidad confirmada en escenario de configuración incorrecta
- **Estado:** **MITIGADO** — default mock solo en `DEV`; warning en `PROD` si `VITE_USE_MOCK=true`

---

## High Priority Findings

### H-01 — XSS vía `dangerouslySetInnerHTML` en indicaciones
- **Ubicación:** `src/modules/proyectos/presentation/ProyectoInfo.tsx` (`IndicacionesPanel`)
- **Problema:** Se renderizaba HTML de `leadHtml` / ítems sin re-sanitizar en el punto de inyección. Además, bajo algunos motores DOM, DOMPurify no elimina de forma fiable `javascript:` / `<script>`.
- **Tipo:** vulnerabilidad potencial (Stored XSS si `descripcionHtml` viene contaminada del API/admin)
- **Estado:** **CORREGIDO** — `sanitizeHtml` en render + hooks + capa `hardenHtml`; tests unitarios

### H-02 — URLs de media no validadas (`javascript:`, data SVG, etc.)
- **Ubicación:** `PiezaGraficaPanel.tsx`, `ProyectoInfo.tsx`, `AdminPage.tsx`
- **Problema:** `imagenUrl` se usaba directo en `src`/`href`.
- **Estado:** **CORREGIDO** — `safeMediaUrl` / `isSafeMediaUrl`

### H-03 — Respuesta de login sin validación runtime
- **Ubicación:** `ApiAuthRepository.ts`
- **Problema:** Cast a `LoginResponse` sin Zod; un API comprometido podía devolver rol arbitrario.
- **Estado:** **CORREGIDO** — schema Zod + allowlist de roles

### H-04 — Enumeración de usuarios en login
- **Ubicación:** `MockAuthRepository.ts`, `ApiAuthRepository.ts`
- **Problema:** Mensajes distintos para usuario vs contraseña.
- **Estado:** **CORREGIDO** — mensaje genérico

### H-05 — Build roto (TypeScript)
- **Ubicación:** `IndicacionesEditor.tsx`, `ProyectoForm.tsx` + `noUncheckedIndexedAccess` en CSS modules
- **Estado:** **CORREGIDO**

### H-06 — Sin CI / sin tests (antes de la auditoría)
- **Estado:** **MITIGADO** — Vitest (9 tests) + `.github/workflows/ci.yml`

---

## Medium Priority Findings

### M-01 — Token en `sessionStorage` (XSS → robo de sesión)
- **Tipo:** mala práctica / riesgo residual
- **Mitigación parcial:** sanitización HTML + CSP de referencia en `vite preview`
- **Recomendación:** cookies HttpOnly Secure SameSite en API + BFF, o al menos CSP estricta en CDN

### M-02 — Upload de imagen sin límite (antes)
- **Ubicación:** `PiezaGraficaPanel.tsx`
- **Estado:** **CORREGIDO** — MIME allowlist + máx. 2 MB + nombre sanitizado  
- **Pendiente:** magic bytes reales (recomendación)

### M-03 — IDs en paths API sin encode
- **Estado:** **CORREGIDO** en `ApiProyectoRepository` con `encodeURIComponent`

### M-04 — `HttpClient` sin manejo claro de timeout/abort y `apiUrl` vacío
- **Estado:** **CORREGIDO**

### M-05 — Bundle principal >500 kB
- **Tipo:** optimización
- **Evidencia:** warning de Vite en build (`index-*.js` ~504 kB)
- **Recomendación:** lazy-load de paneles pesados (`ProyectoForm`, seguimiento)

### M-06 — Warnings Oxlint (`set-state-in-effect`, exhaustive-deps)
- **Tipo:** calidad
- **Estado:** no corregidos masivamente (alto riesgo de regresión UX)

### M-07 — Vitest 3 / `@vitest/mocker` moderate CVE
- **Evidencia:** `npm audit` (devDependency)
- **Acción:** no forzar Vitest 5 (breaking) sin migración; riesgo bajo (solo CI/local)
- **Prod audit:** `npm audit --omit=dev` → **0 vulnerabilidades**

### M-08 — Ruta `/admin` sin entrada de navegación visible
- **Ubicación:** `AppLayout.tsx` vs `router.tsx`
- **Tipo:** UX / posible código semi-abandonado vs feature oculta
- **NO VERIFICADO** si es intencional

---

## Low Priority Findings

### L-01 — Comentarios `eslint-disable` con Oxlint
- **Ubicación:** `NuevoRegistroPage.tsx`, `CampoFormTile.tsx`, `OpcionesMultiSelect.tsx`

### L-02 — `@types/dompurify` posiblemente redundante (DOMPurify 3 trae tipos)
- **Acción recomendada:** evaluar eliminación en limpieza de deps

### L-03 — Fuente Montserrat ~689 kB en assets
- **Optimización:** subset / woff2 variable

### L-04 — README era template Vite; mock latency artificial
- **Estado README:** actualizado

### L-05 — Sin Docker / sin HSTS en hosting real
- **Alcance infra:** fuera del repo

---

## Dependencies

| Dependencia | Actual | Recomendada | Vulnerabilidad | Breaking | Acción |
| --- | --- | --- | --- | --- | --- |
| react / react-dom | 19.2.8 | 19.2.x | ninguna conocida | — | mantener |
| react-router-dom | 7.18.3 | 7.x | ninguna conocida | — | mantener |
| zod | 4.5.4 | 4.x | ninguna conocida | — | mantener |
| dompurify | 3.4.15 | 3.x | ninguna conocida | — | mantener + hardenHtml |
| vite | 8.2.2 | 8.x | ninguna conocida | — | mantener |
| typescript | ~6.0.2 | 6.x | — | — | mantener |
| oxlint | ^1.79 | latest 1.x | — | — | mantener |
| vitest | 3.2.7 | 5.x (opcional) | moderate (mocker, **dev**) | sí | diferir major |
| happy-dom | 20.14.3 | ≥20.14.3 | CVEs antiguos en ≤20.8.8 | 18→20 hecho | mantener parcheado |

Lockfile: `package-lock.json` presente. Scripts `postinstall` sospechosos: solo `esbuild` (esperado).

---

## Architecture Findings

**Fortalezas**
- Capas por módulo y factories mock/API (`*RepositoryFactory`)
- Guards de ruta + lazy `AdminPage`
- Zod en formularios de participantes
- Aliases `@app` / `@modules` / `@shared`

**Debilidades**
- Componentes muy grandes (`ProyectoForm.tsx`, paneles de seguimiento)
- Authz efectiva no puede vivir solo en SPA
- Contrato API Go no versionado/documentado OpenAPI en el repo (**NO VERIFICADO**)
- Sin capa de logging/observabilidad frontend (Sentry, etc.)

---

## Security Findings

| ID | Severidad | Confirmación | Tema |
| --- | --- | --- | --- |
| C-01 | CRITICAL | potencial | AuthZ solo cliente |
| C-02 | CRITICAL* | condicional | Mocks en producción |
| H-01 | HIGH | potencial→mitigado | XSS HTML proyectos |
| H-02 | HIGH | potencial→mitigado | URL media insegura |
| H-03 | HIGH | mitigado | Login response untrusted |
| H-04 | HIGH | mitigado | User enumeration |
| M-01 | MEDIUM | residual | Token sessionStorage |
| — | — | N/A en repo | SQLi, SSRF server, CSRF cookie API |

\* Crítico solo si se despliega con mocks.

**Superficies de ataque (frontend):** login, HTML de proyectos, uploads data URL, manipulación de sesión, llamadas `fetch` a `VITE_API_URL`.

---

## Performance Findings

1. Chunk principal ~500 kB minificado — code-split rutas/formularios.
2. Fuente TTF pesada — convertir/subset a woff2.
3. Mocks con `localStorage` + latencia artificial — OK en demo, no en prod.
4. Re-renders: warnings de effects; medir con Profiler antes de micro-optimizar.

---

## Testing Gaps

Cubierto ahora: URLs seguras, sanitización HTML, roles admin, integridad básica de sesión.

**Falta (prioridad):**
1. Login use case + mapeo de errores API
2. Guards `RequireAuth` / `RequireCoordinadora` (RTL)
3. Schema Zod de participante (requeridos / teléfono)
4. `HttpClient` timeout / 401
5. E2E Playwright (login → registro → listado)
6. Tests de contrato contra API Go (cuando exista staging)

---

## Changes Applied

1. Fix TS build: CSS module classes con `noUncheckedIndexedAccess` (`IndicacionesEditor`, `ProyectoForm`).
2. `env.ts`: mock por defecto solo en DEV; warning en PROD.
3. `sanitize.ts`: createDOMPurify + hooks + `hardenHtml`.
4. `ProyectoInfo.tsx`: sanitizar en cada `dangerouslySetInnerHTML`; `safeMediaUrl`.
5. `url.ts` + tests: allowlist de URLs de media.
6. `PiezaGraficaPanel.tsx`: MIME, tamaño 2 MB, nombre seguro, URLs seguras.
7. `AdminPage.tsx`: validar `imagenUrl` al guardar.
8. `ApiAuthRepository.ts`: Zod + mensaje genérico.
9. `MockAuthRepository.ts`: sin enumeración de usuarios.
10. `ApiProyectoRepository.ts`: `encodeURIComponent` en IDs.
11. `HttpClient.ts`: `apiUrl` obligatorio, timeout/abort, `credentials: 'omit'`.
12. Vitest + tests de seguridad/roles/sesión.
13. CI GitHub Actions (`lint` → `typecheck` → `test` → `audit:deps` → `build`).
14. Headers de seguridad en `vite preview`.
15. README y `.env.example` orientados a producción.
16. Upgrade `happy-dom` por CVEs críticos.

---

## Changes NOT Applied

| Cambio | Motivo |
| --- | --- |
| Authz real / JWT HttpOnly | Requiere backend Go + decisión de producto |
| Rate limiting login | Infra/API |
| Magic-byte validation de imágenes | Complejidad; MIME+size ya aplicados |
| Vitest 5 | Breaking change; CVE solo en tooling |
| Refactor masivo de hooks Oxlint | Alto riesgo de regresión UX |
| Code-splitting agresivo del bundle | Decisión de diseño; no bloquea seguridad |
| Eliminar `/admin` o añadirlo al nav | Decisión de producto |
| OpenAPI / contrato API | No hay backend en repo |
| Docker multi-stage | No solicitado / sin target de deploy |
| CSP meta en `index.html` | Puede romper API/CDN; mejor en reverse proxy |

---

## Remaining Risks

1. **Backend no auditado** — IDOR, mass assignment, rate limit, hashing, CORS: **NO VERIFICADO**.
2. **Token en sessionStorage** — cualquier XSS futuro compromete la sesión.
3. **HTML enriquecido** — defensa en profundidad añadida; el admin aún puede introducir contenido; mantener CSP en hosting.
4. **Mock credentials** siguen en el código fuente (solo para DEV).
5. **Sin E2E** — regresiones de flujo principal posibles.
6. **Vitest moderate CVE** en dependencia de desarrollo.

---

## Recommended Next Steps

1. Auditoría del API Go (authn/authz, validación, rate limit, uploads, logs).
2. Desplegar SPA solo con `VITE_USE_MOCK=false` + HTTPS + CSP/HSTS en CDN/nginx.
3. Migrar sesión a cookie HttpOnly si el dominio lo permite (SameSite=strict/lax).
4. Ampliar tests (guards, schema participante, HttpClient) + un E2E mínimo.
5. Code-split `ProyectoForm` / paneles y optimizar fuentes.
6. Evaluar Vitest 5 cuando el changelog de migración esté claro.
7. Documentar OpenAPI del backend y alinear DTOs Zod en el cliente.

---

## Verification (post-fix)

| Check | Resultado |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (warnings no bloqueantes) |
| `npm test` | PASS (9 tests) |
| `npm run build` | PASS |
| `npm audit --omit=dev` | 0 vulnerabilities |

---

## Evidencia de arquitectura detectada

```
SPA React (Vite)
  └─ modules: auth | proyectos | participantes | admin
  └─ shared: api (HttpClient) | security | ui | config
  └─ data: Mock*Repository (localStorage) XOR Api*Repository → API Go
  └─ auth: Bearer token en sessionStorage
  └─ sin: backend, DB, Docker, ORM en este repositorio
```
