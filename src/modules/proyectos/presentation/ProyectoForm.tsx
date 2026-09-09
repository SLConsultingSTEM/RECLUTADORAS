import { useMemo, useState, type FormEvent } from 'react'
import type { Proyecto } from '@modules/proyectos/domain/types'
import { buildParticipanteSchema } from '@modules/participantes/application/participanteSchema'
import { registerParticipanteUseCase } from '@modules/participantes/application/participanteUseCases'
import { createParticipanteRepository } from '@modules/participantes/infrastructure/participanteRepositoryFactory'
import { useAuth } from '@app/providers/useAuth'
import { Alert } from '@shared/ui/Alert'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Select } from '@shared/ui/Select'
import { IconMapPin, IconUser } from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

const participanteRepository = createParticipanteRepository()

interface ProyectoFormProps {
  proyecto: Proyecto
  onRegistered: () => void
}

export function ProyectoForm({ proyecto, onRegistered }: ProyectoFormProps) {
  const { user } = useAuth()
  const schema = useMemo(
    () => buildParticipanteSchema(proyecto.camposEspecificos),
    [proyecto.camposEspecificos],
  )

  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [ciudad, setCiudad] = useState(proyecto.ciudadesPermitidas[0] ?? '')
  const [telefono, setTelefono] = useState('')
  const [camposExtra, setCamposExtra] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateExtra(key: string, value: string) {
    setCamposExtra((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess('')
    setError('')

    const parsed = schema.safeParse({
      nombre,
      documento,
      ciudad,
      telefono,
      camposExtra,
    })

    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        next[key] = issue.message
      }
      setErrors(next)
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
      setSuccess('Participante registrado correctamente')
      setNombre('')
      setDocumento('')
      setTelefono('')
      setCamposExtra({})
      onRegistered()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h4>Datos base</h4>
          <span className={styles.badge}>4 campos</span>
        </div>

        <div className={styles.grid}>
          <Input
            label="Nombre completo"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errors.nombre}
            icon={<IconUser size={16} />}
            required
          />
          <Input
            label="Documento"
            name="documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            error={errors.documento}
            required
          />
          <Select
            label="Ciudad"
            name="ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            options={proyecto.ciudadesPermitidas.map((item) => ({
              value: item,
              label: item,
            }))}
            error={errors.ciudad}
            icon={<IconMapPin size={16} />}
            required
          />
          <Input
            label="Teléfono"
            name="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            error={errors.telefono}
            required
          />
        </div>
      </section>

      {proyecto.camposEspecificos.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h4>Filtro del estudio</h4>
            <span className={styles.badge}>
              {proyecto.camposEspecificos.length}{' '}
              {proyecto.camposEspecificos.length === 1 ? 'campo' : 'campos'}
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
                  required={campo.requerido}
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
                  required={campo.requerido}
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      {success ? <Alert tone="success">{success}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className={styles.actions}>
        <Button type="submit" loading={loading} icon={<IconUser size={16} />}>
          {loading ? 'Guardando…' : 'Registrar participante'}
        </Button>
      </div>
    </form>
  )
}
