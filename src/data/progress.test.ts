import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SETTINGS,
  hasSoloProgress,
  loadProgress,
  markLevelCleared,
  recordEndlessClears,
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
    state = markLevelCleared(state, 'nightmare', 2, 50, 30_000)
    state = recordEndlessClears(state, 5)
    expect(hasSoloProgress(state)).toBe(true)

    const next = resetSoloProgress(state)
    expect(next.solo.easy).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.solo.advanced).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.solo.nightmare).toEqual({ unlocked: 1, cleared: 0, bestTimes: {} })
    expect(next.endless.bestClears).toBe(0)
    expect(next.settings.sound).toBe(false)
    expect(next.settings.seenTutorial).toBe(true)
    expect(hasSoloProgress(next)).toBe(false)
  })

  it('旧 challenge 键迁入 nightmare', () => {
    localStorage.setItem(
      'code-hack-progress-v2',
      JSON.stringify({
        solo: {
          easy: { unlocked: 1, cleared: 0, bestTimes: {} },
          advanced: { unlocked: 1, cleared: 0, bestTimes: {} },
          challenge: { unlocked: 4, cleared: 3, bestTimes: { '1': 1000 } },
        },
        settings: {},
      }),
    )
    const state = loadProgress()
    expect(state.solo.nightmare.unlocked).toBe(4)
    expect(state.solo.nightmare.cleared).toBe(3)
    expect(state.solo.nightmare.bestTimes['1']).toBe(1000)
    expect(state.endless.bestClears).toBe(0)
  })

  it('新存档无进度', () => {
    expect(hasSoloProgress(loadProgress())).toBe(false)
  })

  it('新存档默认：classic / 音效开 / 色盲关 / 确认关', () => {
    const state = loadProgress()
    expect(state.settings.theme).toBe('classic')
    expect(state.settings.sound).toBe(true)
    expect(state.settings.colorBlindPatterns).toBe(false)
    expect(state.settings.confirmSubmit).toBe(false)
    expect(DEFAULT_SETTINGS.theme).toBe('classic')
  })

  it('语言：无缓存时跟随客户端，有缓存用缓存', () => {
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['en-US'],
    })
    expect(loadProgress().settings.locale).toBe('en')

    localStorage.setItem(
      'code-hack-progress-v2',
      JSON.stringify({
        solo: {},
        settings: { locale: 'zh-CN' },
      }),
    )
    expect(loadProgress().settings.locale).toBe('zh-CN')
  })
})
