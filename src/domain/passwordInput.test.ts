import { describe, expect, it } from 'vitest'
import {
  colorsUsedElsewhere,
  cycleColorInPalette,
  resolvePassword,
} from './passwordInput'
import type { EditableGuess } from './types'

describe('resolvePassword', () => {
  it('不完整返回 null', () => {
    const g: EditableGuess = ['R', 'O', 'Y', null]
    expect(resolvePassword(g, { colorCount: 6, allowRepeat: false })).toBeNull()
  })

  it('合法无重复密码', () => {
    const g: EditableGuess = ['R', 'O', 'Y', 'G']
    expect(resolvePassword(g, { colorCount: 6, allowRepeat: false })).toEqual([
      'R',
      'O',
      'Y',
      'G',
    ])
  })

  it('禁止重复时拒绝重复色', () => {
    const g: EditableGuess = ['R', 'R', 'Y', 'G']
    expect(resolvePassword(g, { colorCount: 6, allowRepeat: false })).toBeNull()
  })

  it('允许重复时接受重复色', () => {
    const g: EditableGuess = ['R', 'R', 'Y', 'G']
    expect(resolvePassword(g, { colorCount: 6, allowRepeat: true })).toEqual([
      'R',
      'R',
      'Y',
      'G',
    ])
  })

  it('超出调色板返回 null', () => {
    const g: EditableGuess = ['R', 'O', 'Y', 'C'] // C 需 colorCount>=7
    expect(resolvePassword(g, { colorCount: 6, allowRepeat: true })).toBeNull()
    expect(resolvePassword(g, { colorCount: 7, allowRepeat: true })).toEqual([
      'R',
      'O',
      'Y',
      'C',
    ])
  })
})

describe('colorsUsedElsewhere / cycleColorInPalette', () => {
  it('排除当前槽已占用色', () => {
    const g: EditableGuess = ['R', 'O', null, 'Y']
    expect(colorsUsedElsewhere(g, 2)).toEqual(['R', 'O', 'Y'])
    expect(colorsUsedElsewhere(g, 0)).toEqual(['O', 'Y'])
  })

  it('换色跳过 blocked', () => {
    const palette = ['R', 'O', 'Y', 'G'] as const
    const blocked = new Set(['O', 'Y'] as const)
    expect(cycleColorInPalette('R', palette, 1, blocked)).toBe('G')
    expect(cycleColorInPalette(null, palette, 1, blocked)).toBe('R')
  })
})
