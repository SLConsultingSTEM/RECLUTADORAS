import { useState } from 'react'
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  if (parts.length === 0) return '·'
  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  function closeMenus() {
    setMobileOpen(false)
  }

  const navItems = [
    { to: '/panel', label: 'Panel', icon: <IconHome size={20} /> },
    {
      to: '/nuevo-registro',
      label: 'Nuevo registro',
      icon: <IconUserPlus size={20} />,
    },
    ...(user && canAccessAdmin(user.role)
      ? [
          {
            to: '/admin',
            label: 'Administración',
            icon: <IconFolder size={20} />,
          },
        ]
      : []),
  ]

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

        <nav className={styles.sideNav} aria-label="Navegación principal">
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
              <IconLogout size={20} />
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
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.menuWrap}>
              <IconButton label="Abrir menú" onClick={() => setMobileOpen(true)}>
                <IconMenu size={19} />
              </IconButton>
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

        <main className={styles.main} key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
