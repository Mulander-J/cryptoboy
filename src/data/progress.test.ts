import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SETTINGS,
  clearProgressStorageCache,
  hasSoloProgress,
  loadProgress,
  markLevelCleared,
  recordEndlessClears,
  resetSoloProgress,
  startNextCycle,
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

  it('清空三档闯关进度，保留设置，并清掉废弃存档键', () => {
    let state = loadProgress()
    state = updateSettings(state, { sound: false, seenTutorial: true })
    state = markLevelCleared(state, 'easy', 1, 50, 12_000)
    state = markLevelCleared(state, 'nightmare', 2, 50, 30_000)
    state = recordEndlessClears(state, 5)
    localStorage.setItem('code-hack-progress-v1', '{"solo":{}}')
    expect(hasSoloProgress(state)).toBe(true)

    const next = resetSoloProgress(state)
    expect(next.solo.easy).toEqual({
      cleared: 0,
      bestTimes: {},
      cycle: 1,
    })
    expect(next.solo.advanced).toEqual({
      cleared: 0,
      bestTimes: {},
      cycle: 1,
    })
    expect(next.solo.nightmare).toEqual({
      cleared: 0,
      bestTimes: {},
      cycle: 1,
    })
    expect(next.endless.bestClears).toBe(0)
    expect(next.settings.sound).toBe(false)
    expect(next.settings.seenTutorial).toBe(true)
    expect(hasSoloProgress(next)).toBe(false)
    expect(localStorage.getItem('code-hack-progress-v1')).toBeNull()
    expect(localStorage.getItem('code-hack-progress-v2')).not.toBeNull()
  })

  it('clearProgressStorageCache 删除进度相关键', () => {
    localStorage.setItem('code-hack-progress-v2', '{}')
    localStorage.setItem('code-hack-progress-v1', '{}')
    localStorage.setItem('unrelated', 'keep')
    clearProgressStorageCache()
    expect(localStorage.getItem('code-hack-progress-v2')).toBeNull()
    expect(localStorage.getItem('code-hack-progress-v1')).toBeNull()
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })

  it('旧存档无 cycle 字段：迁移为周目 1', () => {
    localStorage.setItem(
      'code-hack-progress-v2',
      JSON.stringify({
        solo: {
          easy: { unlocked: 3, cleared: 2, bestTimes: { '1': 5000 } },
        },
        settings: {},
      }),
    )
    const state = loadProgress()
    expect(state.solo.easy.cycle).toBe(1)
    expect(state.solo.easy.cleared).toBe(2)
    expect(state.solo.nightmare.cycle).toBe(1)
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
    expect(state.solo.nightmare.cleared).toBe(3)
    expect(state.solo.nightmare.bestTimes['1']).toBe(1000)
    expect(state.endless.bestClears).toBe(0)
  })

  it('新存档无进度', () => {
    expect(hasSoloProgress(loadProgress())).toBe(false)
  })

  it('markLevelCleared 保留 cycle', () => {
    let state = loadProgress()
    state = markLevelCleared(state, 'easy', 1, 2, 9000)
    state = markLevelCleared(state, 'easy', 2, 2, 8000)
    const initialCycle = state.solo.easy.cycle
    state = startNextCycle(state, 'easy', 2)
    expect(state.solo.easy.cycle).toBe(initialCycle + 1)
    state = markLevelCleared(state, 'easy', 1, 2, 7000)
    expect(state.solo.easy.cycle).toBe(initialCycle + 1)
    expect(state.solo.easy.cleared).toBe(1)
  })

  it('新存档默认：cny / 音效开 / 色盲关 / 确认关', () => {
    const state = loadProgress()
    expect(state.settings.theme).toBe('cny')
    expect(state.settings.sound).toBe(true)
    expect(state.settings.colorBlindPatterns).toBe(false)
    expect(state.settings.confirmSubmit).toBe(false)
    expect(DEFAULT_SETTINGS.theme).toBe('cny')
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

describe('startNextCycle', () => {
  beforeEach(() => {
    stubLocalStorage()
  })

  it('未整档通关：不可开启下周目', () => {
    let state = loadProgress()
    state = markLevelCleared(state, 'easy', 1, 2, 9000)
    const next = startNextCycle(state, 'easy', 2)
    expect(next).toBe(state)
    expect(next.solo.easy.cycle).toBe(1)
  })

  it('整档通关后：周目 +1、进度归位、最佳用时清空并持久化', () => {
    let state = loadProgress()
    state = markLevelCleared(state, 'nightmare', 1, 2, 30_000)
    state = markLevelCleared(state, 'nightmare', 2, 2, 25_000)
    expect(state.solo.nightmare.cleared).toBe(2)

    const next = startNextCycle(state, 'nightmare', 2)
    expect(next.solo.nightmare).toEqual({
      cleared: 0,
      bestTimes: {},
      cycle: 2,
    })
    // 不影响其他难度
    expect(next.solo.easy.cycle).toBe(1)
    // 已写入存档
    const reloaded = loadProgress()
    expect(reloaded.solo.nightmare.cycle).toBe(2)
    // 周目 >1 视为有进度（可重置）
    expect(hasSoloProgress(next)).toBe(true)
  })

  it('重置进度后回到周目 1', () => {
    let state = loadProgress()
    state = markLevelCleared(state, 'easy', 1, 1, 9000)
    state = startNextCycle(state, 'easy', 1)
    expect(state.solo.easy.cycle).toBe(2)
    const next = resetSoloProgress(state)
    expect(next.solo.easy.cycle).toBe(1)
  })
})
