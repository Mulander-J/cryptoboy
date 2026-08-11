import type { Difficulty, LevelConfig } from '@/domain/types'

/** 各难度关卡数（种子生成） */
export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: 50,
  advanced: 50,
  nightmare: 50,
}

/** 无尽整盘倒计时（ms） */
export const ENDLESS_MATCH_MS = 300_000

/** 噩梦档：按关卡给出倒计时限额（ms） */
export function nightmareTimeLimitMs(level: number): number {
  if (level >= 31) return 60_000
  if (level >= 16) return 90_000
  return 120_000
}

/** 无尽：按本盘连胜递进颜色数 */
export function endlessColorCount(clears: number): number {
  if (clears >= 20) return 8
  if (clears >= 10) return 7
  return 6
}

export function endlessRoundConfig(clears: number, timeLimitMs: number): LevelConfig {
  return {
    index: clears + 1,
    colorCount: endlessColorCount(clears),
    allowRepeat: true,
    hintStyle: 'summary',
    difficulty: 'nightmare',
    timerMode: 'countdown',
    timeLimitMs,
    fateCaseEnabled: true,
    fateCaseAutoStart: true,
    fateCaseDifficulty: 5,
    fateCaseOneShot: true,
  }
}

export function levelConfig(difficulty: Difficulty, index: number): LevelConfig {
  const level = Math.max(1, index)

  if (difficulty === 'easy') {
    let colorCount = 4
    if (level >= 16) colorCount = 5
    if (level >= 31) colorCount = 6
    return {
      index: level,
      colorCount,
      allowRepeat: false,
      hintStyle: 'column',
      difficulty: 'easy',
      timerMode: 'countup',
    }
  }

  if (difficulty === 'advanced') {
    let colorCount = 6
    let allowRepeat = false
    if (level >= 16) allowRepeat = true
    if (level >= 31) colorCount = 8
    return {
      index: level,
      colorCount,
      allowRepeat,
      hintStyle: 'summary',
      difficulty: 'advanced',
      timerMode: 'countup',
    }
  }

  // 噩梦：更高颜色数 + 可重复 + 倒计时；汇总提示
  let colorCount = 6
  if (level >= 11) colorCount = 7
  if (level >= 21) colorCount = 8
  return {
    index: level,
    colorCount,
    allowRepeat: true,
    hintStyle: 'summary',
    difficulty: 'nightmare',
    timerMode: 'countdown',
    timeLimitMs: nightmareTimeLimitMs(level),
    fateCaseEnabled: true,
    fateCaseAutoStart: false,
    fateCaseDifficulty: 3,
    fateCaseOneShot: false,
  }
}

export function practiceConfig(
  difficulty: Difficulty,
  colorCount?: number,
  allowRepeat?: boolean,
): LevelConfig {
  if (difficulty === 'easy') {
    return {
      index: 0,
      colorCount: colorCount ?? 6,
      allowRepeat: allowRepeat ?? false,
      hintStyle: 'column',
      difficulty: 'easy',
      timerMode: 'countup',
    }
  }
  if (difficulty === 'advanced') {
    return {
      index: 0,
      colorCount: colorCount ?? 6,
      allowRepeat: allowRepeat ?? false,
      hintStyle: 'summary',
      difficulty: 'advanced',
      timerMode: 'countup',
    }
  }
  return {
    index: 0,
    colorCount: colorCount ?? 8,
    allowRepeat: allowRepeat ?? true,
    hintStyle: 'summary',
    difficulty: 'nightmare',
    timerMode: 'countdown',
    timeLimitMs: 90_000,
  }
}
