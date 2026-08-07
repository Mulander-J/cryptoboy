import { useReducer, useState } from 'react'
import { colorsForCount } from '../../domain/colors'
import {
  colorsUsedElsewhere,
  cycleColorInPalette,
  emptyGuess,
  isGuessComplete,
  resolvePassword,
} from '../../domain'
import type { ColorToken, EditableGuess, LevelConfig, Password } from '../../domain/types'
import { PASSWORD_LENGTH } from '../../domain/types'
import { useI18n } from '../../i18n'
import { playSound } from '../../ui/audio/sound'
import { ColorPalette } from '../../ui/device/ColorPalette'
import { DeviceShell } from '../../ui/device/DeviceShell'
import { LedGrid } from '../../ui/device/LedGrid'
import { ModalBackdrop } from '../../ui/ModalBackdrop'
import { useHelp } from '../help/HelpController'
import { GameTopbar } from '../solo/GameTopbar'
import { useGameKeyboard } from '../solo/useGameKeyboard'

type Phase = 'entry' | 'handoff'

type EntryState = {
  currentGuess: EditableGuess
  cursor: number
}

type EntryAction =
  | { type: 'SET_SLOT'; index: number; color: ColorToken }
  | { type: 'SELECT_SLOT'; index: number }
  | { type: 'NEXT_SLOT' }
  | { type: 'RESET' }

function entryReducer(state: EntryState, action: EntryAction): EntryState {
  switch (action.type) {
    case 'RESET':
      return { currentGuess: emptyGuess(), cursor: 0 }
    case 'SELECT_SLOT': {
      if (action.index < 0 || action.index >= PASSWORD_LENGTH) return state
      return { ...state, cursor: action.index }
    }
    case 'NEXT_SLOT':
      return { ...state, cursor: (state.cursor + 1) % PASSWORD_LENGTH }
    case 'SET_SLOT': {
      if (action.index < 0 || action.index >= PASSWORD_LENGTH) return state
      const currentGuess = [...state.currentGuess] as EditableGuess
      currentGuess[action.index] = action.color
      return { ...state, currentGuess, cursor: action.index }
    }
    default:
      return state
  }
}

type Props = {
  config: LevelConfig
  sound: boolean
  onConfirm: (secret: Password) => void
  onBack: () => void
}

