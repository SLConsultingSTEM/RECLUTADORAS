import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function BaseIcon({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* Navegación principal */

export function IconHome(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m4 11 8-7.2L20 11" />
      <path d="M6.2 9.8v9.4h11.6V9.8" />
      <path d="M10 19.2v-5.2h4v5.2" />
    </BaseIcon>
  )
}

export function IconGauge(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3.5 18a9 9 0 1 1 17 0" />
      <path d="m12 13.5 4-4" />
      <circle cx="12" cy="14" r="1.6" />
    </BaseIcon>
  )
}

export function IconUserPlus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9.5" cy="8" r="3.4" />
      <path d="M3.5 20c.9-3.4 3.2-5.2 6-5.2 1 0 2 .24 2.9.72" />
      <path d="M17.5 14v5.5" />
      <path d="M14.75 16.75h5.5" />
    </BaseIcon>
  )
}

export function IconSliders(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 5v5.5" />
      <path d="M5 15.5V19" />
      <circle cx="5" cy="13" r="2.2" />
      <path d="M12 5v2.5" />
      <path d="M12 12.5V19" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M19 5v9" />
      <path d="M19 18.5V19" />
      <circle cx="19" cy="16.2" r="2.2" />
    </BaseIcon>
  )
}

/* Acciones de interfaz */

export function IconSearch(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h11" />
      <path d="M4 17h16" />
    </BaseIcon>
  )
}

export function IconPanelLeft(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="2.2" />
      <path d="M9.5 4v16" />
      <rect x="3.5" y="4" width="6" height="16" rx="2.2" fill="currentColor" stroke="none" />
    </BaseIcon>
  )
}

export function IconClose(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 6.5l11 11" />
      <path d="M17.5 6.5l-11 11" />
    </BaseIcon>
  )
}

export function IconChevronLeft(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </BaseIcon>
  )
}

export function IconChevronRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </BaseIcon>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </BaseIcon>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 12.5 10 17l8.5-9" />
    </BaseIcon>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5-5.5 5.5" />
    </BaseIcon>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </BaseIcon>
  )
}

export function IconRefresh(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4.5V10h-5.5" />
    </BaseIcon>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4v10" />
      <path d="m8 10.5 4 4 4-4" />
      <path d="M5 19h14" />
    </BaseIcon>
  )
}

export function IconMaximize(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 4.5H5.5V8" />
      <path d="M15 4.5h3.5V8" />
      <path d="M9 19.5H5.5V16" />
      <path d="M15 19.5h3.5V16" />
    </BaseIcon>
  )
}

export function IconLogout(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9.5 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.5" />
      <path d="m15.5 8 4 4-4 4" />
      <path d="M19.5 12h-9" />
    </BaseIcon>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 11.2A1.8 1.8 0 0 0 9.1 20h5.8a1.8 1.8 0 0 0 1.8-1.8L17.5 7" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
    </BaseIcon>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z" />
      <path d="m14.5 6.5 3 3" />
    </BaseIcon>
  )
}

/* Datos y contenido */

export function IconUser(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4" />
    </BaseIcon>
  )
}

export function IconLock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
    </BaseIcon>
  )
}

export function IconEye(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </BaseIcon>
  )
}

export function IconEyeOff(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 4.5 20.5 20" />
      <path d="M10 6.3A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3.2 3.5" />
      <path d="M7 8.3A14.5 14.5 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.5" />
      <path d="M10.2 10.4a2.6 2.6 0 0 0 3.5 3.5" />
    </BaseIcon>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c1-3.1 3.4-4.7 6-4.7s5 1.6 6 4.7" />
      <path d="M16 5.6a3.2 3.2 0 0 1 0 6.3" />
      <path d="M17.5 14.9c1.4.6 2.5 1.9 3 4.6" />
    </BaseIcon>
  )
}

export function IconMapPin(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21c4-4.2 6-7.4 6-10a6 6 0 0 0-12 0c0 2.6 2 5.8 6 10Z" />
      <circle cx="12" cy="10.6" r="2.2" />
    </BaseIcon>
  )
}

export function IconListChecks(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m3.5 7 1.6 1.6L8.2 5.4" />
      <path d="m3.5 16 1.6 1.6 3.1-3.2" />
      <path d="M11.5 7h9" />
      <path d="M11.5 16h9" />
    </BaseIcon>
  )
}

export function IconImage(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" />
      <circle cx="9" cy="9.8" r="1.6" />
      <path d="m4.5 17.5 4.7-4.4a1.8 1.8 0 0 1 2.5.06l3 3" />
      <path d="m14.5 14.5 1.6-1.5a1.8 1.8 0 0 1 2.5.06l1.9 1.9" />
    </BaseIcon>
  )
}

export function IconFileText(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-4.5-4.5Z" />
      <path d="M13.8 3.7V8h4.4" />
      <path d="M9 13h6" />
      <path d="M9 16.5h4" />
    </BaseIcon>
  )
}

export function IconFolder(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h3.2l1.8 2.2h8A2 2 0 0 1 20.5 9.7v7.3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" />
    </BaseIcon>
  )
}

/* Estados */

export function IconCheckCircle(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
    </BaseIcon>
  )
}

export function IconXCircle(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </BaseIcon>
  )
}

export function IconClock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 8v4.3l2.8 1.7" />
    </BaseIcon>
  )
}

export function IconPhoneMissed(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5.6 4.5h2.6l1.3 3.3-1.9 1.4a10.6 10.6 0 0 0 4.8 4.8l1.4-1.9 3.3 1.3v2.6a1.9 1.9 0 0 1-2.1 1.9C9.4 17.2 6.3 14.1 3.7 6.6a1.9 1.9 0 0 1 1.9-2.1Z" />
      <path d="m16 4.5 4 4" />
      <path d="m20 4.5-4 4" />
    </BaseIcon>
  )
}

export function IconAlertCircle(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 8.2v4.4" />
      <path d="M12 15.6v.4" />
    </BaseIcon>
  )
}

export function IconInfo(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 11v5" />
      <path d="M12 8v.4" />
    </BaseIcon>
  )
}

export function IconInbox(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2a2 2 0 0 1 1.9 1.3l2.5 7.7" />
      <path d="M3.5 13.5h4.2l1 2.4h6.6l1-2.4h4.2v4.1a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-4.1Z" />
    </BaseIcon>
  )
}

export function IconShield(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3.5 5.5 6v5.4c0 4 2.7 7.4 6.5 9.1 3.8-1.7 6.5-5.1 6.5-9.1V6L12 3.5Z" />
      <path d="m9.3 12 2 2 3.4-3.6" />
    </BaseIcon>
  )
}

export function IconSparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 13.3 9l4.5 1.3-4.5 1.3L12 16l-1.3-4.4L6.2 10.3 10.7 9 12 4.5Z" />
      <path d="M18 16.5l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z" />
    </BaseIcon>
  )
}

export function IconFilter(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5h16l-6.2 7.2V19l-3.6-2v-4.8L4 5Z" />
    </BaseIcon>
  )
}

/* Alias de compatibilidad */

export const IconPanel = IconGauge
export const IconSettings = IconSliders
