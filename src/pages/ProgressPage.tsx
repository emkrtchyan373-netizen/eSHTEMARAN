import DashboardLayout from '../components/DashboardLayout'

export default function ProgressPage() {
  return (
    <DashboardLayout active="progress">
      <div className="dash-card">
        <div className="dash-card__banner" />
        <div className="progress-placeholder" />
      </div>
    </DashboardLayout>
  )
}
