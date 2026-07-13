import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
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

export default function QuizPage() {
  const { shtemId = '3', sectionNum = '2' } = useParams<{ shtemId: string; sectionNum: string }>()
  const navigate = useNavigate()

  const registryKey = `${shtemId}_${sectionNum}`
  const quizData = quizRegistry[registryKey] as any

  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([])
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [timePassed, setTimePassed] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Օգտատիրոջ տվյալների բեռնում Supabase-ից
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email || null)
      }
    }
    fetchUser()
  }, [])

  // Սեկցիան փոխելիս զրոյացնել ամեն ինչ
  useEffect(() => {
    setCurrentIndex(0)
    setWrongAnswers([])
    setAnsweredQuestions([])
    setTimePassed(0)
    setIsTimerActive(true)
  }, [registryKey])

  // Ժամանակացույց
  useEffect(() => {
    let timer: any
    if (isTimerActive) {
      timer = setInterval(() => {
        setTimePassed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTimerActive])

  // Ժամանակի ֆորմատավորում պահպանելու համար
  const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) return `${seconds} վայրկյան`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins} րոպե ${secs} վայրկյան` : `${mins} րոպե`
  }

  // 💾 SAVE ԿՈՃԱԿԻ ՏՐԱՄԱԲԱՆՈՒԹՅՈՒՆԸ ԲՈԼՈՐ ՍԵԿՑԻԱՆԵՐԻ ՀԱՄԱՐ
  const handleSaveProgress = async () => {
    try {
      let currentUserId = userId
      let currentEmail = userEmail

      if (!currentUserId || !currentEmail) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          alert('Մուտք գործեք՝ առաջադիմությունը պահպանելու համար։')
          return
        }
        currentUserId = user.id
        currentEmail = user.email || ''
        setUserId(user.id)
        setUserEmail(currentEmail)
      }

      const section_id = `section_${shtemId}_${sectionNum}`
      const last_question_number = currentIndex + 1
      const wrong_questions = wrongAnswers

      // 1. Պահպանում ենք ընթացիկ պրոգրեսը
      const { error: progressError } = await supabase.from('user_progress').upsert(
        {
          user_id: currentUserId,
          section_id,
          last_question_number,
          wrong_questions
        },
        { onConflict: 'user_id,section_id' }
      )

      if (progressError) throw progressError

      // 2. Ուղարկում ենք արդյունքները տվյալների բազա
      const { error: resultError } = await supabase.from('quiz_results').insert({
        user_id: currentUserId,
        student_email: currentEmail.toLowerCase(),
        section_name: `Շտեմարան ${shtemId} - Բաժին ${sectionNum}`,
        questions_count: totalQuestions,
        answered_count: answeredQuestions.length,
        time_spent: formatTimeSpent(timePassed),
        wrongs_count: wrongAnswers.length,
        wrong_questions_ids: wrongAnswers
      })

      if (resultError) throw resultError

      alert('Առաջադիմությունը և արդյունքները հաջողությամբ պահպանվեցին։')
    } catch (err: any) {
      console.error('Error saving progress:', err)
      alert('Պահպանման սխալ: ' + err.message)
    }
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="quiz-page" style={{ color: 'red', padding: '20px', fontWeight: 'bold' }}>
        Տվյալները բացակայում են այս բաժնի համար։
      </div>
    )
  }

  const totalQuestions = quizData.questions.length
  const currentQuestion = quizData.questions[currentIndex]
  const numericSection = parseInt(sectionNum, 10)

  const handleAnswerSelect = (isCorrect: boolean) => {
    const questionId = currentQuestion?.id || (currentIndex + 1)
    
    if (!answeredQuestions.includes(questionId)) {
      setAnsweredQuestions((prev) => [...prev, questionId])
    }

    if (!isCorrect && !wrongAnswers.includes(questionId)) {
      setWrongAnswers((prev) => [...prev, questionId].sort((a, b) => a - b))
    }
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSelectWrongQuestion = (qId: any) => {
    const targetIdx = quizData.questions.findIndex((q: any) => q.id === qId)
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx)
    }
  }

  const handleSliderChange = (newIndex: number) => {
    setCurrentIndex(newIndex)
  }

  const isLastQuestion = currentIndex === totalQuestions - 1
  
  const renderQuestionTemplate = () => {
    if (!currentQuestion) return <p>Հարցը բեռնված չէ:</p>
    const finalAnswersObj = quizData.answers?.[currentIndex] || currentQuestion.answer

    switch (numericSection) {
      case 2:
      case 4:
        return (
          <MultiBlankView 
            key={`mb-${currentIndex}`} 
            data={currentQuestion} 
            correctAnswersObj={finalAnswersObj}
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      case 1:
      case 3:
      case 5:
        let correctAnsIndex = 0
        if (typeof finalAnswersObj === 'number') {
          correctAnsIndex = finalAnswersObj
        } else if (typeof finalAnswersObj === 'string') {
          correctAnsIndex = ['a', 'b', 'c', 'd', 'e'].indexOf(finalAnswersObj.toLowerCase())
        }
        return (
          <SingleChoiceView 
            key={`sc-${currentIndex}`}
            data={currentQuestion} 
            correctAnswerIndex={correctAnsIndex === -1 ? 0 : correctAnsIndex} 
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      case 6:
      case 8:
      case 10:
      case 11:
      case 14:
      case 15:
        return (
          <TransformView 
            key={`tf-${currentIndex}`}
            data={currentQuestion} 
            correctAnswers={Array.isArray(finalAnswersObj) ? finalAnswersObj : []} 
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      case 7:
      case 9:
        return (
          <WordBankView 
            key={`wb-${currentIndex}`}
            data={currentQuestion} 
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      case 12:
      case 13:
        return (
          <MatchingView 
            key={`mt-${currentIndex}`}
            data={currentQuestion} 
            correctAnswersObj={finalAnswersObj}
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      default:
        return <p>Անհայտ բաժին</p>
    }
  }
  
  const sectionsList = Array.from({ length: 14 }, (_, i) => String(i + 2))

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
          <QuizProgress 
            current={currentIndex + 1} 
            total={totalQuestions} 
            onSliderChange={handleSliderChange}
          />
          
          <div className="quiz-page__content">
            {renderQuestionTemplate()}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <QuizFooter 
              onNext={handleNext} 
              onBack={handleBack}
              isFirst={currentIndex === 0}
              isLast={isLastQuestion}
            />
            
            {/* 💾 ԿԱՆԱՉ SAVE ԿՈՃԱԿԸ */}
            <button
              onClick={handleSaveProgress}
              style={{
                padding: '10px 24px',
                backgroundColor: '#34a853',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                height: '42px',
                marginTop: '12px'
              }}
            >
              Save
            </button>
          </div>
        </main>
      </div>

      <nav className="quiz-page__nav" aria-label="Sections navigation" style={{
        display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 20px', backgroundColor: '#fff', borderTop: '1px solid #e0dcd3'
      }}>
        {sectionsList.map((sec) => (
          <button
            key={sec}
            onClick={() => navigate(`/quiz/${shtemId}/${sec}`)}
            className={sectionNum === sec ? 'quiz-page__nav-link quiz-page__nav-link--active' : 'quiz-page__nav-link'}
            style={{
              padding: '8px 16px', whiteSpace: 'nowrap', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Section {sec}
          </button>
        ))}
      </nav>
    </div>
  )
}