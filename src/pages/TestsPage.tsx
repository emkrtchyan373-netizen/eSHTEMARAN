import DashboardLayout from '../components/DashboardLayout'
import { PlusIcon } from '../components/Icons'

export default function TestsPage() {
  return (
    <DashboardLayout active="tests">
      <div className="dash-card">
        <div className="dash-card__banner" />
        <div className="dash-card__body--gray">
          <div className="create-test">
            <div className="create-test__circle">
              <PlusIcon />
            </div>
            <p className="create-test__label armenian">Ստեղծել Նոր Թեստ</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
