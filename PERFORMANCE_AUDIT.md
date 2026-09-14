# PERFORMANCE_AUDIT.md

## Executive Summary

Auditoría y optimización de **RECLUTADORAS** (SPA React 19 + Vite 8, CSR). No hay backend ni base de datos en este repositorio; el API Go es externo.

Tras las optimizaciones, el artefacto de producción (`VITE_USE_MOCK=false`) pasó de **~5.8 MB → ~1.0 MB** (−83 %). El JS inicial dejó de ser un monolito de ~504 KB y quedó en **~270 KB** (app + React), con rutas y Zod diferidos. La fuente crítica bajó de **689 KB TTF → 210 KB WOFF2**, y las imágenes mock de **~4.4 MB → ~385 KB WebP** (excluidas del build de API).

Lighthouse / Web Vitals de campo: **NO VERIFICADO** (no se ejecutó Lighthouse en este entorno). Las cifras de este informe son de **build de producción medido**.

---

## Baseline

Medido con `npm run build` **antes** de optimizar:

| Métrica | Valor |
| --- | --- |
| `dist/` total | ~5.8 MB |
| JS principal | `index-*.js` **503.74 KB** (gzip **153.61 KB**) |
| CSS principal | `index-*.css` **132.29 KB** (gzip **22.32 KB**) |
| Fuente | Montserrat variable **TTF 688.60 KB** |
| Imágenes mock (`dist/proyectos`) | ~4.4 MB (PNG/JPEG sin optimizar) |
| Logo login | PNG **20.65 KB** |
| Code splitting | Solo `AdminPage` (~5.8 KB) |
| Lighthouse / CWV | NO VERIFICADO |
| Requests runtime | NO VERIFICADO (sin servidor de API local) |

---

## Critical Bottlenecks

| Severidad | Ubicación | Problema | Impacto | Solución aplicada | Dificultad | Riesgo |
| --- | --- | --- | --- | --- | --- | --- |
| CRITICAL | `public/proyectos/*` | 5 imágenes 650 KB–1.4 MB | LCP / transfer | WebP + resize 1200px; omitir en build API | Baja | Bajo |
| CRITICAL | `Montserrat-*.ttf` | 689 KB TTF en critical path | FCP / LCP | WOFF2 + preload + `font-display: swap` | Baja | Bajo |
| CRITICAL | `router.tsx` | Panel + NuevoRegistro eager | JS inicial | `React.lazy` + Suspense | Baja | Bajo |
| HIGH | Panel resumen + lista | Doble `list()` participantes | Red / TTFB percibido | Caché/dedupe + filtro cliente | Media | Medio |
| HIGH | `SeguimientoPanel` | Delay artificial 2600 ms | INP / UX | Eliminado | Baja | Bajo |
| HIGH | Bundle monolítico | Sin `manualChunks` | Caché / parse | Vendor React + Zod + DOMPurify | Baja | Bajo |
| HIGH | `ApiAuthRepository` | Zod en grafo de login | JS inicial | Parse manual del login | Baja | Bajo |
| MEDIUM | `HttpClient` | `cache: 'no-store'` siempre | Red | GET usa `default` | Baja | Medio |
| MEDIUM | Imágenes UI | Sin `width`/`height`/`loading` | CLS / LCP | Atributos + lazy en no-LCP | Baja | Bajo |
| MEDIUM | CSS Forms | CSS de formularios en main | CSS inicial | Code-split con rutas lazy | Baja | Bajo |
| LOW | Factories Mock+Api | Mock en grafo prod | Bundle | No aplicado (require/async rompe sync) | Media | Medio |
| LOW | Backend / DB | Fuera de repo | — | NO APLICABLE aquí | — | — |

---

## Images

### Antes
| Archivo | Tamaño | Dimensiones |
| --- | --- | --- |
| `bebidanoche.png` | 1.4 MB | 1081×1081 |
| `reclutadoras-etapa-cero.png` | 836 KB | 1080×1081 |
| `piezareclu.jpg` | 816 KB | 1081×1351 |
| `RCL.png` | 707 KB | 1080×1080 |
| `reclutadoras-rn.png` | 652 KB | 1080×1350 |
| `logoOptimaNegro.png` | 21 KB | 590×188 |
| `logoIzq.png` / favicon | 3.5 KB | 130×105 |

### Después
| Archivo | Tamaño | Notas |
| --- | --- | --- |
| `*.webp` (5) | **63–91 KB** c/u (~385 KB total) | max 1200px, quality 78 |
| `logoOptimaNegro.png` | **7.3 KB** (−64 %) | PNG recomprimido |
| `logoIzq.png` / favicon | **2.9 KB** | PNG recomprimido |
| `dist/proyectos` en API build | **ausente** | plugin Vite omite mocks |

