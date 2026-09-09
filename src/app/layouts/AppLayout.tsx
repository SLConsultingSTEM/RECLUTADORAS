import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import logo from '@assets/logoIzq.png'
import { useAuth } from '@app/providers/useAuth'
import { canAccessAdmin } from '@modules/auth/domain/roles'
import { IconButton } from '@shared/ui/Button'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconGauge,
  IconLogout,
  IconMenu,
  IconShield,
  IconSliders,
  IconUserPlus,
} from '@shared/ui/icons'
import styles from './AppLayout.module.css'

const SIDEBAR_KEY = 'reclutadoras.sidebar.collapsed'

interface PageMeta {
  title: string
  section: string
  action?: { to: string; label: string }
}

const PAGE_META: Record<string, PageMeta> = {
  '/panel': {
    title: 'Panel',
    section: 'Operación',
    action: { to: '/nuevo-registro', label: 'Nuevo registro' },
  },
  '/nuevo-registro': {
    title: 'Nuevo registro',
    section: 'Operación',
    action: { to: '/panel', label: 'Ver panel' },
  },
  '/admin': {
    title: 'Administración',
    section: 'Configuración',
  },
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '·'
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (!menuOpen) return

    function handlePointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  function closeMenus() {
    setMobileOpen(false)
    setMenuOpen(false)
  }

  const navItems = [
    { to: '/panel', label: 'Panel', hint: 'Seguimiento', icon: <IconGauge size={19} /> },
    {
      to: '/nuevo-registro',
      label: 'Nuevo registro',
      hint: 'Captura',
      icon: <IconUserPlus size={19} />,
    },
    ...(user && canAccessAdmin(user.role)
      ? [
          {
            to: '/admin',
            label: 'Administración',
            hint: 'Proyectos',
            icon: <IconSliders size={19} />,
          },
        ]
      : []),
  ]

  const pageMeta = PAGE_META[location.pathname] ?? { title: 'Portal', section: 'Plataforma' }

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
          mobileOpen ? styles.sidebarOpen : ''
        }`}
      >
        <div className={styles.sidebarTop}>
          <Link to="/panel" className={styles.brand} title="Reclutadoras" onClick={closeMenus}>
            <span className={styles.brandMark}>
              <img src={logo} alt="" />
            </span>
            <span className={styles.brandText}>
              <strong>Reclutadoras</strong>
              <small>SL Group Optima</small>
            </span>
          </Link>

          <div className={styles.closeWrap}>
            <IconButton
              label="Cerrar menú"
              variant="plain"
              onClick={closeMenus}
            >
              <IconClose size={18} />
            </IconButton>
          </div>
        </div>

        <nav className={styles.sideNav} aria-label="Navegación principal">
          <p className={styles.navLabel}>Menú</p>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              title={item.label}
              onClick={closeMenus}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>
                <span className={styles.navName}>{item.label}</span>
                <small className={styles.navHint}>{item.hint}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <span className={styles.collapseIcon}>
              {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            </span>
            <span className={styles.collapseLabel}>Colapsar</span>
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
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.menuWrap}>
              <IconButton label="Abrir menú" onClick={() => setMobileOpen(true)}>
                <IconMenu size={19} />
              </IconButton>
            </div>

            <div className={styles.titleBlock}>
              <nav className={styles.breadcrumb} aria-label="Ubicación">
                <span>{pageMeta.section}</span>
                <IconChevronRight size={13} />
                <span className={styles.breadcrumbCurrent}>{pageMeta.title}</span>
              </nav>
              <h1 className={styles.pageTitle}>{pageMeta.title}</h1>
            </div>
          </div>

          <div className={styles.topbarRight}>
            {pageMeta.action ? (
              <Link to={pageMeta.action.to} className={styles.headerAction} onClick={closeMenus}>
                <IconUserPlus size={17} />
                <span>{pageMeta.action.label}</span>
              </Link>
            ) : null}

            <div className={styles.userMenu} ref={menuRef}>
              <button
                type="button"
                className={styles.userTrigger}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className={styles.avatar}>{getInitials(user?.displayName ?? '')}</span>
                <span className={styles.userInfo}>
                  <strong>{user?.displayName}</strong>
                  <small>{user?.role}</small>
                </span>
                <span className={`${styles.caret} ${menuOpen ? styles.caretOpen : ''}`}>
                  <IconChevronDown size={15} />
                </span>
              </button>

              {menuOpen ? (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.avatarLarge}>
                      {getInitials(user?.displayName ?? '')}
                    </span>
                    <span className={styles.dropdownMeta}>
                      <strong>{user?.displayName}</strong>
                      <small>@{user?.username}</small>
                    </span>
                  </div>

                  <div className={styles.dropdownRole}>
                    <IconShield size={16} />
                    <span>
                      Rol activo: <strong>{user?.role}</strong>
                    </span>
                  </div>

                  <button type="button" className={styles.dropdownItem} onClick={logout} role="menuitem">
                    <IconLogout size={17} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className={styles.main} key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
