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

  const previousIndex = (active - 1 + slides.length) % slides.length
  const visibleIndexes = lite || slides.length < 2 ? [active] : [...new Set([previousIndex, active])]

  return (
    <aside className={`${styles.visual} ${ready ? styles.visualReady : ''} ${lite ? styles.visualLite : ''}`}>
      <div className={`${styles.content} ${ready ? styles.contentReady : ''}`}>
        <div className={styles.stage} aria-hidden="true">
          {visibleIndexes.map((index) => {
            const slide = slides[index]
            if (!slide) return null
            return (
              <img
                key={slide.src}
                src={slide.src}
                alt=""
                className={`${styles.art} ${ready && index === active ? styles.artActive : ''}`}
                width={640}
                height={640}
                decoding="async"
                fetchPriority={index === active ? 'high' : 'low'}
                loading={index === active ? 'eager' : 'lazy'}
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
    </aside>
  )
}
