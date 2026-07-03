import { SearchIcon, BellIcon } from './Icons'
import './QuizLayout.css'

interface QuizHeaderProps {
  section: string
}

export default function QuizHeader({ section }: QuizHeaderProps) {
  return (
    <header className="quiz-header">
      <img src="/assets/logo.png" alt="Logo" className="quiz-header__logo" />
      <h1 className="quiz-header__section">{section}</h1>

      <div className="quiz-header__search">
        <SearchIcon />
        <span>Search</span>
      </div>

      <button type="button" className="quiz-header__bell" aria-label="Notifications">
        <BellIcon />
      </button>

      <img src="/assets/avatar.png" alt="Profile" className="quiz-header__avatar" />
    </header>
  )
}
