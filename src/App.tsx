import { Routes, Route, Navigate } from 'react-router-dom'
import MobileLayoutProvider from './components/MobileLayoutProvider'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProgressPage from './pages/ProgressPage'
import ShtemaranPage from './pages/ShtemaranPage'
import TestsPage from './pages/TestsPage'
import ProtectedRoute from './components/ProtectedRoute' 

// Նոր դիզայնով QuizPage էջը
import QuizPage from './pages/QuizPage'

export default function App() {
  return (
    <MobileLayoutProvider>
    <Routes>
      {/* 🏁 Հանրային էջեր */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
       
      {/* 🧭 Սա կբռնի թե՛ /quiz/3/2, թե՛ /quiz-run/3/2 ուղիները */}
      <Route path="/quiz/:shtemId/:sectionNum" element={<QuizPage />} />
      <Route path="/quiz-run/:shtemId/:sectionNum" element={<QuizPage />} />

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
            <ShtemaranPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/tests" 
        element={
          <ProtectedRoute>
            <TestsPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
    </MobileLayoutProvider>
  )
}