import { useNavigate } from 'react-router-dom'
import { ROUTES, soloPath } from '@/app/paths'
import { usePracticeSession } from '@/app/PracticeSessionContext'
import { useProgress } from '@/app/ProgressContext'
import { MAX_LEVELS } from '@/data/levels'
import { getUnlockedLevel } from '@/data/progress'
import type { Difficulty } from '@/domain/types'
import { Menu } from '../Menu'

export function MenuPage() {
  const navigate = useNavigate()
  const { progress, updateSettingsPatch, startCycle } = useProgress()
  const { hydrateDraftFromProgress, clearSecret } = usePracticeSession()

  function startSolo(difficulty: Difficulty) {
    const level = getUnlockedLevel(progress.solo[difficulty], MAX_LEVELS[difficulty])
    void navigate(soloPath(difficulty, level))
  }

  function nextCycle(difficulty: Difficulty) {
    startCycle(difficulty)
    void navigate(soloPath(difficulty, 1))
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
      onNextCycle={nextCycle}
      onOpenCustom={openCustom}
      onUpdateSettings={updateSettingsPatch}
      onOpenStats={() => void navigate(ROUTES.stats)}
    />
  )
}
