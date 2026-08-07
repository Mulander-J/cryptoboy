import { colorsForCount, nextColor } from './colors'
import { evaluate, evaluateEasy, isWin } from './evaluate'
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
}

export type SessionAction =
  | { type: 'SET_SLOT'; index: number; color: ColorToken }
  | { type: 'CYCLE_SLOT'; index?: number }
  | { type: 'SELECT_SLOT'; index: number }
  | { type: 'NEXT_SLOT' }
  | { type: 'SUBMIT' }
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
  if (state.status !== 'editing' && action.type !== 'RESTART') {
    return state
  }

  switch (action.type) {
    case 'RESTART':
      return createSession(action.secret, action.config ?? state.config)

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
        }
      }

      if (attempts.length >= state.maxAttempts) {
        return {
          ...state,
          attempts,
          currentGuess: emptyGuess(),
          status: 'lost',
          loseReason: 'attempts',
        }
      }

      return {
        ...state,
        attempts,
        currentGuess: emptyGuess(),
        cursor: 0,
        status: 'editing',
      }
    }

    case 'TIMEOUT': {
      if (state.status !== 'editing') return state
      return {
        ...state,
        currentGuess: emptyGuess(),
        status: 'lost',
        loseReason: 'timeout',
      }
    }

    default:
      return state
  }
}
