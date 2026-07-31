import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      padding: '12px 16px',
      border: '1px solid #888',
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      zIndex: 9999,
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
      <div>
        {offlineReady ? (
          <span>Ծրագիրը պատրաստ է օֆլայն աշխատանքի</span>
        ) : (
          <span>Առկա է նոր թարմացում, սեղմեք թարմացնելու համար:</span>
        )}
      </div>
      {needRefresh && (
        <button 
          onClick={() => updateServiceWorker(true)}
          style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
        >
          Թարմացնել
        </button>
      )}
      <button 
        onClick={() => close()}
        style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
      >
        Փակել
      </button>
    </div>
  )
}

export default ReloadPrompt