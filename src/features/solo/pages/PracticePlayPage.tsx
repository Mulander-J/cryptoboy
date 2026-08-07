import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { usePracticeSession } from '@/app/PracticeSessionContext'
import { useProgress } from '@/app/ProgressContext'
import {
  customOptionsToLevelConfig,
  sanitizeOptions,
} from '@/data/customPractice'
import { GameBoard } from '../GameBoard'

export function PracticePlayPage() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const { draft, secret, clearSecret } = usePracticeSession()
  const options = sanitizeOptions(draft)
  const config = customOptionsToLevelConfig(options)

  // 开启了预设答案但内存里没有密：回到设密页
  if (options.presetSecret && !secret) {
    return <Navigate to={ROUTES.practiceSetSecret} replace />
  }

  return (
    <GameBoard
      key={
        secret
          ? `practice-preset-${secret.join('')}-${JSON.stringify(config)}`
          : `practice-${JSON.stringify(config)}`
      }
      mode="practice"
      difficulty={config.difficulty}
      level={0}
      customConfig={config}
      initialSecret={secret ?? undefined}
      sound={progress.settings.sound}
      confirmSubmit={progress.settings.confirmSubmit}
      onMenu={() => {
        clearSecret()
        void navigate(ROUTES.practiceSetup)
      }}
    />
  )
}
