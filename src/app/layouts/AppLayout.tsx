import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import logo from '@assets/logoIzq.png'
import { useAuth } from '@app/providers/useAuth'
import { canAccessAdmin } from '@modules/auth/domain/roles'
import { IconButton } from '@shared/ui/Button'
import {
  IconClose,
  IconFolder,
  IconHome,
  IconLogout,
  IconMenu,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './AppLayout.module.css'

type PageMeta = {
  title: string
  label: string
  icon: 'home' | 'userPlus' | 'folder'
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

function getPageMeta(pathname: string): PageMeta {
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
  return <IconHome size={18} />
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navMotionReady, setNavMotionReady] = useState(false)
  const page = getPageMeta(location.pathname)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setNavMotionReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  function closeMenus() {
    setMobileOpen(false)
  }

  const navItems = [
    { to: '/panel', label: 'Panel', icon: <IconHome size={24} /> },
    {
      to: '/nuevo-registro',
      label: 'Reclutar',
      icon: <IconUserPlus size={24} />,
    },
    ...(user && canAccessAdmin(user.role)
      ? [
          {
            to: '/admin',
            label: 'Administración',
            icon: <IconFolder size={24} />,
          },
        ]
      : []),
  ]

  const activeNavIndex = navItems.findIndex((item) => item.to === location.pathname)

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <Link to="/panel" className={styles.brand} title="OPTIMASL" onClick={closeMenus}>
            <img src={logo} alt="OPTIMASL" className={styles.brandLogo} />
          </Link>

          <div className={styles.closeWrap}>
            <IconButton label="Cerrar menú" variant="plain" onClick={closeMenus}>
              <IconClose size={18} />
            </IconButton>
          </div>
        </div>

        <nav
          className={`${styles.sideNav} ${navMotionReady ? styles.sideNavReady : ''}`}
          aria-label="Navegación principal"
        >
          <span
            className={`${styles.navIndicator} ${activeNavIndex < 0 ? styles.navIndicatorHidden : ''}`}
            style={
              activeNavIndex >= 0
                ? {
                    transform: `translateY(calc(${activeNavIndex} * (var(--nav-item-size) + var(--nav-gap))))`,
                  }
                : undefined
            }
            aria-hidden="true"
          />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              aria-label={item.label}
              onClick={closeMenus}
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
            onClick={() => {
              closeMenus()
              logout()
            }}
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

      {mobileOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className={styles.content}>
        <div className={styles.contentColumn}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <div className={styles.menuWrap}>
                <IconButton label="Abrir menú" onClick={() => setMobileOpen(true)}>
                  <IconMenu size={19} />
                </IconButton>
              </div>

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
                <span className={styles.avatar}>{getInitials(user?.displayName ?? '')}</span>
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
    </div>
  )
}
