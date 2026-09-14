import { useEffect, useState } from 'react'
import searchArt from '@assets/search.svg'
import styles from './LoginVisual.module.css'

interface Slide {
  src: string
  eyebrow: string
  title: string
  description: string
}

const SLIDE_META = [
  {
    eyebrow: 'Búsqueda',
    title: 'Encuentra el perfil adecuado',
    description: 'Localiza participantes según el proyecto, la ciudad y los criterios del estudio.',
  },
  {
    eyebrow: 'Perfilación',
    title: 'Conoce cada candidato',
    description: 'Organiza la información clave para validar perfiles con claridad y orden.',
  },
  {
    eyebrow: 'Reclutamiento',
    title: 'Avanza hasta el cierre',
    description: 'Registra, da seguimiento y cierra cada proceso desde un solo lugar.',
  },
] as const

const INTERVAL_MS = 4500

function isLowCapacityDevice() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  const saveData = Boolean(connection?.saveData)
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const lowMem = typeof deviceMemory === 'number' && deviceMemory <= 4
  const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2
  return reduceMotion || saveData || lowMem || lowCpu
}

/**
 * Panel izquierdo del login: ilustraciones y copy en rotación suave.
 * En equipos limitados solo muestra el SVG liviano (search) sin carrusel.
 */
export function LoginVisual() {
  const [lite] = useState(() => isLowCapacityDevice())
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(lite)
  const [slides, setSlides] = useState<Slide[]>([{ src: searchArt, ...SLIDE_META[0] }])

  useEffect(() => {
    if (lite) return

    let cancelled = false

    void Promise.all([
      import('@assets/profiling.svg'),
      import('@assets/recruitment.svg'),
    ]).then(([profiling, recruitment]) => {
      if (cancelled) return
      setSlides([
        { src: searchArt, ...SLIDE_META[0] },
        { src: profiling.default, ...SLIDE_META[1] },
        { src: recruitment.default, ...SLIDE_META[2] },
      ])
    })

    const id = window.requestAnimationFrame(() => setReady(true))
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [lite])

  useEffect(() => {
    if (!ready || lite || slides.length < 2) return

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [ready, lite, slides.length])

  const current = slides[active] ?? slides[0]
  if (!current) return null

  return (
    <aside
      className={`${styles.visual} ${ready ? styles.visualReady : ''} ${lite ? styles.visualLite : ''}`}
      aria-label="Presentación OPTIMASL"
    >
      <div className={`${styles.content} ${ready ? styles.contentReady : ''}`}>
        <div className={styles.stage} aria-hidden="true">
          {slides.map((slide, index) => {
            // En mobile el hero ya es visible; no esperar ready para mostrar la ilustración activa
            const isActive = index === active
            return (
              <img
                key={slide.src}
                src={slide.src}
                alt=""
                className={`${styles.art} ${isActive ? styles.artActive : ''} ${ready ? '' : styles.artPending}`}
                width={640}
                height={640}
                decoding="async"
                fetchPriority={isActive ? 'high' : 'low'}
                loading="eager"
              />
            )
          })}
        </div>

        <div className={`${styles.copyBlock} ${ready ? styles.copyReady : ''}`}>
          <div key={`${current.src}-${ready}`} className={styles.copy} aria-live="polite">
            <span className={styles.eyebrow}>{current.eyebrow}</span>
            <h2 className={styles.title}>{current.title}</h2>
            <p className={styles.description}>{current.description}</p>
          </div>

          {!lite && slides.length > 1 ? (
            <div className={styles.dots} aria-hidden="true">
              {slides.map((slide, index) => (
                <span
                  key={slide.src}
                  className={`${styles.dot} ${ready && index === active ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Organic curve edge — mobile brand field */}
      <svg
        className={styles.mobileCurve}
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 0 L100 0 L100 4 C88 10 72 2 50 6 C28 10 12 2 0 8 Z"
          fill="var(--color-bg, #f4f4f4)"
        />
      </svg>
    </aside>
  )
}
