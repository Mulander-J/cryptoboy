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
    levelBtn: string
    soloHint: string
    practiceTitle: string
    practiceCta: string
    practiceHint: string
    helpTitle: string
    helpLabel: string
    helpTutorial: string
    themeLabel: string
    soundLabel: string
    soundOn: string
    soundOff: string
    colorBlindLabel: string
    colorBlindOn: string
    colorBlindOff: string
    colorBlindHint: string
    confirmSubmitLabel: string
    confirmSubmitOn: string
    confirmSubmitOff: string
    confirmSubmitHint: string
    progressLabel: string
    progressReset: string
    progressResetConfirm: string
    aboutLabel: string
    helpHint: string
  }
  difficulty: Record<Difficulty, string>
  custom: {
    back: string
    title: string
    badge: string
    presetsTitle: string
    presetsHint: string
    intensityTitle: string
    intensityAria: string
    intensityMarks: string
    intensityHint: string
    detailsTitle: string
    colorCount: string
    colorOption: string
    allowRepeat: string
    hintStyle: string
    hintColumn: string
    hintSummary: string
    timed: string
    timeLimit: string
    seconds: string
    presetSecret: string
    presetSecretHint: string
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
    practiceBadge: string
    practiceRepeat: string
    practiceTimed: string
    practicePreset: string
    practiceColors: string
    tip: string
    remaining: string
    elapsed: string
    paused: string
    confirmSubmitTitle: string
    confirmSubmitBody: string
    confirmSubmitOk: string
    confirmSubmitCancel: string
  }
  result: {
    won: string
    lost: string
    timeout: string
    timeUsed: string
    withinLimit: string
    best: string
    newRecord: string
    secret: string
    next: string
    playAgain: string
    retry: string
    mainMenu: string
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
    submit: string
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
