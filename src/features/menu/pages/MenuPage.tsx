import { useNavigate } from 'react-router-dom'
import { ROUTES, soloPath } from '@/app/paths'
import { usePracticeSession } from '@/app/PracticeSessionContext'
import { useProgress } from '@/app/ProgressContext'
import type { Difficulty } from '@/domain/types'
import { Menu } from '../Menu'

export function MenuPage() {
  const navigate = useNavigate()
  const { progress, updateSettingsPatch } = useProgress()
  const { hydrateDraftFromProgress, clearSecret } = usePracticeSession()

  function startSolo(difficulty: Difficulty) {
    const level = progress.solo[difficulty].unlocked
    void navigate(soloPath(difficulty, level))
  }

  function startEndless() {
    void navigate(ROUTES.endless)
  }

  function openCustom() {
    hydrateDraftFromProgress()
    clearSecret()
    void navigate(ROUTES.practiceSetup)
  }

  return (
    <Menu
      progress={progress}
      onStartSolo={startSolo}
      onStartEndless={startEndless}
      onOpenCustom={openCustom}
      onUpdateSettings={updateSettingsPatch}
      onOpenStats={() => void navigate(ROUTES.stats)}
    />
  )
}
