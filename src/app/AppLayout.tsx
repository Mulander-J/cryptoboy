import { Outlet } from 'react-router-dom'
import { HelpController } from '@/features/help/HelpController'
import { AiCreatedBadge } from '@/features/menu/AiCreatedBadge'
import { I18nProvider } from '@/i18n'
import { ColorBlindProvider } from '@/ui/colorBlind/ColorBlindContext'
import { PracticeSessionProvider } from './PracticeSessionContext'
import { useProgress } from './ProgressContext'

/** 全局 Provider + chrome；路由页渲染在 Outlet */
export function AppLayout() {
  const { progress, selectLocale, markTutorialSeen } = useProgress()

  return (
    <I18nProvider locale={progress.settings.locale} onLocaleChange={selectLocale}>
      <ColorBlindProvider enabled={progress.settings.colorBlindPatterns}>
        <PracticeSessionProvider>
          <HelpController
            initiallyOpen={!progress.settings.seenTutorial}
            onSeen={markTutorialSeen}
          >
            <AiCreatedBadge />
            <Outlet />
          </HelpController>
        </PracticeSessionProvider>
      </ColorBlindProvider>
    </I18nProvider>
  )
}