export function PracticeSetSecret({ config, sound, onConfirm, onBack }: Props) {
  const { m, t } = useI18n()
  const { open: helpOpen, openHelp } = useHelp()
  const [phase, setPhase] = useState<Phase>('entry')
  const [secret, setSecret] = useState<Password | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [entry, dispatch] = useReducer(entryReducer, undefined, () => ({
    currentGuess: emptyGuess(),
    cursor: 0,
  }))

  const palette = colorsForCount(config.colorCount)
  const complete = isGuessComplete(entry.currentGuess)
  const resolved = resolvePassword(entry.currentGuess, {
    colorCount: config.colorCount,
    allowRepeat: config.allowRepeat,
  })
  const blockedAtCursor = config.allowRepeat
    ? []
    : colorsUsedElsewhere(entry.currentGuess, entry.cursor)
  const blockedSet = new Set(blockedAtCursor)

  function cycleAt(index: number, direction: 1 | -1 = 1) {
    const blocked = config.allowRepeat
      ? new Set<ColorToken>()
      : new Set(colorsUsedElsewhere(entry.currentGuess, index))
    const color = cycleColorInPalette(
      entry.currentGuess[index],
      palette,
      direction,
      blocked,
    )
    if (color == null) return
    playSound('tick', sound)
    dispatch({ type: 'SET_SLOT', index, color })
    setError(null)
  }

  function moveCursor(delta: -1 | 1) {
    playSound('move', sound)
    const next = (entry.cursor + delta + PASSWORD_LENGTH) % PASSWORD_LENGTH
    dispatch({ type: 'SELECT_SLOT', index: next })
  }

  function onCellClick(col: number) {
    if (entry.cursor === col) {
      cycleAt(col, 1)
    } else {
      playSound('move', sound)
      dispatch({ type: 'SELECT_SLOT', index: col })
    }
  }

  function onPick(color: ColorToken) {
    if (!palette.includes(color)) {
      setError(m.custom.presetInvalidColor)
      return
    }
    if (!config.allowRepeat && blockedSet.has(color)) {
      setError(m.custom.presetInvalidRepeat)
      playSound('lose', sound)
      return
    }
    playSound('tick', sound)
    dispatch({ type: 'SET_SLOT', index: entry.cursor, color })
    setError(null)
  }

  function tryConfirm() {
    if (!complete) return
    if (!resolved) {
      setError(
        !config.allowRepeat ? m.custom.presetInvalidRepeat : m.custom.presetInvalid,
      )
      playSound('lose', sound)
      return
    }
    playSound('submit', sound)
    setSecret(resolved)
    setPhase('handoff')
  }

  function finishHandoff() {
    if (!secret) return
    playSound('submit', sound)
    onConfirm(secret)
  }

  useGameKeyboard({
    active: phase === 'entry',
    helpOpen,
    resultOpen: false,
    editing: true,
    colorCount: config.colorCount,
    onPickColor: onPick,
    onMoveCursor: moveCursor,
    onCycle: (dir) => cycleAt(entry.cursor, dir),
    onSubmit: tryConfirm,
    onEscape: onBack,
  })

  const badge = t(m.game.practiceBadge, {
    colors: t(m.game.practiceColors, { n: config.colorCount }),
    repeat: config.allowRepeat ? m.game.practiceRepeat : '',
    timed: config.timerMode === 'countdown' ? m.game.practiceTimed : '',
    preset: m.game.practicePreset,
  })

  const rulesLine = t(m.custom.presetEntryRules, {
    colors: t(m.game.practiceColors, { n: config.colorCount }),
    repeat: config.allowRepeat ? m.custom.presetRulesRepeatOn : m.custom.presetRulesRepeatOff,
  })

  if (phase === 'handoff') {
    return (
      <ModalBackdrop labelledBy="handoff-title" className="handoff-backdrop">
        <div className="handoff-modal">
          <h2 id="handoff-title">{m.custom.handoffTitle}</h2>
          <p>{m.custom.handoffBody}</p>
          <button type="button" className="btn btn-primary" onClick={finishHandoff}>
            {m.custom.handoffReady}
          </button>
        </div>
      </ModalBackdrop>
    )
  }

  return (
    <div className="game-screen">
      <GameTopbar
        menuLabel={m.custom.back}
        helpLabel={m.game.help}
        badge={badge}
        onMenu={onBack}
        onHelp={openHelp}
      />

      <div className="set-secret-banner">
        <h2>{m.custom.presetEntryTitle}</h2>
        <p>{m.custom.presetEntryHint}</p>
        <p className="set-secret-rules">{rulesLine}</p>
      </div>

      <DeviceShell
        level={0}
        statusLight="idle"
        knobDisabled={false}
        submitDisabled={!resolved}
        onSubmitClick={tryConfirm}
        onKnobRotate={(dir) => cycleAt(entry.cursor, dir)}
        onKnobShortPress={() => {
          playSound('move', sound)
          dispatch({ type: 'NEXT_SLOT' })
        }}
        onKnobLongPress={tryConfirm}
        footerExtra={
          <ColorPalette
            colorCount={config.colorCount}
            selected={entry.currentGuess[entry.cursor] ?? null}
            disabled={false}
            disabledColors={blockedAtCursor}
            onPick={onPick}
          />
        }
      >
        <LedGrid
          attempts={[]}
          currentGuess={entry.currentGuess}
          cursor={entry.cursor}
          editing
          hintStyle={config.hintStyle}
          onCellClick={onCellClick}
        />
      </DeviceShell>

      {error ? <p className="set-secret-error">{error}</p> : null}
      <p className="game-help">{m.custom.presetEntryTip}</p>
    </div>
  )
}
