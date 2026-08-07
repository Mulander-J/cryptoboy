import type { Difficulty, LevelConfig } from '../domain/types'

/** 各难度关卡数（种子生成） */
export const MAX_LEVELS: Record<Difficulty, number> = {
  easy: 50,
  advanced: 50,
  challenge: 50,
}

/** 挑战档：按关卡给出倒计时限额（ms） */
export function challengeTimeLimitMs(level: number): number {
  if (level >= 31) return 60_000
  if (level >= 16) return 90_000
  return 120_000
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

  // 限时挑战：更高颜色数 + 可重复 + 倒计时；汇总提示
  let colorCount = 6
  if (level >= 11) colorCount = 7
  if (level >= 21) colorCount = 8
  return {
    index: level,
    colorCount,
    allowRepeat: true,
    hintStyle: 'summary',
    difficulty: 'challenge',
    timerMode: 'countdown',
    timeLimitMs: challengeTimeLimitMs(level),
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
    difficulty: 'challenge',
    timerMode: 'countdown',
    timeLimitMs: 90_000,
  }
}
