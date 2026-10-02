import { useState } from 'react'
import { IconClose, IconPlus } from '@shared/ui/icons'
import styles from './ProyectoForm.module.css'

export interface OpcionAgregarCampo {
  id: string
  etiqueta: string
  grupo: string
}

interface AgregarCampoTileProps {
  opciones: OpcionAgregarCampo[]
  subtitulo: string
  /** Se muestra cuando ya no queda nada por agregar. */
  sinOpciones: string
  onElegir: (opcion: OpcionAgregarCampo) => void
}

/** Cada campo guarda en un lugar distinto, así que se elige qué dato pedir en vez de crear uno en blanco. */
export function AgregarCampoTile({ opciones, subtitulo, sinOpciones, onElegir }: AgregarCampoTileProps) {
  const [abierto, setAbierto] = useState(false)

  if (!abierto || opciones.length === 0) {
    return (
      <button
        type="button"
        className={styles.addCampoTile}
        disabled={opciones.length === 0}
        title={opciones.length === 0 ? sinOpciones : undefined}
        onClick={() => setAbierto(true)}
      >
        <IconPlus size={20} />
        <span>Agregar campo</span>
        <small>{opciones.length === 0 ? sinOpciones : subtitulo}</small>
      </button>
    )
  }

  const grupos = [...new Set(opciones.map((opcion) => opcion.grupo))]

  return (
    <div
      className={styles.addCampoPicker}
      role="group"
      aria-label="Elige el dato que quieres pedir"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setAbierto(false)
      }}
    >
      <div className={styles.addCampoPickerHead}>
        <span>¿Qué dato quieres pedir?</span>
        <button
          type="button"
          className={styles.campoCloseBtn}
          aria-label="Cerrar"
          title="Cerrar"
          onClick={() => setAbierto(false)}
        >
          <IconClose size={14} />
        </button>
      </div>
      <div className={styles.addCampoPickerList}>
        {grupos.map((grupo) => (
          <div key={grupo} className={styles.addCampoPickerGroup}>
            <small>{grupo}</small>
            {opciones
              .filter((opcion) => opcion.grupo === grupo)
              .map((opcion, index) => (
                <button
                  key={opcion.id}
                  type="button"
                  className={styles.addCampoOption}
                  autoFocus={grupo === grupos[0] && index === 0}
                  onClick={() => {
                    setAbierto(false)
                    onElegir(opcion)
                  }}
                >
                  {opcion.etiqueta}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
