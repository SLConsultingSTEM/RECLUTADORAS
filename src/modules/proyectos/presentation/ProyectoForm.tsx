import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Proyecto } from '@modules/proyectos/domain/types'
import { TIPOS_DOCUMENTO, type TipoDocumento } from '@modules/participantes/domain/types'
import { buildParticipanteSchema } from '@modules/participantes/application/participanteSchema'
import { registerParticipanteUseCase } from '@modules/participantes/application/participanteUseCases'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import { useAuth } from '@app/providers/useAuth'
import { isCoordinadora } from '@modules/auth/domain/roles'
import { Alert } from '@shared/ui/Alert'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Select } from '@shared/ui/Select'
import { IconListChecks, IconMapPin, IconUser } from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

const participanteRepository = createParticipanteRepository()

const BASE_FIELD_ORDER = ['nombre', 'tipoDocumento', 'documento', 'ciudad', 'telefono'] as const

function resolveFieldName(errorKey: string) {
  return errorKey.startsWith('camposExtra.') ? errorKey.slice('camposExtra.'.length) : errorKey
}

function focusFirstInvalidField(
  form: HTMLFormElement,
  errors: Record<string, string>,
  campoNames: string[],
) {
  const order = [
    ...BASE_FIELD_ORDER,
    ...campoNames.map((name) => `camposExtra.${name}`),
  ]
  const firstKey = order.find((key) => Boolean(errors[key]))
  if (!firstKey) return

  const fieldName = resolveFieldName(firstKey)
  const field = form.querySelector<HTMLElement>(`[name="${CSS.escape(fieldName)}"]`)
  if (!field) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  field.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  })

  field.classList.remove(styles.attention)
  void field.offsetWidth
  field.classList.add(styles.attention)

  const focusDelay = prefersReduced ? 0 : 320
  window.setTimeout(() => {
    field.focus({ preventScroll: true })
  }, focusDelay)

  window.setTimeout(() => {
    field.classList.remove(styles.attention)
  }, prefersReduced ? 0 : 800)
}

interface ProyectoFormProps {
  proyecto: Proyecto
  onRegistered: () => void
}

