import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { parseDifficulty, parseLevel, ROUTES, soloPath } from '@/app/paths'
import { useProgress } from '@/app/ProgressContext'
import { MAX_LEVELS } from '@/data/levels'
import { getBestTime, getUnlockedLevel } from '@/data/progress'
import { GameBoard } from '../GameBoard'

export function SoloPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { progress, clearLevel } = useProgress()

  const difficulty = parseDifficulty(params.difficulty)
  const levelRaw = parseLevel(params.level)

  if (!difficulty || levelRaw == null) {
    return <Navigate to={ROUTES.home} replace />
  }

  const max = MAX_LEVELS[difficulty]
  const unlocked = getUnlockedLevel(progress.solo[difficulty], max)
  const level = Math.min(max, Math.max(1, levelRaw))

  // 未解锁关卡：拉回当前解锁关
  if (level > unlocked) {
    return <Navigate to={soloPath(difficulty, unlocked)} replace />
  }

  // 规范化 URL（如 /solo/easy/01 → /solo/easy/1；/solo/challenge/n → nightmare）
  if (params.difficulty !== difficulty || String(level) !== params.level) {
    return <Navigate to={soloPath(difficulty, level)} replace />
  }

  const cycle = progress.solo[difficulty].cycle

  return (
    <GameBoard
      key={`solo-${difficulty}-${cycle}-${level}`}
      mode="solo"
      difficulty={difficulty}
      level={level}
      cycle={cycle}
      sound={progress.settings.sound}
      confirmSubmit={progress.settings.confirmSubmit}
      bestTimeMs={getBestTime(progress, difficulty, level)}
      onClearLevel={(clearedLevel, elapsedMs) =>
        clearLevel(difficulty, clearedLevel, elapsedMs)
      }
      onNextLevel={() => {
        const next = Math.min(max, level + 1)
        void navigate(soloPath(difficulty, next))
      }}
      onMenu={() => void navigate(ROUTES.home)}
    />
  )
}
