import type { Difficulty } from '@/domain/types'

/** React Router basename（无尾斜杠；根站为 `/`） */
export function appBasename(): string {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export const ROUTES = {
  home: '/',
  practiceSetup: '/practice/setup',
  practiceSetSecret: '/practice/set-secret',
  practicePlay: '/practice/play',
  solo: '/solo/:difficulty/:level',
  endless: '/endless',
} as const

export function soloPath(difficulty: Difficulty, level: number): string {
  return `/solo/${difficulty}/${level}`
}

export function parseDifficulty(raw: string | undefined): Difficulty | null {
  if (raw === 'easy' || raw === 'advanced' || raw === 'nightmare') return raw
  // 旧书签 /solo/challenge/n
  if (raw === 'challenge') return 'nightmare'
  return null
}

export function parseLevel(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}
