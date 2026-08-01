import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PageTransition from '../components/PageTransition'
import DownloadInstructions from '../components/DownloadInstructions'
import '../components/DownloadInstructions.css'

export default function DownloadPage() {
  return (
    <PageTransition>
      <DashboardLayout active="download">
        <div className="dash-card download-card">
          <div className="dash-card__banner download-banner">
            <h1 className="download-title">Ներբեռնել հավելվածը</h1>
            <p className="download-subtitle">
              Ստացեք eSHTEMARAN-ը ձեր բջջային հեռախոսում՝ ավելի հարմարավետ օգտագործման համար:
            </p>
          </div>

          <DownloadInstructions />
        </div>
      </DashboardLayout>
    </PageTransition>
  )
}