export function ProyectoForm({ proyecto, onRegistered }: ProyectoFormProps) {
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  /** Reclutadora: solo Datos base obligatorios; el filtro del estudio es opcional. */
  const requireCamposEspecificos = Boolean(user && isCoordinadora(user.role))
  const schema = useMemo(
    () =>
      buildParticipanteSchema(proyecto.camposEspecificos, {
        requireCamposEspecificos,
      }),
    [proyecto.camposEspecificos, requireCamposEspecificos],
  )

  const [nombre, setNombre] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento | ''>('')
  const [documento, setDocumento] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [camposExtra, setCamposExtra] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setNombre('')
    setTipoDocumento('')
    setDocumento('')
    setCiudad('')
    setTelefono('')
    setCamposExtra({})
    setErrors({})
    setSuccess('')
    setError('')
  }

  useEffect(() => {
    resetForm()
  }, [proyecto])

  function clearFieldError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setError((prev) => (prev ? '' : prev))
    setSuccess((prev) => (prev ? '' : prev))
  }

  function updateExtra(key: string, value: string) {
    clearFieldError(`camposExtra.${key}`)
    setCamposExtra((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess('')
    setError('')

    const parsed = schema.safeParse({
      nombre,
      tipoDocumento,
      documento,
      ciudad,
      telefono,
      camposExtra: Object.fromEntries(
        proyecto.camposEspecificos.map((campo) => [
          campo.nombreCampo,
          camposExtra[campo.nombreCampo] ?? '',
        ]),
      ),
    })

    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        next[key] = issue.message
      }
      setErrors(next)
      const form = formRef.current
      if (form) {
        window.requestAnimationFrame(() => {
          focusFirstInvalidField(
            form,
            next,
            proyecto.camposEspecificos.map((campo) => campo.nombreCampo),
          )
        })
      }
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await registerParticipanteUseCase(participanteRepository, {
        proyectoId: proyecto.id,
        ...parsed.data,
        creadoPor: user?.username ?? 'desconocido',
      })
      resetForm()
      setSuccess('Participante registrado correctamente')
      onRegistered()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  const filtroCount = proyecto.camposEspecificos.length

  const floatingBar = (
    <div className={styles.floatingBar} role="toolbar" aria-label="Acciones del registro">
      <Button
        type="button"
        variant="secondary"
        className={styles.floatingBtn}
        disabled={loading}
        onClick={resetForm}
      >
        Descartar
      </Button>
      <Button
        type="button"
        className={styles.floatingBtn}
        loading={loading}
        onClick={() => formRef.current?.requestSubmit()}
      >
        Guardar
      </Button>
    </div>
  )

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.sectionIcon}>
              <IconUser size={15} />
            </span>
            <div>
              <span className={styles.sectionEyebrow}>Datos base</span>
              <h4 className={styles.sectionTitle}>Información del participante</h4>
            </div>
          </div>
          <span className={styles.badge}>5 campos</span>
        </div>

        <div className={styles.grid}>
          <Input
            label="Nombre completo"
            name="nombre"
            value={nombre}
            onChange={(e) => {
              clearFieldError('nombre')
              setNombre(e.target.value)
            }}
            error={errors.nombre}
            icon={<IconUser size={16} />}
            placeholder="Ej. María Fernanda Gómez"
            required
          />
          <Select
            label="Tipo de documento"
            name="tipoDocumento"
            value={tipoDocumento}
            onChange={(e) => {
              clearFieldError('tipoDocumento')
              setTipoDocumento(e.target.value as TipoDocumento | '')
            }}
            options={[
              { value: '', label: 'Seleccione…' },
              ...TIPOS_DOCUMENTO.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
            error={errors.tipoDocumento}
            required
          />
          <Input
            label="Documento"
            name="documento"
            value={documento}
            onChange={(e) => {
              clearFieldError('documento')
              setDocumento(e.target.value)
            }}
            error={errors.documento}
            placeholder="Número de documento"
            required
          />
          <Select
            label="Ciudad"
            name="ciudad"
            value={ciudad}
            onChange={(e) => {
              clearFieldError('ciudad')
              setCiudad(e.target.value)
            }}
            options={[
              { value: '', label: 'Seleccione…' },
              ...proyecto.ciudadesPermitidas.map((item) => ({
                value: item,
                label: item,
              })),
            ]}
            error={errors.ciudad}
            icon={<IconMapPin size={16} />}
            required
          />
          <Input
            label="Teléfono"
            name="telefono"
            value={telefono}
            onChange={(e) => {
              clearFieldError('telefono')
              setTelefono(e.target.value)
            }}
            error={errors.telefono}
            placeholder="Ej. 3001234567"
            inputMode="numeric"
            required
          />
        </div>
      </section>

      {filtroCount > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitleWrap}>
              <span className={styles.sectionIcon}>
                <IconListChecks size={15} />
              </span>
              <div>
                <span className={styles.sectionEyebrow}>Filtro del estudio</span>
                <h4 className={styles.sectionTitle}>Campos específicos del proyecto</h4>
              </div>
            </div>
            <span className={styles.badge}>
              {filtroCount} {filtroCount === 1 ? 'campo' : 'campos'}
            </span>
          </div>

          <div className={styles.grid}>
            {proyecto.camposEspecificos.map((campo) =>
              campo.tipo === 'select' ? (
                <Select
                  key={campo.nombreCampo}
                  label={campo.etiqueta}
                  name={campo.nombreCampo}
                  value={camposExtra[campo.nombreCampo] ?? ''}
                  onChange={(e) => updateExtra(campo.nombreCampo, e.target.value)}
                  options={[
                    { value: '', label: 'Seleccione…' },
                    ...(campo.opciones ?? []).map((opcion) => ({
                      value: opcion,
                      label: opcion,
                    })),
                  ]}
                  error={errors[`camposExtra.${campo.nombreCampo}`]}
                  required={requireCamposEspecificos && campo.requerido}
                />
              ) : (
                <Input
                  key={campo.nombreCampo}
                  label={campo.etiqueta}
                  name={campo.nombreCampo}
                  type={campo.tipo === 'number' ? 'number' : campo.tipo === 'date' ? 'date' : 'text'}
                  value={camposExtra[campo.nombreCampo] ?? ''}
                  onChange={(e) => updateExtra(campo.nombreCampo, e.target.value)}
                  error={errors[`camposExtra.${campo.nombreCampo}`]}
                  placeholder={
                    campo.tipo === 'number'
                      ? `Ingresa ${campo.etiqueta.toLowerCase()}`
                      : campo.tipo === 'date'
                        ? undefined
                        : `Escribe ${campo.etiqueta.toLowerCase()}`
                  }
                  required={requireCamposEspecificos && campo.requerido}
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      {success ? <Alert tone="success">{success}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      {typeof document !== 'undefined' ? createPortal(floatingBar, document.body) : floatingBar}
    </form>
  )
}
