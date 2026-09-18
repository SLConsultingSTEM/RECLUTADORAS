import { useEffect, useState, type FormEvent } from 'react'
import {
  listProyectosUseCase,
  saveProyectoUseCase,
} from '@modules/proyectos/application/proyectoUseCases'
import { createProyectoRepository } from '@modules/proyectos/infrastructure/proyectoRepositoryFactory'
import type { CampoEspecifico, Proyecto } from '@modules/proyectos/domain/types'
import { Alert } from '@shared/ui/Alert'
import { Badge } from '@shared/ui/Badge'
import { Button } from '@shared/ui/Button'
import { Card, CardHeader } from '@shared/ui/Card'
import { useConfirmDialog } from '@shared/ui/ConfirmDialog'
import { Input } from '@shared/ui/Input'
import { Select } from '@shared/ui/Select'
import { LoadingRow } from '@shared/ui/Skeleton'
import { Table } from '@shared/ui/Table'
import { sanitizeHtml } from '@shared/security/sanitize'
import { safeMediaUrl } from '@shared/security/url'
import {
  IconFolder,
  IconListChecks,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@shared/ui/icons'
import styles from './AdminPage.module.css'

const proyectoRepository = createProyectoRepository()

const emptyForm = (): Proyecto => ({
  id: '',
  nombre: '',
  descripcionHtml: '',
  imagenUrl: '',
  imagenNombre: '',
  ciudadesPermitidas: ['Bogotá'],
  camposEspecificos: [],
  activo: true,
})

export function AdminPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [form, setForm] = useState<Proyecto>(emptyForm())
  const [ciudadesText, setCiudadesText] = useState('Bogotá')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  async function refresh() {
    const data = await listProyectosUseCase(proyectoRepository)
    setProyectos(data)
  }

  useEffect(() => {
    void (async () => {
      try {
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function editProyecto(proyecto: Proyecto) {
    setForm(structuredClone(proyecto))
    setCiudadesText(proyecto.ciudadesPermitidas.join(', '))
    setMessage('')
    setError('')
  }

  function resetForm() {
    setForm(emptyForm())
    setCiudadesText('Bogotá')
  }

  function addCampo() {
    const campo: CampoEspecifico = {
      nombreCampo: `campo_${form.camposEspecificos.length + 1}`,
      etiqueta: 'Nuevo campo',
      tipo: 'text',
      requerido: true,
    }
    setForm((prev) => ({
      ...prev,
      camposEspecificos: [...prev.camposEspecificos, campo],
    }))
  }

  function updateCampo(index: number, patch: Partial<CampoEspecifico>) {
    setForm((prev) => ({
      ...prev,
      camposEspecificos: prev.camposEspecificos.map((campo, i) =>
        i === index ? { ...campo, ...patch } : campo,
      ),
    }))
  }

  async function removeCampo(index: number) {
    const campo = form.camposEspecificos[index]
    const label = campo?.etiqueta?.trim() || campo?.nombreCampo || 'este campo'
    const ok = await confirm({
      title: '¿Quitar este campo?',
      message: 'Vas a quitar',
      subject: label,
      confirmLabel: 'Sí, quitar',
    })
    if (!ok) return
    setForm((prev) => ({
      ...prev,
      camposEspecificos: prev.camposEspecificos.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!form.id) {
      setError('Selecciona un proyecto de la lista para editarlo. Los estudios se crean en Optima.')
      return
    }

    if (!form.nombre.trim()) {
      setError('El nombre del proyecto es obligatorio')
      return
    }

    const imagenUrl = form.imagenUrl.trim()
    if (imagenUrl && !safeMediaUrl(imagenUrl)) {
      setError('URL de imagen no permitida. Use ruta relativa o http(s).')
      return
    }

    const payload: Proyecto = {
      ...form,
      ciudadesPermitidas: ciudadesText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      descripcionHtml: sanitizeHtml(form.descripcionHtml),
      imagenUrl: safeMediaUrl(imagenUrl),
    }

    try {
      await saveProyectoUseCase(proyectoRepository, payload)
      await refresh()
      setMessage('Proyecto guardado')
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    }
  }

  return (
    <div className={styles.page}>
      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {loading ? <LoadingRow label="Cargando administración…" /> : null}

      <section className={styles.grid}>
        <Card>
          <CardHeader
            eyebrow="Editor"
            title={form.id ? 'Editar proyecto' : 'Selecciona un proyecto'}
            icon={<IconFolder size={18} />}
          />

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              required
            />
            <Input
              label="URL de imagen"
              name="imagenUrl"
              value={form.imagenUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imagenUrl: e.target.value }))}
              hint="Ej. /proyectos/RCL.png"
            />
            <Input
              label="Nombre archivo descarga"
              name="imagenNombre"
              value={form.imagenNombre}
              onChange={(e) => setForm((prev) => ({ ...prev, imagenNombre: e.target.value }))}
            />
            <Input
              label="Ciudades"
              name="ciudades"
              value={ciudadesText}
              onChange={(e) => setCiudadesText(e.target.value)}
              hint="Separadas por coma"
            />

            <label className={styles.textareaField}>
              <span>Descripción HTML</span>
              <textarea
                value={form.descripcionHtml}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, descripcionHtml: e.target.value }))
                }
                rows={6}
              />
            </label>

            <div className={styles.preview}>
              <strong>Vista previa</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(form.descripcionHtml || '<p>Sin contenido</p>'),
                }}
              />
            </div>

            <div className={styles.camposHeader}>
              <div>
                <h3>Campos específicos</h3>
                <Badge tone="accent" icon={<IconListChecks size={12} />}>
                  {form.camposEspecificos.length}
                </Badge>
              </div>
              <Button type="button" variant="soft" size="sm" icon={<IconPlus size={14} />} onClick={addCampo}>
                Agregar
              </Button>
            </div>

            {form.camposEspecificos.map((campo, index) => (
              <div key={`${campo.nombreCampo}-${index}`} className={styles.campoCard}>
                <Input
                  label="Nombre técnico"
                  value={campo.nombreCampo}
                  onChange={(e) => updateCampo(index, { nombreCampo: e.target.value })}
                />
                <Input
                  label="Etiqueta"
                  value={campo.etiqueta}
                  onChange={(e) => updateCampo(index, { etiqueta: e.target.value })}
                />
                <Select
                  label="Tipo"
                  value={campo.tipo}
                  onChange={(e) =>
                    updateCampo(index, {
                      tipo: e.target.value as CampoEspecifico['tipo'],
                    })
                  }
                  options={[
                    { value: 'text', label: 'Texto' },
                    { value: 'select', label: 'Select' },
                    { value: 'number', label: 'Número' },
                    { value: 'date', label: 'Fecha' },
                  ]}
                />
                {campo.tipo === 'select' ? (
                  <Input
                    label="Opciones (coma)"
                    value={(campo.opciones ?? []).join(', ')}
                    onChange={(e) =>
                      updateCampo(index, {
                        opciones: e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                ) : null}
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={<IconTrash size={14} />}
                  onClick={() => void removeCampo(index)}
                >
                  Quitar
                </Button>
              </div>
            ))}

            <div className={styles.actions}>
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        <Card delay={80}>
          <CardHeader
            eyebrow="Catálogo"
            title="Proyectos"
            icon={<IconFolder size={18} />}
            actions={<Badge tone="primary">{proyectos.length}</Badge>}
          />

          <Table headers={['Nombre', 'Ciudades', 'Campos', 'Acciones']}>
            {proyectos.map((proyecto) => (
              <tr key={proyecto.id}>
                <td data-label="Nombre">
                  <strong className={styles.projectName}>{proyecto.nombre}</strong>
                </td>
                <td data-label="Ciudades">{proyecto.ciudadesPermitidas.join(', ')}</td>
                <td data-label="Campos">
                  <Badge tone="neutral">{proyecto.camposEspecificos.length}</Badge>
                </td>
                <td data-label="Acciones" className={styles.rowActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<IconPencil size={14} />}
                    onClick={() => editProyecto(proyecto)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </section>
      {confirmDialog}
    </div>
  )
}
