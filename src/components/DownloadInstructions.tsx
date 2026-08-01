import React from 'react'
import { AndroidIcon, AppleIcon, DownloadIcon } from './Icons'
import './DownloadInstructions.css'

export default function DownloadInstructions() {
  return (
    <div className="download-content">
      {/* Android Section */}
      <div className="download-section android-section">
        <div className="download-section__header">
          <AndroidIcon />
          <h2>Android</h2>
        </div>
        <p className="download-section__desc">
          Ներբեռնեք և տեղադրեք մեր պաշտոնական Android հավելվածը (APK)՝ անմիջապես ձեր հեռախոսում օգտագործելու համար:
        </p>
        <div className="download-steps">
          <div className="step-item">
            <span className="step-number">1</span>
            <p>Սեղմեք ստորև գտնվող «Ներբեռնել APK» կոճակը:</p>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <p>Թույլատրեք բրաուզերին ներբեռնել ֆայլը:</p>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <p>Բացեք ֆայլը և ընտրեք «Տեղադրել» (Install): Հնարավոր է պահանջվի թույլատրել տեղադրում անհայտ աղբյուրներից:</p>
          </div>
        </div>
        <a href="/download/eSHTEMARAN.apk" download className="download-btn android-btn">
          <DownloadIcon />
          <span>Ներբեռնել APK</span>
        </a>
      </div>

      {/* iOS Section */}
      <div className="download-section ios-section">
        <div className="download-section__header">
          <AppleIcon />
          <h2>iPhone (iOS)</h2>
        </div>
        <p className="download-section__desc">
          iPhone-ի օգտատերերի համար հավելվածը հասանելի է որպես վեբ-հավելված: Ավելացրեք այն ձեր գլխավոր էկրանին (Home Screen):
        </p>
        <div className="download-steps">
          <div className="step-item">
            <span className="step-number">1</span>
            <p>Բացեք այս էջը <strong>Safari</strong> բրաուզերով ձեր iPhone-ում:</p>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <p>Սեղմեք ներքևում գտնվող <strong>Share</strong> (Կիսվել) կոճակը (քառակուսի՝ դեպի վեր սլաքով):</p>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <p>Ոլորեք ներքև և ընտրեք <strong>"Add to Home Screen"</strong> (Ավելացնել գլխավոր էկրանին):</p>
          </div>
          <div className="step-item">
            <span className="step-number">4</span>
            <p>Վերևի աջ անկյունում սեղմեք <strong>"Add"</strong>: Հավելվածն այժմ ձեր էկրանին է:</p>
          </div>
        </div>
        <div className="ios-mockup">
          <div className="ios-mockup__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <line x1="12" y1="16" x2="12" y2="8" />
              <line x1="8" y1="12" x2="12" y2="8" />
              <line x1="16" y1="12" x2="12" y2="8" />
            </svg>
          </div>
          <span>Share &rarr; Add to Home Screen</span>
        </div>
      </div>
    </div>
  )
}
