# RESPONSIVE_UX_AUDIT.md

## Executive Summary

La aplicación (login, panel, gestión/registro y admin) era usable en desktop, pero en móviles presentaba **overflow horizontal real**, tablas difíciles de leer, navegación móvil poco clara (icon-only), targets táctiles pequeños y barras/modales sin safe-area/`dvh`.

Se corrigieron primero patrones reutilizables (`Table`, `Button`, `Modal`, layout, selects) y luego páginas de alto impacto. La validación DOM midió `scrollWidth` vs `clientWidth` en rutas autenticadas y login; **no se usó `overflow-x: hidden` global**.

Lint/typecheck/tests/build: **OK** (warnings preexistentes de oxlint, sin errores nuevos).

## Critical Issues

1. **Overflow horizontal en `/panel` a 320px** — encabezado de tabla oculto + toolbar de filtros (`nowrap`) empujaban el documento (~377px).
2. **Tabla de Admin con `min-width: 680px`** — en móvil obligaba scroll horizontal interno; ilegible sin transformación a cards.
3. **Navegación móvil icon-only (78px)** — menú poco descubrible; labels solo por hover (no disponible en touch).
4. **Drawer cerrado interactuable** — ítems del sidebar fuera de pantalla seguían en el árbol accesible / foco.

## Mobile Issues

- Stats del panel en 2 columnas a ≤480px (demasiado comprimidas).
- Filtro de estado + “Actualizar” en una sola fila sin wrap.
- Botones `sm` (~34px) e icon buttons (40px) por debajo del target táctil cómodo.
- Floating bars de Guardar/Descartar sin `safe-area-inset-bottom`.
- Modales con `90vh`/`92vh` (barras del navegador móvil).
- Multiselects con menú `min(280px)` que podía salir del viewport.
- Controles de editar/eliminar campo (~1.55rem) difíciles de tocar.
- Login: botón “mostrar contraseña” 34×34; padding sin safe-area.

## Tablet Issues

- Sidebar drawer a ≤1024px seguía estrecho y sin labels visibles.
- Contenido interactuable debajo del drawer abierto.
- Stats a 3 columnas en anchos intermedios: aceptable; en ≤480px se forzó 1 columna.

## Desktop Issues

- Tabla Admin con `min-width: 680px` fijo generaba scroll interno innecesario en grid de 2 columnas (~1280px).
- Contenido centrado a `1280px`: correcto; en ultrawide no hay “estiramiento” excesivo (intencional).

## Tables

| Tabla | Antes | Después |
|---|---|---|
| Seguimiento (`SeguimientoPanel`) | Cards bajo 1024px; overflow por `thead` oculto mal clippeado | Cards móvil; `thead` con clip robusto; labels en todos los campos |
| Admin (proyectos) | Tabla fija + scroll horizontal | `data-label` + patrón card del `Table` compartido ≤760px; acciones en columna full-width |

Desktop conserva `<table>` real. No se ocultó información crítica.

## Forms

- Grids de registro a 1 columna ≤720px (ya existía; reforzado).
- Headers de sección y toolbars de campos apilan en móvil.
- Targets de editar/duplicar/eliminar ampliados (~2.15rem).
- Floating bar de registro/edición: grid 2→1 columnas, `safe-area`, `dvh`-friendly.
- Multiselect: menú limitado al viewport; chips wrap; quitar chip ~44px; add row apilada en móvil.
- Selects pills: posicionamiento clamped al viewport; labels apilados ≤480px.

## Navigation

- ≤1024px: drawer ~`min(82vw, 18rem)` con **labels visibles**, cierre, backdrop, Escape, foco al abrir.
- Drawer cerrado: `visibility: hidden` + `aria-hidden` + `inert`.
- Contenido principal `inert` mientras el drawer está abierto.
- Topbar: padding fluido; perfil compacto en ≤720px.

## Overflow Fixes

