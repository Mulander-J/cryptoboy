import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useProgress } from '@/app/ProgressContext'
import { levelConfig, practiceConfig } from '@/data/levels'
import { colorsForCount, nextColor } from '@/domain/colors'
import {
  resolveFateCaseAutoStart,
  resolveFateCaseEnabled,
  resolveFateCaseOneShot,
  resolveFateCasePlayMode,
  resolveFateCaseSpinSpeed,
  resolveShot,
  type FateCaseChoice,
} from '@/domain/fateCase'
import { generate, levelSeed } from '@/domain/generate'
import {
  createSession,
  isGuessComplete,
  reduceSession,
  type GameSession,
  type SessionAction,
} from '@/domain/session'
import type { ColorToken, Difficulty, LevelConfig, Password } from '@/domain/types'
import { PASSWORD_LENGTH } from '@/domain/types'
import { useI18n } from '@/i18n'
import { ColorPalette } from '@/ui/device/ColorPalette'
import { DeviceShell } from '@/ui/device/DeviceShell'
import { LedGrid } from '@/ui/device/LedGrid'
import { ConfirmSubmitModal } from '@/ui/ConfirmSubmitModal'
import { ResultModal } from '@/ui/ResultModal'
import { TimerDisplay } from '@/ui/TimerDisplay'
import { playSound } from '@/ui/audio/sound'
import { useHelp } from '@/features/help/HelpController'
import { GameTopbar } from './GameTopbar'
import { FateCaseMoment } from './FateCaseMoment'
import { useGameClock } from './useGameClock'
import { useGameKeyboard } from './useGameKeyboard'

type Mode = 'solo' | 'practice' | 'endless'

type Props = {
  mode: Mode
  difficulty: Difficulty
  level: number
  sound: boolean
  /** 提交前二次确认（设置项） */
  confirmSubmit?: boolean
  /** 自定义练习 / 无尽完整配置；有则覆盖默认 */
  customConfig?: LevelConfig
  /** 预设答案（本地双人）；有则跳过随机生成，重试保持同密 */
  initialSecret?: Password
  /** 该关进入前的最佳用时 */
  bestTimeMs?: number
  /** 无尽：当前连胜（已破译局数） */
  endlessClears?: number
  onClearLevel?: (level: number, elapsedMs: number) => void
  onNextLevel?: () => void
  /** 无尽破译成功：带入本盘剩余时间继续 */
  onEndlessWon?: (remainingMs: number, secret: Password) => void
  /** 无尽本局失败（次数/超时）：整盘结束 */
  onEndlessLost?: (secret: Password) => void
  onMenu: () => void
}

