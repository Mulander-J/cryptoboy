import { colorsForCount, nextColor } from './colors'
import { evaluate, evaluateEasy, isWin } from './evaluate'
import {
  buildFateCasePhase,
  resolveShot,
  type FateCaseChoice,
  type FateCasePhase,
} from './fateCase'
import type {
  Attempt,
  ColorToken,
  EditableGuess,
  GameStatus,
  Guess,
  LevelConfig,
  LoseReason,
  Password,
} from './types'
import { MAX_ATTEMPTS, PASSWORD_LENGTH } from './types'

export type GameSession = {
  secret: Password
  config: LevelConfig
  attempts: Attempt[]
  currentGuess: EditableGuess
  cursor: number
  status: GameStatus
  maxAttempts: typeof MAX_ATTEMPTS
  loseReason: LoseReason | null
  fateCaseEnabled: boolean
  fateCase: FateCasePhase | null
  /** 收官开枪结果（颜色或空弹）；超时未开则为 null */
  fateCaseShot: FateCaseChoice | null
}

export type SessionAction =
  | { type: 'SET_SLOT'; index: number; color: ColorToken }
  | { type: 'CYCLE_SLOT'; index?: number }
  | { type: 'SELECT_SLOT'; index: number }
  | { type: 'NEXT_SLOT' }
  | { type: 'SUBMIT' }
  | { type: 'FIRE'; choice: FateCaseChoice }
  | { type: 'TIMEOUT' }
  | { type: 'RESTART'; secret: Password; config?: LevelConfig }

export function emptyGuess(): EditableGuess {
  return [null, null, null, null]
}

export function createSession(secret: Password, config: LevelConfig): GameSession {
  return {
    secret,
    config,
    attempts: [],
    currentGuess: emptyGuess(),
    cursor: 0,
    status: 'editing',
    maxAttempts: MAX_ATTEMPTS,
    loseReason: null,
    fateCaseEnabled: Boolean(config.fateCaseEnabled),
    fateCase: null,
    fateCaseShot: null,
  }
}

export function isGuessComplete(guess: EditableGuess): boolean {
  return guess.every((c): c is ColorToken => c !== null)
}

export function toGuess(guess: EditableGuess): Guess | null {
  if (!isGuessComplete(guess)) return null
  return [guess[0]!, guess[1]!, guess[2]!, guess[3]!] as Guess
}

export function reduceSession(state: GameSession, action: SessionAction): GameSession {
  if (action.type === 'RESTART') {
    return createSession(action.secret, action.config ?? state.config)
  }

  if (state.status === 'won' || state.status === 'lost') {
    return state
  }

  if (state.status === 'fateCase') {
    return reduceFateCase(state, action)
  }

  // editing
  switch (action.type) {
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

    case 'CYCLE_SLOT': {
      const index = action.index ?? state.cursor
      if (index < 0 || index >= PASSWORD_LENGTH) return state
      const palette = colorsForCount(state.config.colorCount)
      const currentGuess = [...state.currentGuess] as EditableGuess
      currentGuess[index] = nextColor(currentGuess[index] ?? null, palette)
      return { ...state, currentGuess, cursor: index }
    }

    case 'SUBMIT': {
      const guess = toGuess(state.currentGuess)
      if (!guess) return state
      const feedback =
        state.config.hintStyle === 'column'
          ? evaluateEasy(state.secret, guess)
          : evaluate(state.secret, guess)

      const attempt: Attempt = {
        guess,
        feedback,
        rowIndex: state.attempts.length,
      }
      const attempts = [...state.attempts, attempt]

      if (isWin(feedback)) {
        return {
          ...state,
          attempts,
          currentGuess: emptyGuess(),
          status: 'won',
          loseReason: null,
          fateCase: null,
        }
      }

      if (state.fateCaseEnabled && feedback.exactCount === 3) {
        const phase = buildFateCasePhase(state.secret, guess, state.config)
        if (phase) {
          return {
            ...state,
            attempts,
            currentGuess: emptyGuess(),
            status: 'fateCase',
            loseReason: null,
            fateCase: phase,
          }
        }
      }

      if (attempts.length >= state.maxAttempts) {
        return {
          ...state,
          attempts,
          currentGuess: emptyGuess(),
          status: 'lost',
          loseReason: 'attempts',
          fateCase: null,
        }
      }

      return {
        ...state,
        attempts,
        currentGuess: emptyGuess(),
        cursor: 0,
        status: 'editing',
        fateCase: null,
      }
    }

    case 'TIMEOUT': {
      return {
        ...state,
        currentGuess: emptyGuess(),
        status: 'lost',
        loseReason: 'timeout',
        fateCase: null,
      }
    }

    default:
      return state
  }
}

function reduceFateCase(state: GameSession, action: SessionAction): GameSession {
  switch (action.type) {
    case 'FIRE': {
      if (!state.fateCase) return state
      const outcome = resolveShot(action.choice, state.secret, state.fateCase.hangingIndex)
      if (outcome === 'hit') {
        return {
          ...state,
          status: 'won',
          loseReason: null,
          fateCase: state.fateCase,
          fateCaseShot: action.choice,
        }
      }
      // 一枪定负（无尽）；否则保持收官态，可连开至超时
      if (state.config.fateCaseOneShot) {
        return {
          ...state,
          status: 'lost',
          loseReason: 'fateCase',
          fateCase: state.fateCase,
          fateCaseShot: action.choice,
        }
      }
      return {
        ...state,
        status: 'fateCase',
        loseReason: null,
        fateCase: state.fateCase,
        fateCaseShot: action.choice,
      }
    }

    case 'TIMEOUT': {
      return {
        ...state,
        status: 'lost',
        loseReason: 'timeout',
      }
    }

    default:
      return state
  }
}
