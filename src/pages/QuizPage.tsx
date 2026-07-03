import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import QuizHeader from '../components/QuizHeader'
import QuizSidebar from '../components/QuizSidebar'
import QuizProgress from '../components/QuizProgress'
import QuizFooter from '../components/QuizFooter'
import MultiBlankView from '../components/questions/MultiBlankView'
import SingleChoiceView from '../components/questions/SingleChoiceView'
import TransformView from '../components/questions/TransformView'
import WordBankView from '../components/questions/WordBankView'
import MatchingView from '../components/questions/MatchingView'
import { quizRegistry } from '../data/quizRegistry'
import './QuizPage.css'

interface SectionState {
  currentIndex: number
  wrongs: number[]
  time: number
}

export default function QuizPage() {
  const { shtemId = '3', sectionNum = '2' } = useParams<{ shtemId: string; sectionNum: string }>()
  const navigate = useNavigate()

  const registryKey = `${shtemId}_${sectionNum}`
  const quizData = quizRegistry[registryKey] as any

  const [quizStates, setQuizStates] = useState<Record<string, SectionState>>({})
  
  const currentQuestionIndex = quizStates[registryKey]?.currentIndex || 0
  const wrongAnswers = quizStates[registryKey]?.wrongs || []
  const timePassed = quizStates[registryKey]?.time || 0

  const [isTimerActive, setIsTimerActive] = useState(false) 

  useEffect(() => {
    let timer: any
    if (isTimerActive) {
      timer = setInterval(() => {
        setQuizStates((prev) => {
          const currentState = prev[registryKey] || { currentIndex: 0, wrongs: [], time: 0 }
          return {
            ...prev,
            [registryKey]: {
              ...currentState,
              time: currentState.time + 1
            }
          }
        })
      }, 1000)
    } else {
      clearInterval(timer)
    }
    return () => clearInterval(timer)
  }, [isTimerActive, registryKey])

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="quiz-page" style={{ color: 'red', padding: '20px', fontWeight: 'bold' }}>
        Տվյալները չեն գտնվել {registryKey} բանալիով:
      </div>
    )
  }

  const totalQuestions = quizData.questions.length
  const currentQuestion = quizData.questions[currentQuestionIndex]

  const handleAnswerSelect = (isCorrect: boolean) => {
    const questionId = currentQuestion?.id || (currentQuestionIndex + 1)
    if (!isCorrect) {
      if (!wrongAnswers.includes(questionId)) {
        const updatedWrongs = [...wrongAnswers, questionId].sort((a, b) => a - b)
        setQuizStates((prev) => ({
          ...prev,
          [registryKey]: {
            ...(prev[registryKey] || { currentIndex: 0, wrongs: [], time: 0 }),
            wrongs: updatedWrongs
          }
        }))
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setQuizStates((prev) => ({
        ...prev,
        [registryKey]: {
          ...(prev[registryKey] || { wrongs: [], time: 0 }),
          currentIndex: currentQuestionIndex + 1
        }
      }))
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setQuizStates((prev) => ({
        ...prev,
        [registryKey]: {
          ...(prev[registryKey] || { wrongs: [], time: 0 }),
          currentIndex: currentQuestionIndex - 1
        }
      }))
    }
  }

  const handleSelectWrongQuestion = (qId: number) => {
    setQuizStates((prev) => ({
      ...prev,
      [registryKey]: {
        ...(prev[registryKey] || { wrongs: [], time: 0 }),
        currentIndex: qId - 1
      }
    }))
  }

  // 🎚️ Այս ֆունկցիան թույլ կտա գծով փոխել հարցի դիրքը
  const handleSliderChange = (newIndex: number) => {
    setQuizStates((prev) => ({
      ...prev,
      [registryKey]: {
        ...(prev[registryKey] || { wrongs: [], time: 0 }),
        currentIndex: newIndex
      }
    }))
  }

  const numericSection = parseInt(sectionNum, 10)
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  
  const renderQuestionTemplate = () => {
    if (!currentQuestion) return <p>Հարցը բեռնված չէ:</p>

    if (numericSection === 2 || numericSection === 4) {
      const currentAnswerObj = quizData.answers ? quizData.answers[currentQuestionIndex] : undefined
      return (
        <MultiBlankView 
          data={currentQuestion} 
          correctAnswersObj={currentAnswerObj}
          onAnswer={handleAnswerSelect as any}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )
    }

    if (numericSection === 3 || numericSection === 5) {
      const correctAnsIndex = quizData.answers && typeof quizData.answers[currentQuestionIndex] === 'number'
        ? quizData.answers[currentQuestionIndex] 
        : 0

      return (
        <SingleChoiceView 
          data={currentQuestion} 
          correctAnswerIndex={correctAnsIndex} 
          onAnswer={handleAnswerSelect as any}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )
    }

    if (numericSection === 6 || numericSection === 8 || numericSection === 10 || numericSection === 11) {
      const currentAnswersArray = quizData.answers ? quizData.answers[currentQuestionIndex] : []
      return (
        <TransformView 
          data={currentQuestion} 
          correctAnswers={currentAnswersArray} 
          onAnswer={handleAnswerSelect as any}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )
    }

    if (numericSection === 7 || numericSection === 9) {
      return (
        <WordBankView 
          data={currentQuestion} 
          onAnswer={handleAnswerSelect as any}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )
    }

    if (numericSection === 12 || numericSection === 13) {
      return (
        <MatchingView 
          data={currentQuestion} 
          onAnswer={handleAnswerSelect as any}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )
    }
    return <p>Ընտրեք համապատասխան սեկցիան:</p>
  }
  
  const sectionsList = Array.from({ length: 12 }, (_, i) => String(i + 2))

  return (
    <div className="quiz-page">
      <QuizHeader section={`Section ${sectionNum}`} />

      <div className="quiz-page__body">
        <QuizSidebar 
          timeLeft={timePassed} 
          isTimerActive={isTimerActive}
          onStartTimer={() => setIsTimerActive(!isTimerActive)} 
          wrongAnswers={wrongAnswers} 
          onSelectQuestion={handleSelectWrongQuestion}
        />

        <main className="quiz-page__main">
          {/* 🎚️ Փոխանցում ենք սլայդերի ֆունկցիան */}
          <QuizProgress 
            current={currentQuestionIndex + 1} 
            total={totalQuestions} 
            onSliderChange={handleSliderChange}
          />
          
          <div className="quiz-page__content">
            {renderQuestionTemplate()}
          </div>
          
          <QuizFooter 
            onNext={handleNext} 
            onBack={handleBack}
            isFirst={currentQuestionIndex === 0}
            isLast={isLastQuestion}
          />
        </main>
      </div>

      <nav className="quiz-page__nav" aria-label="Sections navigation" style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e0dcd3'
      }}>
        {sectionsList.map((sec) => (
          <button
            key={sec}
            onClick={() => {
              setIsTimerActive(false)
              navigate(`/quiz/${shtemId}/${sec}`)
            }}
            className={sectionNum === sec ? 'quiz-page__nav-link quiz-page__nav-link--active' : 'quiz-page__nav-link'}
            style={{
              padding: '8px 16px',
              whiteSpace: 'nowrap',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: sectionNum === sec ? '600' : '400',
              cursor: 'pointer'
            }}
          >
            Section {sec}
          </button>
        ))}
      </nav>
    </div>
  )
}