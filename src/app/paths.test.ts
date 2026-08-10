import { describe, expect, it } from 'vitest'
import { parseDifficulty, parseLevel, soloPath } from './paths'

describe('paths', () => {
  it('soloPath', () => {
    expect(soloPath('easy', 3)).toBe('/solo/easy/3')
  })

  it('parseDifficulty', () => {
    expect(parseDifficulty('nightmare')).toBe('nightmare')
    expect(parseDifficulty('challenge')).toBe('nightmare')
    expect(parseDifficulty('hard')).toBeNull()
  })

  it('parseLevel', () => {
    expect(parseLevel('12')).toBe(12)
    expect(parseLevel('0')).toBeNull()
    expect(parseLevel('1.5')).toBeNull()
  })
})
