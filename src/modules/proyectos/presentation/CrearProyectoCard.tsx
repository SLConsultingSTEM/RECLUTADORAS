import { useState, type FormEvent } from 'react'
import type { Proyecto } from '@modules/proyectos/domain/types'
import { CiudadesMultiSelect } from '@modules/proyectos/presentation/CiudadesMultiSelect'
import { Alert } from '@shared/ui/Alert'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Modal } from '@shared/ui/Modal'
import { IconCopy, IconFolder, IconPlus } from '@shared/ui/icons'
import styles from './CrearProyectoCard.module.css'

interface CrearProyectoCardProps {
  proyectos: Proyecto[]
  onCreate: (input: {
    nombre: string
    ciudadesPermitidas: string[]
    duplicarDesdeId?: string
  }) => Promise<void>
}

export function CrearProyectoCard({ proyectos, onCreate }: CrearProyectoCardProps) {
  const [nombre, setNombre] = useState('')
  const [ciudades, setCiudades] = useState<string[]>(['Bogotá'])
  const [duplicarDesdeId, setDuplicarDesdeId] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fuente = proyectos.find((item) => item.id === duplicarDesdeId) ?? null
  const duplicando = Boolean(fuente)

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setError((prev) => (prev ? '' : prev))
    setMessage((prev) => (prev ? '' : prev))
  }

  function resetBaseForm() {
    setNombre('')
    setCiudades(['Bogotá'])
    setDuplicarDesdeId('')
  }

  function chooseSource(source: Proyecto) {
    setDuplicarDesdeId(source.id)
    setNombre(`${source.nombre} (copia)`)
    setCiudades(
      source.ciudadesPermitidas.length > 0 ? [...source.ciudadesPermitidas] : ['Bogotá'],
    )
    setFieldErrors({})
    setError('')
    setMessage('')
    setPickerOpen(false)
  }

  function cancelDuplicate() {
    resetBaseForm()
    setMessage('')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const trimmed = nombre.trim()
    const nextErrors: Record<string, string> = {}
    if (!trimmed) {
      nextErrors.nombre = 'El nombre del proyecto es obligatorio'
    }
    if (ciudades.length === 0) {
      nextErrors.ciudades = 'Selecciona al menos una ciudad'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSaving(true)
    const wasDuplicate = Boolean(duplicarDesdeId)
    try {
      await onCreate({
        nombre: trimmed,
        ciudadesPermitidas: ciudades,
        duplicarDesdeId: duplicarDesdeId || undefined,
      })
      resetBaseForm()
      setMessage(wasDuplicate ? 'Proyecto duplicado correctamente' : 'Proyecto creado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proyecto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={styles.card} padding="none">
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className={styles.top}>
          <div className={styles.heading}>
            <span className={styles.headingIcon} aria-hidden="true">
              <IconFolder size={18} />
            </span>
            <div className={styles.headingText}>
              <h3 className={styles.title}>Creación de proyectos</h3>
              <p className={styles.subtitle}>
                {duplicando
                  ? 'Se copiarán pieza, indicaciones y campos del proyecto elegido'
                  : 'Define el nombre y las ciudades del estudio'}
              </p>
            </div>
          </div>

          <div className={styles.topActions}>
            {proyectos.length > 0 ? (
              <Button
                type="button"
                variant="secondary"
                icon={<IconCopy size={18} />}
                disabled={saving}
                onClick={() => setPickerOpen(true)}
              >
                Duplicar
              </Button>
            ) : null}
            <Button type="submit" icon={<IconPlus size={18} />} loading={saving}>
              {duplicando ? 'Duplicar proyecto' : 'Crear proyecto'}
            </Button>
          </div>
        </div>

        {message ? <Alert tone="success">{message}</Alert> : null}
        {error ? <Alert tone="error">{error}</Alert> : null}

        {fuente ? (
          <div className={styles.duplicateBanner}>
            <p className={styles.duplicateText}>
              Duplicando: <strong>{fuente.nombre}</strong>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={cancelDuplicate}
            >
              Cancelar
            </Button>
          </div>
        ) : null}

        <div className={styles.fields}>
          <div className={styles.field}>
            <Input
              label="Nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => {
                clearFieldError('nombre')
                setNombre(e.target.value)
              }}
              placeholder="Ej. DERMA PROTECT AD (32)"
              error={fieldErrors.nombre}
            />
          </div>
          <div className={styles.field}>
            <CiudadesMultiSelect
              value={ciudades}
              onChange={(next) => {
                clearFieldError('ciudades')
                setCiudades(next)
              }}
              error={fieldErrors.ciudades}
              disabled={saving}
            />
          </div>
        </div>
      </form>

      <Modal
        open={pickerOpen}
        title="Duplicar proyecto"
        description="Elige el proyecto base. Se copiarán pieza, indicaciones y campos."
        onClose={() => setPickerOpen(false)}
      >
        <div className={styles.pickerList}>
          {proyectos.map((proyecto) => (
            <button
              key={proyecto.id}
              type="button"
              className={styles.pickerItem}
              onClick={() => chooseSource(proyecto)}
            >
              <span className={styles.pickerName}>{proyecto.nombre}</span>
              <span className={styles.pickerMeta}>
                {proyecto.ciudadesPermitidas.length}{' '}
                {proyecto.ciudadesPermitidas.length === 1 ? 'ciudad' : 'ciudades'}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </Card>
  )
}
