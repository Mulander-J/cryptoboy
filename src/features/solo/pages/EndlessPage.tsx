import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { useProgress } from '@/app/ProgressContext'
import { ENDLESS_MATCH_MS, endlessRoundConfig } from '@/data/levels'
import type { Password } from '@/domain/types'
import { ResultModal } from '@/ui/ResultModal'
import { GameBoard } from '../GameBoard'

type Ended = {
  clears: number
  secret: Password
  isNewBest: boolean
}

export function EndlessPage() {
  const navigate = useNavigate()
  const { progress, recordEndless } = useProgress()
  const [clears, setClears] = useState(0)
  const [remainingMs, setRemainingMs] = useState(ENDLESS_MATCH_MS)
  const [roundKey, setRoundKey] = useState(0)
  const [ended, setEnded] = useState<Ended | null>(null)
  const [bestAtRunStart] = useState(progress.endless.bestClears)

  const config = endlessRoundConfig(clears, remainingMs)

  const finishRun = useCallback(
    (finalClears: number, secret: Password) => {
      const isNewBest = finalClears > bestAtRunStart
      recordEndless(finalClears)
      setEnded({ clears: finalClears, secret, isNewBest })
    },
    [bestAtRunStart, recordEndless],
  )

  const onEndlessWon = useCallback(
    (remaining: number, secret: Password) => {
      const next = clears + 1
      if (remaining <= 0) {
        finishRun(next, secret)
        return
      }
      setClears(next)
      setRemainingMs(remaining)
      setRoundKey((k) => k + 1)
    },
    [clears, finishRun],
  )

  const onEndlessLost = useCallback(
    (secret: Password) => {
      finishRun(clears, secret)
    },
    [clears, finishRun],
  )

  const restartRun = useCallback(() => {
    setEnded(null)
    setClears(0)
    setRemainingMs(ENDLESS_MATCH_MS)
    setRoundKey((k) => k + 1)
  }, [])

  if (ended) {
    return (
      <div className="game-screen">
        <ResultModal
          status="lost"
          secret={ended.secret}
          endlessClears={ended.clears}
          endlessBestClears={bestAtRunStart}
          isNewEndlessBest={ended.isNewBest}
          onRetry={restartRun}
          onMenu={() => void navigate(ROUTES.home)}
        />
      </div>
    )
  }

  return (
    <GameBoard
      key={roundKey}
      mode="endless"
      difficulty="nightmare"
      level={0}
      sound={progress.settings.sound}
      confirmSubmit={progress.settings.confirmSubmit}
      customConfig={config}
      endlessClears={clears}
      onEndlessWon={onEndlessWon}
      onEndlessLost={onEndlessLost}
      onMenu={() => void navigate(ROUTES.home)}
    />
  )
}
