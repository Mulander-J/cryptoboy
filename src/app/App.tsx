import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MenuPage } from '@/features/menu/pages/MenuPage'
import { PracticeSetSecretPage } from '@/features/menu/pages/PracticeSetSecretPage'
import { PracticeSetupPage } from '@/features/menu/pages/PracticeSetupPage'
import { PracticePlayPage } from '@/features/solo/pages/PracticePlayPage'
import { SoloPage } from '@/features/solo/pages/SoloPage'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { appBasename, ROUTES } from './paths'
import { ProgressProvider } from './ProgressContext'

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter basename={appBasename()}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<MenuPage />} />
            <Route path={ROUTES.practiceSetup} element={<PracticeSetupPage />} />
            <Route
              path={ROUTES.practiceSetSecret}
              element={<PracticeSetSecretPage />}
            />
            <Route path={ROUTES.practicePlay} element={<PracticePlayPage />} />
            <Route path={ROUTES.solo} element={<SoloPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
