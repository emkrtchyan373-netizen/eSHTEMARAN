import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MobileLayoutProvider from './components/MobileLayoutProvider'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProgressPage from './pages/ProgressPage'
import ShtemaranPage from './pages/ShtemaranPage'
import TestsPage from './pages/TestsPage'
import ProtectedRoute from './components/ProtectedRoute'
import RequireClassAccess from './components/RequireClassAccess'
import ClassroomsPage from './pages/ClassroomsPage'
import ClassroomDetailPage from './pages/ClassroomDetailPage'

// Նոր դիզայնով QuizPage էջը
import QuizPage from './pages/QuizPage'

// 🎯 Ներմուծում ենք գեներացված պատահական հարցերով նոր էջը
import GeneratedQuizRun from './pages/GeneratedQuizRun'

export default function App() {
  // useLocation must be called inside BrowserRouter (in main.tsx) — App is already a child
  const location = useLocation()

  return (
    <MobileLayoutProvider>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* 🏁 Հանրային էջեր */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
             
          {/* 🧭 Սա կբռնի թե՛ /quiz/3/2, թե՛ /quiz-run/3/2 ուղիները */}
          <Route path="/quiz/:shtemId/:sectionNum" element={<RequireClassAccess><QuizPage /></RequireClassAccess>} />
          <Route path="/quiz-run/:shtemId/:sectionNum" element={<RequireClassAccess><QuizPage /></RequireClassAccess>} />

          {/* 🛠️ Եթե օգտատերը մտնի /dashboard, նրան ավտոմատ կտանի /dashboard/tests */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/tests" replace />
              </ProtectedRoute>
            } 
          />

          {/* 🔒 Պաշտպանված էջեր */}
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/progress" 
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/shtemaran/:id"
            element={
              <ProtectedRoute>
                <RequireClassAccess>
                  <ShtemaranPage />
                </RequireClassAccess>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tests"
            element={
              <ProtectedRoute>
                <RequireClassAccess>
                  <TestsPage />
                </RequireClassAccess>
              </ProtectedRoute>
            }
          />

          {/* 🏫 Դասարաններ */}
          <Route
            path="/dashboard/classrooms"
            element={
              <ProtectedRoute>
                <ClassroomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/classrooms/:id"
            element={
              <ProtectedRoute>
                <ClassroomDetailPage />
              </ProtectedRoute>
            }
          />

          {/* 🎯 ՃՇԳՐՏՎԱԾ ԵՐԹՈՒՂԻՆԵՐ ԳԵՆԵՐԱՑՎԱԾ ԹԵՍՏԵՐԻ ՀԱՄԱՐ */}
          {/* Սա աշխատում է, երբ բացվում է ID-ով (օրինակ՝ /dashboard/tests/run/123) */}
          <Route
            path="/dashboard/tests/run/:id"
            element={
              <ProtectedRoute>
                <RequireClassAccess>
                  <GeneratedQuizRun />
                </RequireClassAccess>
              </ProtectedRoute>
            }
          />

          {/* Սա աշխատում է որպես fallback, կամ եթե առանց ID-ի է փոխանցվում */}
          <Route
            path="/dashboard/tests/run"
            element={
              <ProtectedRoute>
                <RequireClassAccess>
                  <GeneratedQuizRun />
                </RequireClassAccess>
              </ProtectedRoute>
            }
          />

          {/* Պահպանված է նաև քո հին երթուղին՝ ամեն դեպքում */}
          <Route
            path="/dashboard/tests/run-generated"
            element={
              <ProtectedRoute>
                <RequireClassAccess>
                  <GeneratedQuizRun />
                </RequireClassAccess>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </MobileLayoutProvider>
  )
}