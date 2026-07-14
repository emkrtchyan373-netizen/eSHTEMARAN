import { useParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import PageTransition from '../components/PageTransition'

const sections = Array.from({ length: 12 }, (_, i) => `Section ${i + 2}`)

export default function ShtemaranPage() {
  const { id } = useParams<{ id: string }>()
  const active = `shtemaran-${id}` as 'shtemaran-1' | 'shtemaran-2' | 'shtemaran-3'

  return (
    <PageTransition>
    <DashboardLayout active={active}>
      <div className="dash-card">
        <div className="dash-card__banner" />
        
        <div className="section-grid">
          {sections.map((section) => {
            const sectionNumber = section.replace('Section ', '')
            
            return (
              <a 
                key={section} 
                href={`/quiz-run/${id}/${sectionNumber}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="section-grid__btn"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  textDecoration: 'none' 
                }}
              >
                {section}
              </a>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
    </PageTransition>
  )
}