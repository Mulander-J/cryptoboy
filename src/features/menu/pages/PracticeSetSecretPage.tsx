import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { usePracticeSession } from '@/app/PracticeSessionContext'
import { useProgress } from '@/app/ProgressContext'
import {
  customOptionsToLevelConfig,
  sanitizeOptions,
} from '@/data/customPractice'
import { PracticeSetSecret } from '../PracticeSetSecret'

export function PracticeSetSecretPage() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const { draft, setSecret, clearSecret } = usePracticeSession()
  const config = customOptionsToLevelConfig(sanitizeOptions(draft))

  if (!sanitizeOptions(draft).presetSecret) {
    return <Navigate to={ROUTES.practiceSetup} replace />
  }

  return (
    <PracticeSetSecret
      config={config}
      sound={progress.settings.sound}
      onBack={() => {
        clearSecret()
        void navigate(ROUTES.practiceSetup)
      }}
      onConfirm={(secret) => {
        setSecret(secret)
        void navigate(ROUTES.practicePlay)
      }}
    />
  )
}