- Causa root en panel: `thead` “oculto” seguía midiendo ancho → clip/absolute reforzado.
- `Table.min-width: min(100%, 680px)` en desktop; cards en móvil.
- Toolbars/filtros con `flex-wrap` y full-width en móvil.
- Stats a 1 columna ≤480px.
- Dropdowns: `left`/`width` clamp al viewport.
- Tipografía/textos largos: `overflow-wrap` en global, badges, títulos, chips.
- Sin `overflow-x: hidden` en `html`/`body`.

## Typography

- Escala existente conservada; footer login subió de `0.72rem` a `--text-xs`.
- Labels de tabla móvil con tipografía uppercase clara (label + valor).
- Títulos de workspace con `clamp` / wrap en pantallas muy estrechas.
- Badges permiten wrap (ya no `nowrap` forzado).

## Accessibility

- Focus visible existente preservado.
- Drawer: Escape, foco a “Cerrar menú”, inert en abierto/cerrado.
- Targets táctiles más cercanos a 44px (botones sm, icon buttons, chips, pager, close modal).
- Modales ≤480px en full-screen con header sticky y safe-area.
- Lightbox: safe-area + `max-height: 88dvh`.
- Layout shell/content: `100dvh` con fallback `100vh`.

## Components Improved

- `src/shared/styles/global.css`
- `src/app/layouts/AppLayout.tsx` / `AppLayout.module.css`
- `src/shared/ui/Table.module.css`
- `src/shared/ui/Button.module.css`
- `src/shared/ui/Field.module.css`
- `src/shared/ui/Badge.module.css`
- `src/shared/ui/Modal.module.css`
- `src/shared/ui/Card.module.css`
- `src/shared/ui/StatCard.module.css`
- `src/shared/ui/Select.tsx`
- `src/modules/admin/presentation/AdminPage.tsx` / `.module.css`
- `src/modules/proyectos/presentation/HomePage.module.css`
- `src/modules/participantes/presentation/SeguimientoPanel.module.css`
- `src/modules/participantes/presentation/ParticipanteDetalleModal.module.css`
- `src/modules/proyectos/presentation/ProyectoForm.module.css`
- `src/modules/proyectos/presentation/ProyectoInfo.module.css`
- `src/modules/proyectos/presentation/CrearProyectoCard.module.css`
- `src/modules/proyectos/presentation/OpcionesMultiSelect.tsx`
- `src/modules/proyectos/presentation/CiudadesMultiSelect.module.css`
- `src/modules/auth/presentation/LoginPage.module.css`

## Remaining Issues

1. **Trap de foco completo en drawer** — hay foco inicial y Escape; no hay cycle trap tipo modal (mejora futura).
2. **Drag-and-drop de campos en touch** — el builder sigue basado en HTML5 DnD (limitado en móvil); no se rediseñó.
3. **Ruta `/admin`** — editor HTML crudo; usable pero denso en móvil (no es flujo principal de reclutadoras).
4. **Landscape móvil extremo** — overflow medido; usabilidad landscape no se auditó con matriz visual completa.
5. **Zoom 200%+** — no se bloqué zoom; no se hizo matriz formal de zoom.

## Validation Matrix

Método: Emulation CDP + medición `documentElement.scrollWidth` vs `clientWidth` en rutas `/panel`, `/admin`, `/nuevo-registro` (info + registrar) y `/login` donde aplica. PASS = sin scroll horizontal accidental de página.

| Viewport | Estado |
|---|---|
| 320px | PASS |
| 360px | PASS |
| 375px | PASS |
| 390px | PASS |
| 414px | PASS |
| 480px | PASS |
| 768px | PASS |
| 820px | PASS |
| 1024px | PASS |
| 1280px | PASS |
| 1440px | PASS |
| 1920px | PASS |

Notas:

- Login verificado en **320px** (PASS).
- Matriz = overflow estructural + smoke de usabilidad (navegación drawer, tablas card, formulario con barra fija). No es QA visual pixel-perfect de todas las interacciones en cada ancho.
