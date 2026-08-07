import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { colorsForCount, nextColor } from '../../domain/colors'
import { elapsedMs as clockElapsed } from '../../domain/clock'
import { generate, levelSeed } from '../../domain/generate'
import {
  createSession,
  isGuessComplete,
  reduceSession,
  type GameSession,
  type SessionAction,
} from '../../domain/session'
import type { ColorToken, Difficulty, LevelConfig, Password } from '../../domain/types'
import { PASSWORD_LENGTH } from '../../domain/types'
import { levelConfig, practiceConfig } from '../../data/levels'
import { useI18n } from '../../i18n'
import { ColorPalette } from '../../ui/device/ColorPalette'
import { DeviceShell } from '../../ui/device/DeviceShell'
import { LedGrid } from '../../ui/device/LedGrid'
import { ResultModal } from '../../ui/ResultModal'
import { TimerDisplay } from '../../ui/TimerDisplay'
import { playSound } from '../../ui/audio/sound'
import { useHelp } from '../help/HelpController'
import { GameTopbar } from './GameTopbar'
import { useGameClock } from './useGameClock'
import { useGameKeyboard } from './useGameKeyboard'

type Mode = 'solo' | 'practice'

type Props = {
  mode: Mode
  difficulty: Difficulty
  level: number
  sound: boolean
  /** 自定义练习完整配置；有则覆盖 practiceConfig(difficulty) */
  customConfig?: LevelConfig
  /** 预设答案（本地双人）；有则跳过随机生成，重试保持同密 */
  initialSecret?: Password
  /** 该关进入前的最佳用时 */
  bestTimeMs?: number
  onClearLevel?: (level: number, elapsedMs: number) => void
  onNextLevel?: () => void
  onMenu: () => void
}

function buildConfig(
  mode: Mode,
  difficulty: Difficulty,
  level: number,
  customConfig?: LevelConfig,
): LevelConfig {
  if (mode === 'practice') {
    return customConfig ?? practiceConfig(difficulty)
  }
  return levelConfig(difficulty, level)
}

function buildSecret(
  mode: Mode,
  difficulty: Difficulty,
  level: number,
  config: LevelConfig,
  initialSecret?: Password,
): Password {
  if (initialSecret) return initialSecret
  const seed =
    mode === 'practice'
      ? (Math.floor(Math.random() * 0xffffffff) >>> 0)
      : levelSeed(difficulty, level)
  return generate(seed, {
    colorCount: config.colorCount,
    allowRepeat: config.allowRepeat,
  })
}

function sessionReducer(state: GameSession, action: SessionAction): GameSession {
  return reduceSession(state, action)
}

