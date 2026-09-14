import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import logoSidebar from '@assets/logoIzq.png'
import logoBrand from '@assets/logoOptimaNegro.png'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import {
  IconFileText,
  IconFolder,
  IconHome,
  IconLayers,
  IconLogout,
  IconMenu,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './AppLayout.module.css'

type PageMeta = {
  title: string
  label: string
  icon: 'home' | 'userPlus' | 'folder' | 'layers' | 'fileText'
}

type NavItem = {
  to: string
  label: string
  icon: ReactNode
  isActive: boolean
}

const PAGE_META: Record<string, PageMeta> = {
  '/panel': { title: 'Panel', label: 'Inicio', icon: 'home' },
  '/nuevo-registro': {
    title: 'Nuevo registro',
    label: 'Alta de participantes',
    icon: 'userPlus',
  },
  '/admin': { title: 'Administración', label: 'Gestión', icon: 'folder' },
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '·'
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function getPageMeta(
  pathname: string,
  search: string,
  coordinadora: boolean,
): PageMeta {
  if (pathname === '/nuevo-registro' && coordinadora) {
    const vista = new URLSearchParams(search).get('vista')
    if (vista === 'registrar') {
      return {
        title: 'Registrar',
        label: 'Alta de participantes',
        icon: 'userPlus',
      }
    }
    return {
      title: 'Información',
      label: 'Pieza, indicaciones y datos del estudio',
      icon: 'fileText',
    }
  }
  return (
    PAGE_META[pathname] ?? {
      title: 'OPTIMASL',
      label: 'App',
      icon: 'home',
    }
  )
}

function PageIcon({ name }: { name: PageMeta['icon'] }) {
  if (name === 'userPlus') return <IconUserPlus size={18} />
  if (name === 'folder') return <IconFolder size={18} />
  if (name === 'layers') return <IconLayers size={18} />
  if (name === 'fileText') return <IconFileText size={18} />
  return <IconHome size={18} />
}

function buildNuevoRegistroPath(vista: 'info' | 'registrar', proyectoId?: string | null) {
  const params = new URLSearchParams()
  if (proyectoId) params.set('proyecto', proyectoId)
  if (vista === 'registrar') params.set('vista', 'registrar')
  const query = params.toString()
  return query ? `/nuevo-registro?${query}` : '/nuevo-registro'
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isMobileNav, setIsMobileNav] = useState(false)
  const [navMotionReady, setNavMotionReady] = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [shellExiting, setShellExiting] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuCloseTimerRef = useRef<number | null>(null)
  const logoutTimerRef = useRef<number | null>(null)
  const menuTitleId = useId()
  const coordinadora = Boolean(user && isCoordinadora(user.role))
  const page = getPageMeta(location.pathname, location.search, coordinadora)
  const proyectoId = searchParams.get('proyecto')
  const vistaRegistrar =
    location.pathname === '/nuevo-registro' && searchParams.get('vista') === 'registrar'
  const vistaInformacion =
    location.pathname === '/nuevo-registro' && searchParams.get('vista') !== 'registrar'

  function clearMenuCloseTimer() {
    if (menuCloseTimerRef.current != null) {
      window.clearTimeout(menuCloseTimerRef.current)
      menuCloseTimerRef.current = null
    }
  }

  function clearLogoutTimer() {
    if (logoutTimerRef.current != null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
  }

  function openMenu() {
    if (shellExiting) return
    clearMenuCloseTimer()
    setMenuMounted(true)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMenuVisible(true))
    })
  }

  function closeMenu() {
    setMenuVisible(false)
    clearMenuCloseTimer()
    menuCloseTimerRef.current = window.setTimeout(() => {
      setMenuMounted(false)
      menuCloseTimerRef.current = null
      menuButtonRef.current?.focus()
    }, 320)
  }

  function handleLogout() {
    if (shellExiting) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isMobileNav || prefersReduced) {
      logout()
      return
    }

    clearMenuCloseTimer()
    clearLogoutTimer()
    setMenuVisible(false)
    setShellExiting(true)

    logoutTimerRef.current = window.setTimeout(() => {
      logoutTimerRef.current = null
      setMenuMounted(false)
      logout()
    }, 420)
  }

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setNavMotionReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1024px)')
    const sync = () => setIsMobileNav(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    clearMenuCloseTimer()
    setMenuVisible(false)
    setMenuMounted(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    return () => {
      clearMenuCloseTimer()
      clearLogoutTimer()
    }
  }, [])

  useEffect(() => {
    if (!menuVisible) return

    const id = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('button[data-menu-logout]')
        ?.focus()
    })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuVisible])

  const sideNavItems = [
    { to: '/panel', label: 'Panel', icon: <IconHome size={22} /> },
    {
      to: '/nuevo-registro',
      label: coordinadora ? 'Gestión' : 'Reclutar',
      icon: coordinadora ? <IconLayers size={22} /> : <IconUserPlus size={22} />,
    },
  ]

  const inGestionSection = location.pathname === '/nuevo-registro'

  const bottomNavItems = useMemo<NavItem[]>(() => {
    if (!inGestionSection) return []

    return [
      {
        to: buildNuevoRegistroPath('info', proyectoId),
        label: 'Información',
        icon: <IconFileText size={22} />,
        isActive: vistaInformacion,
      },
      {
        to: buildNuevoRegistroPath('registrar', proyectoId),
        label: 'Registrar',
        icon: <IconUserPlus size={22} />,
        isActive: vistaRegistrar,
      },
    ]
  }, [inGestionSection, proyectoId, vistaInformacion, vistaRegistrar])

  const showBottomNav = bottomNavItems.length > 0
  const activeSideNavIndex = sideNavItems.findIndex((item) => item.to === location.pathname)
  const activeBottomNavIndex = bottomNavItems.findIndex((item) => item.isActive)

  return (
    <div
      className={`${styles.shell} ${isMobileNav ? styles.shellMobile : ''} ${
        isMobileNav && showBottomNav ? styles.shellWithBottomNav : ''
      } ${shellExiting ? styles.shellExiting : ''}`}
    >
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <aside
        ref={sidebarRef}
        className={styles.sidebar}
        aria-hidden={isMobileNav ? true : undefined}
        inert={isMobileNav ? true : undefined}
      >
        <div className={styles.sidebarTop}>
          <Link to="/panel" className={styles.brand} aria-label="Optima SL">
            <img
              src={logoSidebar}
              alt=""
              width={36}
              height={36}
              decoding="async"
              className={styles.brandLogo}
            />
            <span className={styles.navTooltip} role="tooltip">
              Optima SL
            </span>
          </Link>
        </div>

        <nav
          className={`${styles.sideNav} ${navMotionReady ? styles.sideNavReady : ''}`}
          aria-label="Navegación principal"
        >
          <span
            className={`${styles.navIndicator} ${activeSideNavIndex < 0 ? styles.navIndicatorHidden : ''}`}
            style={
              activeSideNavIndex >= 0
                ? {
                    transform: `translateY(calc(${activeSideNavIndex} * (var(--nav-item-size) + var(--nav-gap))))`,
                  }
                : undefined
            }
            aria-hidden="true"
          />
          {sideNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
              aria-label={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navTooltip} role="tooltip">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={`${styles.navItem} ${styles.logoutItem}`}
            aria-label="Cerrar sesión"
            onClick={() => logout()}
          >
            <span className={styles.navIcon}>
              <IconLogout size={24} />
            </span>
            <span className={styles.navTooltip} role="tooltip">
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <div className={styles.contentColumn}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button
                ref={menuButtonRef}
                type="button"
                className={styles.menuButton}
                aria-label="Abrir menú"
                aria-expanded={menuVisible}
                aria-haspopup="dialog"
                onClick={openMenu}
              >
                <IconMenu size={22} />
              </button>

              <div className={styles.pageContext}>
                <span className={styles.pageIcon} aria-hidden="true">
                  <PageIcon name={page.icon} />
                </span>
                <span className={styles.pageText}>
                  <strong>{page.title}</strong>
                  <small>{page.label}</small>
                </span>
              </div>
            </div>

            <div className={styles.topbarRight}>
              <div className={styles.userProfile}>
                <span className={styles.avatar} aria-hidden="true">
                  {getInitials(user?.displayName ?? '')}
                </span>
                <span className={styles.userInfo}>
                  <strong>{user?.displayName}</strong>
                  <small>{user?.role}</small>
                </span>
              </div>
            </div>
          </header>

          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation — solo en la sección correspondiente */}
      {showBottomNav ? (
        <nav
          className={`${styles.bottomNav} ${navMotionReady ? styles.bottomNavReady : ''}`}
          aria-label="Navegación principal"
          style={
            {
              '--bottom-nav-count': bottomNavItems.length,
              '--bottom-nav-index': Math.max(activeBottomNavIndex, 0),
            } as CSSProperties
          }
        >
          <span
            className={`${styles.bottomIndicator} ${activeBottomNavIndex < 0 ? styles.bottomIndicatorHidden : ''}`}
            aria-hidden="true"
          />
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={() =>
                `${styles.bottomItem} ${item.isActive ? styles.bottomActive : ''}`
              }
            >
              <span className={styles.bottomIcon}>{item.icon}</span>
              <span className={styles.bottomLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}

      {/* Mobile app menu */}
      {menuMounted ? (
        <>
          <button
            type="button"
            className={`${styles.menuBackdrop} ${menuVisible ? styles.menuOpen : ''}`}
            aria-label="Cerrar menú"
            onClick={closeMenu}
          />
          <div
            ref={menuRef}
            className={`${styles.menuSheet} ${menuVisible ? styles.menuOpen : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={menuTitleId}
          >
            <div className={styles.menuHandle} aria-hidden="true" />
            <div className={styles.menuSheetInner}>
              <Link
                to="/panel"
                className={styles.menuBrand}
                aria-label="Optima SL"
                onClick={closeMenu}
              >
                <img
                  src={logoBrand}
                  alt=""
                  width={160}
                  height={56}
                  decoding="async"
                  className={styles.menuBrandLogo}
                />
                <span id={menuTitleId} className="sr-only">
                  Optima SL
                </span>
              </Link>

              <nav className={styles.menuNav} aria-label="Secciones">
                {sideNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.menuNavItem} ${isActive ? styles.menuNavItemActive : ''}`
                    }
                    onClick={closeMenu}
                  >
                    <span className={styles.menuNavIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <button
                type="button"
                className={styles.menuLogout}
                data-menu-logout
                disabled={shellExiting}
                onClick={handleLogout}
              >
                <IconLogout size={20} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
