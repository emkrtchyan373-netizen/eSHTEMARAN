import { StrictMode, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import LoadingScreen from './components/LoadingScreen'
import './styles/global.css'
import './components/MobileVersion.css'

/**
 * AppRoot handles the one-time initial loading screen.
 * Once the logo video finishes playing, the loader fades out and
 * the app content becomes fully visible.
 */
function AppRoot() {
  const [loading, setLoading] = useState(true)

  const handleFinished = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <>
      <LoadingScreen isVisible={loading} onFinished={handleFinished} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