### Estrategia
- Mock art → WebP (display real ~≤800px; 1200px retina).
- PNG originales eliminados tras confirmar WebP.
- Login logo: `fetchPriority="high"` + dimensiones (candidato LCP).
- Piezas gráficas de proyecto: `loading="lazy"`, `decoding="async"`, `width`/`height`.
- AVIF: no aplicado (mejora marginal vs WebP ya ~90 KB; más complejidad de fallback).

---

## Bundle

### Antes
- 1 chunk app: **~504 KB** JS + **~132 KB** CSS
- Solo Admin separado

### Después (eager en `/login`)
| Chunk | Raw | Gzip |
| --- | --- | --- |
| `index-*.js` | 40.0 KB | 14.5 KB |
| `react-vendor-*.js` | 229.9 KB | 73.6 KB |
| `rolldown-runtime-*.js` | 0.6 KB | 0.4 KB |
| `index-*.css` | 46.3 KB | 9.2 KB |
| **Total eager JS** | **~270 KB** | **~88 KB** |

### Lazy (bajo demanda)
| Chunk | Raw | Gzip | Cuándo |
| --- | --- | --- | --- |
| `PanelReclutadoraPage` | 16.7 KB | 5.0 KB | `/panel` |
| `NuevoRegistroPage` | 66.4 KB | 18.9 KB | `/nuevo-registro` |
| `zod` | 75.9 KB | 21.2 KB | formulario (schema) |
| `dompurify` | 26.9 KB | 10.7 KB | HTML sanitizado |
| `AdminPage` | 6.0 KB | 2.2 KB | `/admin` |

**JS inicial:** 504 KB → ~270 KB (−46 % raw; −43 % gzip vs 154 KB).

---

## Rendering

Cambios con impacto real:
- Route-level splitting: menos JS parseado antes de login/panel.
- Filtro de estado en seguimiento **en cliente** (sin refetch).
- Eliminado floor de 2.6 s en refresh suave.
- Labels de campos desde `selected` del panel (sin `getProyecto` extra).
- `useMemo` solo para `campoLabels` y `visibleItems` (derivaciones baratas de listas).

No se añadió `memo`/`useCallback` indiscriminado.

Listas: tablas de seguimiento típicas son pequeñas; **virtualización no justificada**.

---

## Network

| Cambio | Detalle |
| --- | --- |
| Dedup/caché | `participanteListCache` (TTL 5 s + coalescing inflight) |
| Refresh | Invalida caché; coalescing evita doble fetch resumen+lista |
| HTTP GET | `cache: 'default'` (antes todo `no-store`) |
| Mutaciones | Siguen `no-store` |
| Mock assets | No se sirven en build de producción API |

Waterfalls restantes (API externa): `proyectos` → luego participantes. Sin endpoint de resumen en backend: **NO VERIFICADO / fuera de repo**.

---

## Backend

**NO APLICABLE en este repositorio.** Frontend SPA; API Go externa.

Oportunidad documentada (sin implementar): endpoint `GET /proyectos/:id/seguimiento/resumen` para no traer la lista completa solo para conteos.

---

## Database

**NO APLICABLE en este repositorio.**

---

## Web Vitals

| Métrica | Estado | Evidencia / expectativa |
| --- | --- | --- |
| **LCP** | Mejorable (medición NO VERIFICADO) | Menos JS/CSS/fuente; logo con prioridad; WebP |
| **FCP** | Mejorable (NO VERIFICADO) | WOFF2 preload; CSS inicial −65 % |
| **CLS** | Mejorable (NO VERIFICADO) | `width`/`height` en imgs clave |
| **INP** | Mejorable (NO VERIFICADO) | Sin delay 2.6 s; menos JS en main |
| **TTFB** | NO VERIFICADO | Depende del hosting/CDN del SPA |

---

## Optimizations Applied

1. **Imágenes mock → WebP** (resize ≤1200, q=78); eliminados PNG/JPEG originales.
2. **`mockData.ts`** apunta a `/proyectos/*.webp`.
3. **Plugin Vite** `omit-mock-public-assets`: borra `dist/proyectos` si `VITE_USE_MOCK≠true`.
4. **Montserrat TTF → WOFF2** en `/fonts/`; preload en `index.html`; `font-display: swap`.
5. **Logos PNG** recomprimidos.
6. **Lazy routes:** `PanelReclutadoraPage`, `NuevoRegistroPage`, `AdminPage`.
7. **`manualChunks`:** `react-vendor`, `zod`, `dompurify`.
8. **`modulePreload` filtrado** para no precargar chunks de rutas lazy.
9. **`participanteListCache`** + `computeSeguimientoResumen`.
10. **SeguimientoPanel:** sin delay 2600 ms; filtro local; `campoLabels` por props.
11. **HttpClient:** GET cacheable por defecto.
12. **Login:** validación manual (Zod fuera del paint de login).
13. **Imágenes UI:** dimensiones + lazy donde corresponde.
14. **Test** `seguimientoResumen.test.ts`.

