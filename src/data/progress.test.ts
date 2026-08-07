import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  hasSoloProgress,
  loadProgress,
  markLevelCleared,
  resetSoloProgress,
  updateSettings,
} from './progress'

function stubLocalStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  })
}

describe('resetSoloProgress', () => {
  beforeEach(() => {
    stubLocalStorage()
  })

  it('清空三档闯关进度，保留设置', () => {
    let state = loadProgress()
    state = updateSettings(state, { sound: false, seenTutorial: true })
    state = markLevelCleared(state, 'easy', 1, 50, 12_000)
    state = markLevelCleared(state, 'challenge', 2, 50, 30_000)
    expect(hasSoloProgress(state)).toBe(true)

    const next = resetSoloProgress(state)
    expect(next.solo.easy).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.solo.advanced).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.solo.challenge).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.settings.sound).toBe(false)
    expect(next.settings.seenTutorial).toBe(true)
    expect(hasSoloProgress(next)).toBe(false)
  })

  it('新存档无进度', () => {
    expect(hasSoloProgress(loadProgress())).toBe(false)
  })
})