function buildConfig(
  mode: Mode,
  difficulty: Difficulty,
  level: number,
  themeId: string,
  customConfig?: LevelConfig,
): LevelConfig {
  const base =
    mode === 'practice' || mode === 'endless'
      ? (customConfig ?? practiceConfig(difficulty))
      : levelConfig(difficulty, level)
  return {
    ...base,
    fateCaseEnabled: resolveFateCaseEnabled(mode, difficulty, base.fateCaseEnabled),
    fateCaseAutoStart: resolveFateCaseAutoStart(mode, difficulty, base.fateCaseAutoStart),
    fateCaseSpinSpeed: resolveFateCaseSpinSpeed(mode, difficulty, base.fateCaseSpinSpeed),
    fateCaseOneShot: resolveFateCaseOneShot(mode, difficulty, base.fateCaseOneShot),
    fateCasePlayMode: resolveFateCasePlayMode(themeId, base.fateCasePlayMode),
  }
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
    mode === 'practice' || mode === 'endless'
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
  confirmSubmit = false,
  customConfig,
  initialSecret,
  bestTimeMs,
  endlessClears = 0,
  onClearLevel,
  onNextLevel,
  onEndlessWon,
  onEndlessLost,
  onMenu,
}: Props) {
  const { m, t } = useI18n()
  const { progress } = useProgress()
  const { open: helpOpen, openHelp } = useHelp()
  const themeId = progress.settings.theme
  const config = useMemo(
    () => buildConfig(mode, difficulty, level, themeId, customConfig),
    [mode, difficulty, level, themeId, customConfig],
  )

  const [session, dispatch] = useReducer(
    sessionReducer,
    undefined,
    () =>
      createSession(buildSecret(mode, difficulty, level, config, initialSecret), config),
  )

  const [clockResetKey, setClockResetKey] = useState(0)
  const [resultElapsed, setResultElapsed] = useState<number | undefined>()
  const [resultBaseMs, setResultBaseMs] = useState<number | undefined>()
  const [resultFateCaseMs, setResultFateCaseMs] = useState<number | undefined>()
  const [resultBest, setResultBest] = useState<number | undefined>(bestTimeMs)
  const [isNewBest, setIsNewBest] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const prevStatus = useRef(session.status)
  const urgentBeeped = useRef(false)

  const clock = useGameClock({
    config: {
      timerMode: config.timerMode,
      timeLimitMs: config.timeLimitMs,
      fateCaseAutoStart: config.fateCaseAutoStart,
    },
    helpOpen,
    confirmOpen,
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

  useEffect(() => {
    if (prevStatus.current === session.status) return
    if (session.status === 'fateCase') {
      playSound('submit', sound)
    } else if (session.status === 'won') {
      const parts = clock.scoreBreakdown()
      playSound('win', sound)
      if (mode === 'endless') {
        const limit = session.config.timeLimitMs ?? 0
        const remaining = Math.max(0, limit - parts.totalMs)
        onEndlessWon?.(remaining, session.secret)
      } else if (mode === 'solo') {
        setResultElapsed(parts.totalMs)
        setResultBaseMs(parts.fateCaseMs > 0 ? parts.baseMs : undefined)
        setResultFateCaseMs(parts.fateCaseMs > 0 ? parts.fateCaseMs : undefined)
        const prevBest = bestTimeMs
        const newer = prevBest === undefined || parts.totalMs < prevBest
        setIsNewBest(newer)
        setResultBest(newer ? parts.totalMs : prevBest)
        onClearLevel?.(level, parts.totalMs)
      } else {
        setResultElapsed(parts.totalMs)
        setResultBaseMs(parts.fateCaseMs > 0 ? parts.baseMs : undefined)
        setResultFateCaseMs(parts.fateCaseMs > 0 ? parts.fateCaseMs : undefined)
        setResultBest(undefined)
        setIsNewBest(false)
      }
    } else if (session.status === 'lost') {
      playSound('lose', sound)
      if (mode === 'endless') {
        onEndlessLost?.(session.secret)
      } else {
        const parts = clock.scoreBreakdown()
        setResultElapsed(parts.totalMs)
        setResultBaseMs(parts.fateCaseMs > 0 ? parts.baseMs : undefined)
        setResultFateCaseMs(parts.fateCaseMs > 0 ? parts.fateCaseMs : undefined)
        setIsNewBest(false)
        setResultBest(bestTimeMs)
      }
    }
    prevStatus.current = session.status
  }, [
    session.status,
    session.secret,
    session.config.timeLimitMs,
    sound,
    mode,
    level,
    bestTimeMs,
    onClearLevel,
    onEndlessWon,
    onEndlessLost,
    clock.scoreBreakdown,
  ])

  function restart(nextLevel = level) {
    const nextConfig = buildConfig(mode, difficulty, nextLevel, customConfig)
    const secret = buildSecret(mode, difficulty, nextLevel, nextConfig, initialSecret)
    dispatch({ type: 'RESTART', secret, config: nextConfig })
    prevStatus.current = 'editing'
    urgentBeeped.current = false
    setResultElapsed(undefined)
    setResultBaseMs(undefined)
    setResultFateCaseMs(undefined)
    setIsNewBest(false)
    setResultBest(bestTimeMs)
    setConfirmOpen(false)
    setClockResetKey((k) => k + 1)
  }

  function commitSubmit() {
    if (!isGuessComplete(session.currentGuess) || session.status !== 'editing') return
    setConfirmOpen(false)
    playSound('submit', sound)
    dispatch({ type: 'SUBMIT' })
  }

  function requestSubmit() {
    if (!isGuessComplete(session.currentGuess) || session.status !== 'editing') return
    if (confirmSubmit) {
      setConfirmOpen(true)
      return
    }
    commitSubmit()
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

  function onFateCaseFire(choice: FateCaseChoice): 'hit' | 'miss' {
    if (session.status !== 'fateCase' || !session.fateCase) return 'miss'
    const outcome = resolveShot(
      choice,
      session.secret,
      session.fateCase.hangingIndex,
    )
    playSound('submit', sound)
    dispatch({ type: 'FIRE', choice })
    return outcome
  }

  const editing = session.status === 'editing'
  const fateCaseOpen = session.status === 'fateCase' && session.fateCase !== null
  /** 无尽胜负均由 EndlessPage 接管结算 */
  const resultOpen =
    mode !== 'endless' && (session.status === 'won' || session.status === 'lost')
  const statusLight =
    session.status === 'won' ? 'win' : session.status === 'lost' ? 'lose' : 'play'

  useGameKeyboard({
    active: true,
    helpOpen,
    resultOpen: resultOpen || fateCaseOpen,
    confirmOpen,
    onConfirmSubmit: commitSubmit,
    onCancelConfirm: () => setConfirmOpen(false),
    editing,
    colorCount: session.config.colorCount,
    onPickColor: onPick,
    onMoveCursor: moveCursor,
    onCycle: (dir) => cycleAt(session.cursor, dir),
    onSubmit: requestSubmit,
    onEscape: onMenu,
  })

  const practiceHint =
    mode === 'practice'
      ? [
          t(m.game.practiceTipColors, { n: session.config.colorCount }),
          session.config.allowRepeat
            ? m.game.practiceTipRepeatOn
            : m.game.practiceTipRepeatOff,
          session.config.timerMode === 'countdown'
            ? m.game.practiceTipTimedOn
            : m.game.practiceTipTimedOff,
          initialSecret ? m.game.practiceTipPreset : null,
          session.fateCaseEnabled ? m.game.practiceTipFateCase : null,
        ]
          .filter(Boolean)
          .join('\n')
      : undefined

  const topBadge =
    mode === 'practice'
      ? m.game.practiceBadge
      : mode === 'endless'
        ? t(m.game.endlessBadge, { n: endlessClears })
        : t(m.game.soloBadge, { difficulty: m.difficulty[difficulty] })

  return (
    <div className={`game-screen${fateCaseOpen ? ' fate-case-active' : ''}`}>
      <GameTopbar
        menuLabel={m.game.menu}
        helpLabel={m.game.help}
        badge={topBadge}
        badgeHint={practiceHint}
        onMenu={onMenu}
        onHelp={openHelp}
      />

      <TimerDisplay
        clock={{
          mode: clock.mode,
          displayedMs: clock.displayedMs,
          limitMs: clock.limitMs,
          status: clock.status,
          pauseReasons: clock.pauseReasons,
        }}
        label={clock.mode === 'countdown' ? m.game.remaining : m.game.elapsed}
      />

      <div className="game-stage">
        <DeviceShell
          level={mode === 'solo' ? level : mode === 'endless' ? endlessClears : 0}
          statusLight={statusLight}
          knobDisabled={!editing || confirmOpen}
          onKnobRotate={(dir) => cycleAt(session.cursor, dir)}
          onKnobShortPress={() => {
            playSound('move', sound)
            dispatch({ type: 'NEXT_SLOT' })
          }}
          onKnobLongPress={requestSubmit}
          footerExtra={
            <ColorPalette
              colorCount={session.config.colorCount}
              selected={session.currentGuess[session.cursor] ?? null}
              disabled={!editing || confirmOpen}
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
      </div>

      <p className="game-help">{m.game.tip}</p>

      {confirmOpen ? (
        <ConfirmSubmitModal
          onConfirm={commitSubmit}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : null}

      {fateCaseOpen && session.fateCase ? (
        <FateCaseMoment
          phase={session.fateCase}
          onFire={onFateCaseFire}
          onStart={clock.startFateCaseWindow}
          live={clock.fateCaseLive}
          remainingMs={clock.fateCaseRemainingMs ?? 0}
          spinSpeed={session.config.fateCaseSpinSpeed ?? 3}
          oneShot={Boolean(session.config.fateCaseOneShot)}
        />
      ) : null}

      {resultOpen ? (
        <ResultModal
          status={session.status === 'won' ? 'won' : 'lost'}
          secret={session.secret}
          revealSecret={mode !== 'solo' || session.status === 'won'}
          showNext={mode === 'solo' && session.status === 'won'}
          loseReason={session.loseReason}
          timerMode={session.config.timerMode}
          elapsedMs={resultElapsed}
          baseElapsedMs={resultBaseMs}
          fateCaseElapsedMs={resultFateCaseMs}
          fateCaseShot={session.fateCaseShot}
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
