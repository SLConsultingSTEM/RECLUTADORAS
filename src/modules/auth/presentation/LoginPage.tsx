import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@assets/logoOptimaNegro.png'
import { loginUseCase } from '@modules/auth/application/loginUseCase'
import { isAuthError, type AuthErrorField } from '@modules/auth/domain/AuthError'
import { createAuthRepository } from '@modules/auth/infrastructure/authRepositoryFactory'
import { useAuth } from '@app/providers/useAuth'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { IconEye, IconEyeOff, IconLock, IconUser } from '@shared/ui/icons'
import { LoginBottomDecoration } from './LoginBottomDecoration'
import { LoginDivider } from './LoginDivider'
import { LoginTopDecoration } from './LoginTopDecoration'
import { LoginVisual } from './LoginVisual'
import styles from './LoginPage.module.css'

const authRepository = createAuthRepository()

const SUCCESS_HOLD_MS = 1600
const EXIT_ANIM_MS = 720
const ERROR_HOLD_MS = 2200

export function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [exiting, setExiting] = useState(false)
  const fieldResetTimeoutRef = useRef<number | null>(null)
  const successTimeoutsRef = useRef<number[]>([])
  const mountedRef = useRef(true)

  const busy = loading || success || exiting

  function clearFieldResetTimeout() {
    if (fieldResetTimeoutRef.current == null) return
    window.clearTimeout(fieldResetTimeoutRef.current)
    fieldResetTimeoutRef.current = null
  }

  function clearSuccessTimeouts() {
    for (const id of successTimeoutsRef.current) window.clearTimeout(id)
    successTimeoutsRef.current = []
  }

  function waitWhileMounted(ms: number) {
    return new Promise<boolean>((resolve) => {
      const id = window.setTimeout(() => {
        successTimeoutsRef.current = successTimeoutsRef.current.filter((item) => item !== id)
        resolve(mountedRef.current)
      }, ms)
      successTimeoutsRef.current.push(id)
    })
  }

  function scheduleFieldReset(field: AuthErrorField) {
    clearFieldResetTimeout()
    fieldResetTimeoutRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return
      if (field === 'username') {
        setUsername('')
        setUsernameError('')
      } else {
        setPassword('')
        setPasswordError('')
      }
      fieldResetTimeoutRef.current = null
    }, ERROR_HOLD_MS)
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearFieldResetTimeout()
      clearSuccessTimeouts()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    clearFieldResetTimeout()
    clearSuccessTimeouts()

    const formData = new FormData(event.currentTarget)
    const nextUsername = String(formData.get('username') ?? username).trim()
    const nextPassword = String(formData.get('password') ?? password)

    const nextUsernameError = nextUsername ? '' : 'Requerido'
    const nextPasswordError = nextPassword ? '' : 'Requerido'
    setUsernameError(nextUsernameError)
    setPasswordError(nextPasswordError)
    if (nextUsernameError || nextPasswordError) return

    setUsername(nextUsername)
    setPassword(nextPassword)
    setLoading(true)

    try {
      const session = await loginUseCase(authRepository, {
        username: nextUsername,
        password: nextPassword,
      })
      if (!mountedRef.current) return

      setSession(session)
      setUsernameError('')
      setPasswordError('')
      setLoading(false)
      setSuccess(true)

      if (!(await waitWhileMounted(SUCCESS_HOLD_MS))) return
      setExiting(true)
      if (!(await waitWhileMounted(EXIT_ANIM_MS))) return
      navigate('/panel', { replace: true })
    } catch (err) {
      if (!mountedRef.current) return

      setLoading(false)
      setSuccess(false)
      setExiting(false)
      setUsernameError('')
      setPasswordError('')

      if (isAuthError(err)) {
        if (err.field === 'username') {
          setUsernameError(err.message)
          scheduleFieldReset('username')
        } else {
          setPasswordError(err.message)
          scheduleFieldReset('password')
        }
        return
      }

      setPasswordError('No se pudo iniciar sesión')
      scheduleFieldReset('password')
    }
  }

  const buttonLabel = exiting
    ? 'Entrando…'
    : success
      ? '¡Listo!'
      : loading
        ? 'Ingresando…'
        : 'Ingresar'

  return (
    <div className={`${styles.page} ${exiting ? styles.pageExiting : ''}`}>
      <LoginVisual />
      <section className={styles.panel}>
        <LoginDivider />
        <LoginTopDecoration />
        <LoginBottomDecoration />
        <div className={styles.panelInner}>
          <header className={styles.header}>
            <img
              src={logo}
              alt="OPTIMASL"
              width={590}
              height={188}
              decoding="async"
              fetchPriority="high"
              className={`${styles.logo} ${styles.rise} ${styles.d1}`}
            />
            <div className={`${styles.headerText} ${styles.rise} ${styles.d2}`}>
              <h1>Iniciar sesión</h1>
              <p>Ingresa con tu usuario del equipo para continuar.</p>
            </div>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.rise} ${styles.d3}`}>
              <Input
                label="Usuario"
                name="username"
                floating
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(event) => {
                  clearFieldResetTimeout()
                  setUsername(event.target.value)
                  if (usernameError) setUsernameError('')
                }}
                icon={<IconUser size={18} />}
                required
                disabled={busy}
                error={usernameError}
                valid={success}
              />
            </div>
            <div className={`${styles.rise} ${styles.d4}`}>
              <Input
                label="Contraseña"
                name="password"
                floating
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  clearFieldResetTimeout()
                  setPassword(event.target.value)
                  if (passwordError) setPasswordError('')
                }}
                icon={<IconLock size={18} />}
                disabled={busy}
                error={passwordError}
                valid={success}
                endAdornment={
                  <button
                    type="button"
                    className={styles.reveal}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    disabled={busy}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                }
                required
              />
            </div>

            <div className={`${styles.actions} ${styles.rise} ${styles.d5}`}>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={busy}
                className={`${success ? styles.buttonSuccess : ''} ${exiting ? styles.buttonLeaving : ''}`}
              >
                <span key={buttonLabel} className={styles.buttonMessage}>
                  {buttonLabel}
                </span>
              </Button>
            </div>
          </form>

          <p className={`${styles.footer} ${styles.rise} ${styles.d6}`}>
            © 2026 SL Insights & Archetypes
          </p>
        </div>
      </section>
    </div>
  )
}
