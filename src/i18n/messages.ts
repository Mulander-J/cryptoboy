import type { ColorToken, Difficulty } from '@/domain/types'
import type { PracticeIntensity } from '@/data/customPractice'
import type { ThemeId } from '@/ui/theme/themes'
import type { Locale } from './types'
import enJson from '@/i18n/locales/en.json'
import zhCNJson from '@/i18n/locales/zh-CN.json'

export type HelpStep = {
  title: string
  body: string[]
}

export type ShortcutCopy = {
  keys: string
  action: string
}

export type Messages = {
  app: {
    name: string
    tagline: string
    description: string
    /** 如「本项目 Agent Stats 100%」 */
    aiCreatedLead: string
    /** logo 后短标签，如「AI 生成」 */
    aiCreated: string
    aiCreatedTitle: string
    githubLabel: string
    githubTitle: string
    mitLicenseTitle: string
  }
  lang: {
    label: string
    zh: string
    en: string
  }
  menu: {
    soloTitle: string
    soloHint: string
    levelBtn: string
    endlessCta: string
    endlessBest: string
    practiceTitle: string
    practiceCta: string
    practiceHint: string
    helpTitle: string
    settingsHint: string
    helpLabel: string
    helpHint: string
    helpTutorial: string
    themeLabel: string
    soundLabel: string
    toggleOn: string
    toggleOff: string
    colorBlindLabel: string
    colorBlindHint: string
    confirmSubmitLabel: string
    confirmSubmitHint: string
    progressLabel: string
    progressHint: string
    progressReset: string
    progressResetConfirm: string
    statsLabel: string
    statsHint: string
    statsCta: string
    aboutLabel: string
  }
  stats: {
    back: string
    title: string
    lead: string
    unlocked: string
    cleared: string
    levelOfMax: string
    levelLabel: string
    noBest: string
    endlessBest: string
    endlessBestValue: string
  }
  difficulty: Record<Difficulty, string>
  custom: {
    back: string
    title: string
    intensityTitle: string
    intensityAria: string
    intensityMarks: string
    intensityHint: string
    detailsTitle: string
    colorCount: string
    allowRepeat: string
    hintStyle: string
    hintStyleHint: string
    hintColumn: string
    hintSummary: string
    timed: string
    timedHint: string
    timeLimit: string
    seconds: string
    presetSecret: string
    presetSecretHint: string
    fateCase: string
    fateCaseHint: string
    fateCaseAutoStart: string
    fateCaseAutoStartHint: string
    fateCaseOneShot: string
    fateCaseOneShotHint: string
    fateCaseDifficulty: string
    fateCaseDifficultyHint: string
    fateCaseDifficultyOption: string
    presetEntryTitle: string
    presetEntryHint: string
    presetEntryRules: string
    presetRulesRepeatOn: string
    presetRulesRepeatOff: string
    presetEntryTip: string
    presetInvalid: string
    presetInvalidRepeat: string
    presetInvalidColor: string
    handoffTitle: string
    handoffBody: string
    handoffReady: string
    start: string
  }
  intensity: Record<PracticeIntensity, string>
  game: {
    menu: string
    help: string
    soloBadge: string
    endlessBadge: string
    practiceBadge: string
    practiceTipColors: string
    practiceTipRepeatOn: string
    practiceTipRepeatOff: string
    practiceTipTimedOn: string
    practiceTipTimedOff: string
    practiceTipPreset: string
    practiceTipFateCase: string
    remaining: string
    elapsed: string
    paused: string
    frozen: string
    confirmSubmitTitle: string
    confirmSubmitBody: string
    confirmSubmitOk: string
    confirmSubmitCancel: string
    /** 收官大标题（总称 Fate Night） */
    fateCaseTitle: string
    fateCaseSubtitleRevolver: string
    fateCaseSubtitleBeat: string
    fateCaseChamberAria: string
    fateCaseBeatAria: string
    fateCaseBlank: string
    fateCaseSpinning: string
    fateCaseReadyRevolver: string
    fateCaseReadyBeat: string
    fateCaseFire: string
    fateCaseLock: string
    fateCaseMissRetry: string
    fateCaseStart: string
  }
  result: {
    won: string
    lost: string
    timeout: string
    fateCaseMiss: string
    fateCaseShot: string
    timeUsed: string
    timeSolve: string
    timeFateCase: string
    timeTotal: string
    withinLimit: string
    best: string
    newRecord: string
    secret: string
    next: string
    playAgain: string
    retry: string
    mainMenu: string
    endlessOver: string
    endlessStreak: string
    endlessBest: string
    endlessAgain: string
  }
  help: {
    title: string
    close: string
    prev: string
    next: string
    done: string
    steps: HelpStep[]
  }
  shortcuts: ShortcutCopy[]
  device: {
    knobAria: string
    knobTitle: string
    levelAria: string
    paletteAria: string
    gridAria: string
    emptySlot: string
    hintSummary: string
  }
  theme: {
    triggerTitle: string
    panelAria: string
    moreAboveHint: string
    moreBelowHint: string
    labels: Record<ThemeId, string>
    blurbs: Record<ThemeId, string>
  }
  color: Record<ColorToken, string>
  notFound: {
    title: string
    body: string
    home: string
  }
}

/** JSON 文案表；结构变更时靠 as Messages + 单测对齐 */
export const zhCN = zhCNJson as Messages
export const en = enJson as Messages

export const CATALOG: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  en,
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key]
    return v === undefined ? `{${key}}` : String(v)
  })
}

/** 浅层 + 帮助步骤数：两语结构一致性检查（单测用） */
export function localeShapeKeys(m: Messages): string[] {
  return [
    ...Object.keys(m),
    ...Object.keys(m.menu).map((k) => `menu.${k}`),
    ...Object.keys(m.theme.labels).map((k) => `theme.labels.${k}`),
    `help.steps:${m.help.steps.length}`,
    `shortcuts:${m.shortcuts.length}`,
  ].sort()
}
