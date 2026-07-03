

interface QuizFooterProps {
  onNext: () => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export default function QuizFooter({ onNext, onBack, isFirst, isLast }: QuizFooterProps) {
  return (
    <footer className="quiz-footer">
      {/* Back կոճակ՝ նախորդ հարցին գնալու համար */}
      <button 
        type="button" 
        className="quiz-footer__btn" 
        onClick={onBack}
        disabled={isFirst}
        style={{ opacity: isFirst ? 0.5 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
      >
        back
      </button>

      {/* Next կոճակ՝ հաջորդ հարցին գնալու համար */}
      <button 
        type="button" 
        className="quiz-footer__btn" 
        onClick={onNext}
        disabled={isLast}
        style={{ opacity: isLast ? 0.5 : 1, cursor: isLast ? 'not-allowed' : 'pointer' }}
      >
        next
      </button>

      {/* Save կոճակ, որը ոչինչ չի անում՝ ըստ քո պլանի */}
      <button 
        type="button" 
        className="quiz-footer__btn"
        style={{ opacity: 0.6, cursor: 'default' }}
      >
        save
      </button>
    </footer>
  )
}