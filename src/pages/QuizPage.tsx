import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom' // 🎯 Ավելացրինք useLocation
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
import PageTransition from '../components/PageTransition'
import './QuizPage.css'

export default function QuizPage() {
  const { shtemId = '3', sectionNum = '2' } = useParams<{ shtemId: string; sectionNum: string }>()
  const navigate = useNavigate()
  const location = useLocation() // 🎯 Կարդում ենք TestsPage-ից եկած state-ը

  const registryKey = `${shtemId}_${sectionNum}`
  
  const [quizData, setQuizData] = useState<any | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([])
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [timePassed, setTimePassed] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 🎯 Պարզում ենք՝ արդյոք սա գեներացված թեստ է
  const isGenerated = location.state && (location.state as any).isGeneratedQuiz

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

  useEffect(() => {
    setCurrentIndex(0)
    setWrongAnswers([])
    setAnsweredQuestions([])
    setTimePassed(0)
    setIsTimerActive(true)

    // 🎯 ԵԹԵ ԳԵՆԵՐԱՑՎԱԾ Է՝ Վերցնում ենք state-ի միջի պատրաստի հարցերը
    if (isGenerated && (location.state as any).quizData) {
      setQuizData((location.state as any).quizData)
    } else {
      // Սովորական ընթացք՝ ըստ URL ID-ների
      const rawData = quizRegistry[registryKey] as any
      if (rawData) {
        let normalized = { ...rawData }

        if (!normalized.questions && normalized.texts && Array.isArray(normalized.texts)) {
          normalized.questions = normalized.texts.map((t: any) => {
            const availableWords = t.words ? `\n\nWords: ${t.words.join(', ')}` : ''
            return {
              id: t.id,
              passage: `${t.passage}${availableWords}`,
              subQuestions: [
                {
                  number: 1,
                  options: { a: "Տեղադրեք բառերը համապատասխանաբար" }
                }
              ],
              options: t.words || [],
              answers: t.answers
            }
          })
        }
        setQuizData(normalized)
      } else {
        setQuizData(null)
      }
    }
  }, [registryKey, isGenerated, location.state])

  useEffect(() => {
    let timer: any
    if (isTimerActive) {
      timer = setInterval(() => {
        setTimePassed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTimerActive])

  const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) return `${seconds} վայրկյան`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins} րոպե ${secs} վայրկյան` : `${mins} րոպե`
  }

  const handleSaveProgress = async () => {
    if (!quizData || !quizData.questions) return
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

      const section_id = isGenerated ? `generated_${Date.now()}` : `section_${shtemId}_${sectionNum}`
      const last_question_number = currentIndex + 1
      const wrong_questions = wrongAnswers

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

      const { error: resultError } = await supabase.from('quiz_results').insert({
        user_id: currentUserId,
        student_email: currentEmail.toLowerCase(),
        section_name: isGenerated ? 'Գեներացված Պատահական Թեստ' : `Շտեմարան ${shtemId} - Բաժին ${sectionNum}`,
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
  
  // 🎯 Եթե գեներացված է, բաժնի համարը դինամիկ վերցնում ենք հենց հարցի օբյեկտից
  const numericSection = isGenerated ? (currentQuestion?.sectionId || 2) : parseInt(sectionNum, 10)

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
  
 // ... (մնացած կոդը նույնն է)

  const renderQuestionTemplate = () => {
    if (!currentQuestion) return <p>Հարցը բեռնված չէ:</p>
    
    const finalAnswersObj = quizData.answers?.[currentIndex] !== undefined 
      ? quizData.answers[currentIndex] 
      : (currentQuestion.answer || currentQuestion.correctAnswer)

    switch (numericSection) {
      case 2:
      case 4:
      case 5: // 🎯 ՈՒՂՂՎԱԾ Է. Section 5-ը տանում ենք MultiBlankView-ով
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
      case 15: {
        // Convert answers to number[] of correct 1-based indices
        // Format A (shtem1): { id, q1: true, q2: false, ... } → [1, 3, ...]
        // Format B (shtem2/3): [true, false, true, ...] → [1, 3, ...]
        let transformAnswers: number[] = []
        if (Array.isArray(finalAnswersObj)) {
          // Format B: boolean array
          transformAnswers = (finalAnswersObj as boolean[])
            .map((val, i) => val === true ? i + 1 : -1)
            .filter(i => i !== -1)
        } else if (finalAnswersObj && typeof finalAnswersObj === 'object') {
          // Format A: { q1: true, q2: false, ... }
          transformAnswers = Object.entries(finalAnswersObj)
            .filter(([key, val]) => /^q\d+$/.test(key) && val === true)
            .map(([key]) => parseInt(key.replace('q', ''), 10))
        }
        
        return (
          <TransformView 
            key={`tf-${currentIndex}`}
            data={currentQuestion} 
            correctAnswers={transformAnswers} 
            onAnswer={handleAnswerSelect}
            onNext={handleNext}
            isLast={isLastQuestion}
          />
        )
      }
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
        return <p>Անհայտ բաժին (Section {numericSection})</p>
    }
  }

  const sectionsList = Array.from({ length: 12 }, (_, i) => String(i + 2))

  return (
    <PageTransition>
    <div className="quiz-page">
      <QuizHeader section={isGenerated ? "Գեներացված Թեստ" : `Section ${sectionNum}`} />

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

      {/* 🎯 Եթե սա լոկալ գեներացված թեստ է, թաքցնում ենք ներքևի Շտեմարանի բաժինների նավիգացիան */}
      {!isGenerated && (
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
      )}
    </div>
    </PageTransition>
  )
}