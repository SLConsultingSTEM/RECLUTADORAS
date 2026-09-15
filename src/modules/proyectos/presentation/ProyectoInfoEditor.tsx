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
import { Toast } from '@shared/ui/Toast'
import { Button } from '@shared/ui/Button'
import styles from './ProyectoInfo.module.css'

export type ProyectoInfoPatch = Pick<
  Proyecto,
  'descripcionHtml' | 'imagenUrl' | 'imagenNombre'
>

type FeedbackTone = 'success' | 'error' | 'info'

interface ProyectoInfoEditorProps {
  proyecto: Proyecto
  onSave: (patch: ProyectoInfoPatch) => Promise<void>
}

function snapshotIndicaciones(items: IndicacionEditable[]) {
  return items
    .map((item) => `${item.lead.trim()}\n${item.texto.trim()}`)
    .filter((line) => line.replace(/\n/g, '').length > 0)
    .join('\u0000')
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
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; text: string } | null>(null)

  useEffect(() => {
    setIndicaciones(descripcionToIndicaciones(proyecto.descripcionHtml))
    setPieza({
      imagenUrl: proyecto.imagenUrl,
      imagenNombre: proyecto.imagenNombre,
    })
    setFeedback(null)
  }, [proyecto.id, proyecto.descripcionHtml, proyecto.imagenUrl, proyecto.imagenNombre])

  function hasChanges() {
    const baseline = snapshotIndicaciones(descripcionToIndicaciones(proyecto.descripcionHtml))
    const current = snapshotIndicaciones(indicaciones)
    return (
      current !== baseline ||
      pieza.imagenUrl !== proyecto.imagenUrl ||
      (pieza.imagenNombre ?? '') !== (proyecto.imagenNombre ?? '')
    )
  }

  function resetDraft() {
    setIndicaciones(descripcionToIndicaciones(proyecto.descripcionHtml))
    setPieza({
      imagenUrl: proyecto.imagenUrl,
      imagenNombre: proyecto.imagenNombre,
    })
    setFeedback(null)
  }

  async function handleSave() {
    setFeedback(null)

    if (!hasChanges()) {
      setFeedback({ tone: 'info', text: 'No has hecho cambios' })
      return
    }

    setSaving(true)
    try {
      await onSave({
        descripcionHtml: indicacionesToDescripcion(proyecto.nombre, indicaciones),
        imagenUrl: pieza.imagenUrl,
        imagenNombre: pieza.imagenNombre,
      })
      setFeedback({ tone: 'success', text: 'Cambios guardados' })
    } catch (err) {
      setFeedback({
        tone: 'error',
        text: err instanceof Error ? err.message : 'No se pudo guardar',
      })
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
        Guardar
      </Button>
    </div>
  )

  return (
    <div className={styles.editorShell}>
      {feedback ? (
        <Toast tone={feedback.tone} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Toast>
      ) : null}

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
