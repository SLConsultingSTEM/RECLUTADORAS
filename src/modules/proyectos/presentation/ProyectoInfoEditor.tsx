import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  descripcionToIndicaciones,
  indicacionesToDescripcion,
  type IndicacionEditable,
} from '@modules/proyectos/application/indicacionesMapper'
import { IndicacionesEditor } from '@modules/proyectos/presentation/IndicacionesEditor'
import {
  PiezaGraficaPanel,
  type PiezaGraficaValue,
} from '@modules/proyectos/presentation/PiezaGraficaPanel'
import type { Proyecto } from '@modules/proyectos/domain/types'
import { Alert } from '@shared/ui/Alert'
import { Button } from '@shared/ui/Button'
import styles from './ProyectoInfo.module.css'

export type ProyectoInfoPatch = Pick<
  Proyecto,
  'descripcionHtml' | 'imagenUrl' | 'imagenNombre'
>

interface ProyectoInfoEditorProps {
  proyecto: Proyecto
  onSave: (patch: ProyectoInfoPatch) => Promise<void>
}

export function ProyectoInfoEditor({ proyecto, onSave }: ProyectoInfoEditorProps) {
  const [indicaciones, setIndicaciones] = useState<IndicacionEditable[]>(() =>
    descripcionToIndicaciones(proyecto.descripcionHtml),
  )
  const [pieza, setPieza] = useState<PiezaGraficaValue>({
    imagenUrl: proyecto.imagenUrl,
    imagenNombre: proyecto.imagenNombre,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setIndicaciones(descripcionToIndicaciones(proyecto.descripcionHtml))
    setPieza({
      imagenUrl: proyecto.imagenUrl,
      imagenNombre: proyecto.imagenNombre,
    })
    setError('')
    setMessage('')
  }, [proyecto.id, proyecto.descripcionHtml, proyecto.imagenUrl, proyecto.imagenNombre])

  function resetDraft() {
    setIndicaciones(descripcionToIndicaciones(proyecto.descripcionHtml))
    setPieza({
      imagenUrl: proyecto.imagenUrl,
      imagenNombre: proyecto.imagenNombre,
    })
    setError('')
    setMessage('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await onSave({
        descripcionHtml: indicacionesToDescripcion(proyecto.nombre, indicaciones),
        imagenUrl: pieza.imagenUrl,
        imagenNombre: pieza.imagenNombre,
      })
      setMessage('Cambios guardados')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const floatingBar = (
    <div className={styles.editorFloatingBar} role="toolbar" aria-label="Acciones de edición">
      <Button
        type="button"
        variant="secondary"
        className={styles.editorFloatingBtn}
        disabled={saving}
        onClick={resetDraft}
      >
        Descartar
      </Button>
      <Button
        type="button"
        className={styles.editorFloatingBtn}
        loading={saving}
        onClick={() => void handleSave()}
      >
        Guardar cambios
      </Button>
    </div>
  )

  return (
    <div className={styles.editorShell}>
      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <article className={`${styles.article} ${styles.reclutarInfo}`}>
        <div className={styles.infoStack}>
          <PiezaGraficaPanel
            nombre={proyecto.nombre}
            imagenUrl={pieza.imagenUrl}
            imagenNombre={pieza.imagenNombre}
            editable
            compact
            disabled={saving}
            onChange={setPieza}
          />
          <IndicacionesEditor
            key={proyecto.id}
            items={indicaciones}
            onChange={setIndicaciones}
            disabled={saving}
          />
        </div>
      </article>

      {typeof document !== 'undefined' ? createPortal(floatingBar, document.body) : floatingBar}
    </div>
  )
}
