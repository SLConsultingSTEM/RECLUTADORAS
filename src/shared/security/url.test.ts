import { describe, expect, it } from 'vitest'
import { isSafeMediaUrl, safeMediaUrl } from './url'

describe('isSafeMediaUrl', () => {
  it('acepta rutas relativas de la app', () => {
    expect(isSafeMediaUrl('/proyectos/RCL.png')).toBe(true)
  })

  it('rechaza protocol-relative y javascript', () => {
    expect(isSafeMediaUrl('//evil.example/a.png')).toBe(false)
    expect(isSafeMediaUrl('javascript:alert(1)')).toBe(false)
  })

  it('acepta http(s) y data:image base64 no SVG', () => {
    expect(isSafeMediaUrl('https://cdn.example.com/a.png')).toBe(true)
    expect(isSafeMediaUrl('http://cdn.example.com/a.png')).toBe(true)
    expect(isSafeMediaUrl('data:image/png;base64,aaa')).toBe(true)
    expect(isSafeMediaUrl('data:image/svg+xml;base64,aaa')).toBe(false)
  })

  it('safeMediaUrl vacía valores inseguros', () => {
    expect(safeMediaUrl('javascript:alert(1)')).toBe('')
    expect(safeMediaUrl('/ok.png')).toBe('/ok.png')
  })
})
