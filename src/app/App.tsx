import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { DEFAULT_LANG } from '../lib/i18n'
import { About } from '../pages/About/About'
import { Contact } from '../pages/Contact/Contact'
import { Home } from '../pages/Home/Home'
import { PrivacyPolicy } from '../pages/PrivacyPolicy/PrivacyPolicy'
import { Psychotherapy } from '../pages/Psychotherapy/Psychotherapy'
import { LangLayout } from './LangLayout'

const ModelLab = lazy(() =>
  import('../pages/ModelLab/ModelLab').then((module) => ({ default: module.ModelLab })),
)
const UiLab = lazy(() =>
  import('../pages/UiLab/UiLab').then((module) => ({ default: module.UiLab })),
)

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
        {import.meta.env.DEV && (
          <Route
            path="dev/models"
            element={
              <Suspense>
                <ModelLab />
              </Suspense>
            }
          />
        )}
        <Route path=":lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path="psychotherapy" element={<Psychotherapy />} />
          <Route path="about" element={<About />} />
          <Route path="contacts" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          {import.meta.env.DEV && (
            <Route
              path="dev/ui"
              element={
                <Suspense>
                  <UiLab />
                </Suspense>
              }
            />
          )}
        </Route>
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
