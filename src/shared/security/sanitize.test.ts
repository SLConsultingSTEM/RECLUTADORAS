import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('elimina handlers y scripts', () => {
    const dirty =
      '<p onmouseover="window.__xss=1">Hola</p><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toMatch(/onerror/i)
    expect(clean).not.toMatch(/onmouseover/i)
    expect(clean).not.toMatch(/<script/i)
    expect(clean).toContain('Hola')
  })

  it('neutraliza javascript: en enlaces y elimina object', () => {
    const dirty =
      '<object data="https://example.invalid"></object><a href="javascript:void(0)">x</a>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toMatch(/<object/i)
    expect(clean).not.toMatch(/javascript:/i)
  })
})
