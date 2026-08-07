import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { usePracticeSession } from '@/app/PracticeSessionContext'
import { sanitizeOptions } from '@/data/customPractice'
import { CustomPracticeSetup } from '../CustomPracticeSetup'

export function PracticeSetupPage() {
  const navigate = useNavigate()
  const { draft, setDraft, clearSecret } = usePracticeSession()

  function onStart() {
    const clean = sanitizeOptions(draft)
    setDraft(clean)
    clearSecret()
    if (clean.presetSecret) {
      void navigate(ROUTES.practiceSetSecret)
      return
    }
    void navigate(ROUTES.practicePlay)
  }

  return (
    <CustomPracticeSetup
      value={draft}
      onChange={setDraft}
      onStart={onStart}
      onBack={() => void navigate(ROUTES.home)}
    />
  )
}