---

## Before vs After

| Métrica | Antes | Después | Δ |
| --- | --- | --- | --- |
| `dist/` total (API build) | 5.8 MB | **1.0 MB** | **−83 %** |
| JS eager (suma chunks) | 504 KB | **~270 KB** | **−46 %** |
| JS eager gzip | 154 KB | **~88 KB** | **−43 %** |
| CSS eager | 132 KB | **46 KB** | **−65 %** |
| Fuente | 689 KB TTF | **210 KB WOFF2** | **−70 %** |
| Mock images en dist API | 4.4 MB | **0** | **−100 %** |
| Mock images en `public` (dev/demo) | 4.4 MB | **~385 KB** | **−91 %** |
| Logo login | 21 KB | **7.3 KB** | **−64 %** |
| Artificial refresh delay | 2600 ms | **0** | −2600 ms |
| Fetch duplicado participantes | Sí | **Dedup/caché** | — |
| Lighthouse score | NO VERIFICADO | NO VERIFICADO | — |

---

## Remaining Opportunities

1. **Endpoint de resumen** en API Go (evita descargar todos los participantes para stats).
2. **Tree-shake mocks** del bundle prod (factories sync hoy importan Mock+Api).
3. **Subset de Montserrat** (latin-only) si el charset lo permite.
4. **CDN + Cache-Control** en hosting (hashed assets `immutable`; HTML corto).
5. **Brotli** en CDN/host — NO VERIFICADO aquí (`vite preview` no comprime como prod CDN).
6. **Comprimir SVGs** login (`profiling` 54 KB / `recruitment` 37 KB) o sustituir por versión lite.
7. **Evitar data-URL** de piezas gráficas (upload a object storage).
8. **Lighthouse CI** en GitHub Actions con URLs reales.
9. **Prefetch** de `/panel` tras login exitoso (solo esa ruta).
10. **Índices/paginación** en API cuando el listado crezca — fuera de repo.

---

## Changes Not Applied

| Cambio | Motivo |
| --- | --- |
| Virtualización de tablas | Listas pequeñas; coste > beneficio |
| memo/useCallback masivo | Sin evidencia de re-renders críticos |
| AVIF + `<picture>` | WebP ya suficiente; más complejidad |
| SSR/SSG | Fuera del stack actual (CSR SPA) |
| Optimización DB/backend | No hay código de servidor en el repo |
| Exclusión sync de Mock repos | `require`/async rompe factories síncronas; riesgo alto |
| Service Worker / App Cache | Complejidad y riesgo de stale auth sin diseño |
| Reemplazar Zod en formularios | Librería estable; ya lazy con la ruta |

---

## Final Score

| Área | Nota | Comentario |
| --- | --- | --- |
| Initial Load | **8/10** | Gran reducción de assets; CWV de campo pendiente |
| Runtime Performance | **7.5/10** | Menos JS y sin delay artificial; listas aún sin virtualizar |
| Images | **9/10** | WebP + omit prod; SVGs login aún mejorables |
| Bundle Efficiency | **8.5/10** | Splitting + vendor; mocks aún en grafo |
| Network Efficiency | **7.5/10** | Dedup cliente; falta resumen API |
| Backend Performance | **N/A → 5/10** | Sin código local; score neutro-bajo por desconocido |
| Database Performance | **N/A → 5/10** | Idem |
| Mobile Performance | **8/10** | Menos transfer/CPU de parse; sin medición device |
| **Overall Performance** | **8/10** | Mejora medible fuerte en build; validar CWV en staging |

---

## Validation

Ejecutado tras los cambios:

- `npm run typecheck` — OK  
- `npm run test` — 10/10 OK  
- `npm run build` (`VITE_USE_MOCK=false`) — OK  
- `npm run lint` — warnings preexistentes (hooks); sin errores nuevos bloqueantes  

---

## Cómo reproducir las métricas

```bash
export VITE_USE_MOCK=false VITE_API_URL=https://api.example.com
rm -rf dist && npm run build
du -sh dist
ls -lh dist/assets dist/fonts
```