export function GameBoard({
  mode,
  difficulty,
  level,
  sound,
  customConfig,
  initialSecret,
  bestTimeMs,
  onClearLevel,
  onNextLevel,
  onMenu,
}: Props) {
  const { m, t } = useI18n()
  const { open: helpOpen, openHelp } = useHelp()
  const config = useMemo(
    () => buildConfig(mode, difficulty, level, customConfig),
    [mode, difficulty, level, customConfig],
  )

  const [session, dispatch] = useReducer(
    sessionReducer,
    undefined,
    () =>
      createSession(buildSecret(mode, difficulty, level, config, initialSecret), config),
  )

  const [clockResetKey, setClockResetKey] = useState(0)
  const [resultElapsed, setResultElapsed] = useState<number | undefined>()
  const [resultBest, setResultBest] = useState<number | undefined>(bestTimeMs)
  const [isNewBest, setIsNewBest] = useState(false)
  const prevStatus = useRef(session.status)
  const urgentBeeped = useRef(false)

  const clock = useGameClock({
    config,
    helpOpen,
    gameStatus: session.status,
    resetKey: clockResetKey,
    onExpire: () => dispatch({ type: 'TIMEOUT' }),
  })

  useEffect(() => {
    if (clock.mode === 'countdown' && clock.displayedMs <= 10_000 && clock.displayedMs > 0) {
      if (!urgentBeeped.current && clock.status === 'running') {
        urgentBeeped.current = true
        playSound('urgent', sound)
      }
    } else if (clock.displayedMs > 10_000) {
      urgentBeeped.current = false
    }
  }, [clock.displayedMs, clock.mode, clock.status, sound])

  const clockRef = useRef(clock)
  clockRef.current = clock

  useEffect(() => {
    if (prevStatus.current === session.status) return
    if (session.status === 'won') {
      const elapsed = clockElapsed(clockRef.current)
      setResultElapsed(elapsed)
      playSound('win', sound)
      if (mode === 'solo') {
        const prevBest = bestTimeMs
        const newer = prevBest === undefined || elapsed < prevBest
        setIsNewBest(newer)
        setResultBest(newer ? elapsed : prevBest)
        onClearLevel?.(level, elapsed)
      } else {
        setResultBest(undefined)
        setIsNewBest(false)
      }
    } else if (session.status === 'lost') {
      setResultElapsed(clockElapsed(clockRef.current))
      setIsNewBest(false)
      setResultBest(bestTimeMs)
      playSound('lose', sound)
    }
    prevStatus.current = session.status
  }, [session.status, sound, mode, level, bestTimeMs, onClearLevel])

  function restart(nextLevel = level) {
    const nextConfig = buildConfig(mode, difficulty, nextLevel, customConfig)
    const secret = buildSecret(mode, difficulty, nextLevel, nextConfig, initialSecret)
    dispatch({ type: 'RESTART', secret, config: nextConfig })
    prevStatus.current = 'editing'
    urgentBeeped.current = false
    setResultElapsed(undefined)
    setIsNewBest(false)
    setResultBest(bestTimeMs)
    setClockResetKey((k) => k + 1)
  }

  function submit() {
    if (!isGuessComplete(session.currentGuess) || session.status !== 'editing') return
    playSound('submit', sound)
    dispatch({ type: 'SUBMIT' })
  }

  function cycleAt(index: number, direction: 1 | -1 = 1) {
    if (session.status !== 'editing') return
    const palette = colorsForCount(session.config.colorCount)
    let color = session.currentGuess[index]
    if (direction === 1) {
      color = nextColor(color, palette)
    } else if (color === null) {
      color = palette[palette.length - 1]!
    } else {
      const idx = palette.indexOf(color)
      color = palette[(idx - 1 + palette.length) % palette.length]!
    }
    playSound('tick', sound)
    dispatch({ type: 'SET_SLOT', index, color })
  }

  function moveCursor(delta: -1 | 1) {
    if (session.status !== 'editing') return
    playSound('move', sound)
    const next = (session.cursor + delta + PASSWORD_LENGTH) % PASSWORD_LENGTH
    dispatch({ type: 'SELECT_SLOT', index: next })
  }

  function onCellClick(col: number) {
    if (session.cursor === col) {
      cycleAt(col, 1)
    } else {
      playSound('move', sound)
      dispatch({ type: 'SELECT_SLOT', index: col })
    }
  }

  function onPick(color: ColorToken) {
    if (session.status !== 'editing') return
    playSound('tick', sound)
    dispatch({ type: 'SET_SLOT', index: session.cursor, color })
  }

  const editing = session.status === 'editing'
  const resultOpen = session.status === 'won' || session.status === 'lost'
  const statusLight =
    session.status === 'won' ? 'win' : session.status === 'lost' ? 'lose' : 'play'

  useGameKeyboard({
    active: true,
    helpOpen,
    resultOpen,
    editing,
    colorCount: session.config.colorCount,
    onPickColor: onPick,
    onMoveCursor: moveCursor,
    onCycle: (dir) => cycleAt(session.cursor, dir),
    onSubmit: submit,
    onEscape: onMenu,
  })

  const practiceBadge = t(m.game.practiceBadge, {
    colors: t(m.game.practiceColors, { n: session.config.colorCount }),
    repeat: session.config.allowRepeat ? m.game.practiceRepeat : '',
    timed: session.config.timerMode === 'countdown' ? m.game.practiceTimed : '',
    preset: initialSecret ? m.game.practicePreset : '',
  })

  return (
    <div className="game-screen">
      <GameTopbar
        menuLabel={m.game.menu}
        helpLabel={m.game.help}
        badge={
          mode === 'practice'
            ? practiceBadge
            : t(m.game.soloBadge, { difficulty: m.difficulty[difficulty] })
        }
        onMenu={onMenu}
        onHelp={openHelp}
      />

      <TimerDisplay
        clock={clock}
        label={clock.mode === 'countdown' ? m.game.remaining : m.game.elapsed}
      />

      <DeviceShell
        level={mode === 'practice' ? 0 : level}
        statusLight={statusLight}
        knobDisabled={!editing}
        submitDisabled={!editing || !isGuessComplete(session.currentGuess)}
        onSubmitClick={submit}
        onKnobRotate={(dir) => cycleAt(session.cursor, dir)}
        onKnobShortPress={() => {
          playSound('move', sound)
          dispatch({ type: 'NEXT_SLOT' })
        }}
        onKnobLongPress={submit}
        footerExtra={
          <ColorPalette
            colorCount={session.config.colorCount}
            selected={session.currentGuess[session.cursor] ?? null}
            disabled={!editing}
            onPick={onPick}
          />
        }
      >
        <LedGrid
          attempts={session.attempts}
          currentGuess={session.currentGuess}
          cursor={session.cursor}
          editing={editing}
          hintStyle={session.config.hintStyle}
          onCellClick={onCellClick}
        />
      </DeviceShell>

      <p className="game-help">{m.game.tip}</p>

      {resultOpen ? (
        <ResultModal
          status={session.status === 'won' ? 'won' : 'lost'}
          secret={session.secret}
          showNext={mode === 'solo' && session.status === 'won'}
          loseReason={session.loseReason}
          timerMode={session.config.timerMode}
          elapsedMs={resultElapsed}
          bestTimeMs={mode === 'solo' ? resultBest : undefined}
          isNewBest={isNewBest}
          onRetry={() => restart(level)}
          onNext={
            mode === 'solo' && onNextLevel
              ? () => {
                  onNextLevel()
                }
              : undefined
          }
          onMenu={onMenu}
        />
      ) : null}
    </div>
  )
}
