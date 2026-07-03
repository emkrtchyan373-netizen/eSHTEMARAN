import { useState, useEffect } from 'react'

interface QuizViewProps {
  data: any
  shtemId: string
  sectionNum: string
  onQuit: () => void
}

export default function QuizView({ data, shtemId, sectionNum, onQuit }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [checkedQuestions, setCheckedQuestions] = useState<{ [key: number]: boolean }>({})

  // 1. Ապահով կերպով ստանում ենք հարցերի հիմնական զանգվածը
  const questionsList = Array.isArray(data) 
    ? data 
    : (data?.questions || data?.data || [])

  const answersList = Array.isArray(data?.answers) ? data.answers : []
  const totalQuestions = questionsList.length
  const currentItem = questionsList[currentIdx]

  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setSelectedOption(null)
  }, [currentIdx])

  if (totalQuestions === 0 || !currentItem) {
    return (
      <div style={{ background: '#0a0c10', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>Շտեմարան {shtemId} • Բաժին {sectionNum}</h2>
        <p style={{ color: '#aaa' }}>Հարցերը բեռնվում են կամ ֆայլի կառուցվածքը դատարկ է։</p>
        <button onClick={onQuit} style={{ background: '#ff4a4a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>
          Հետ գնալ
        </button>
      </div>
    )
  }

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // 2. ՈՐՈՇՈՒՄ ԵՆՔ ՀԱՐՑԻ ՏԵՔՍՏԸ (Մաքսիմալ ճկուն)
  const questionText = currentItem.q || currentItem.question || currentItem.text || currentItem.passage || `Հարց ${currentIdx + 1}`

  // 3. ՏԱՐԲԵՐԱԿՆԵՐԻ (OPTIONS) ԲԱՑԱՐՁԱԿ ԱՊԱՀՈՎ ՄՇԱԿՈՒՄ
  let displayOptions: { key: string; value: string }[] = []

  // Ստուգում ենք՝ արդյոք կան ենթահարցեր (subQuestions)
  const subQuestions = currentItem.subQuestions || currentItem.questions
  const hasSubQuestions = Array.isArray(subQuestions) && subQuestions.length > 0

  // Ֆունկցիա՝ օբյեկտից կամ զանգվածից տարբերակներ քաղելու համար
  const parseOptions = (target: any) => {
    if (!target) return []
    
    // Տարբերակ 1. Եթե ունի 'options' կամ 'opts' դաշտ
    const rawOpts = target.options || target.opts
    if (rawOpts) {
      if (Array.isArray(rawOpts)) {
        return rawOpts.map((v, i) => ({ key: ['a', 'b', 'c', 'd', 'e'][i], value: String(v) }))
      }
      return Object.entries(rawOpts).map(([k, v]) => ({ key: k, value: String(v) }))
    }

    // Տարբերակ 2. Եթե տարբերակները ուղղակի գրված են որպես { a: "...", b: "..." } հենց օբյեկտի մեջ
    if (target.a || target.b || target.c || target.d) {
      const result = []
      if (target.a) result.push({ key: 'a', value: String(target.a) })
      if (target.b) result.push({ key: 'b', value: String(target.b) })
      if (target.c) result.push({ key: 'c', value: String(target.c) })
      if (target.d) result.push({ key: 'd', value: String(target.d) })
      if (target.e) result.push({ key: 'e', value: String(target.e) })
      return result
    }
    
    return []
  }

  // Կիրառում ենք ստուգումը
  if (hasSubQuestions && subQuestions[0]) {
    displayOptions = parseOptions(subQuestions[0])
    // Եթե ենթահարցն ունի իր սեփական տեքստը, ավելացնում ենք հիմնական տեքստին
    const subText = subQuestions[0].q || subQuestions[0].question || subQuestions[0].text
    if (subText) {
      displayOptions = parseOptions(subQuestions[0])
    }
  } else {
    displayOptions = parseOptions(currentItem)
  }

  // 4. ՃԻՇՏ ՊԱՏԱՍԽԱՆԻ ՍՏՈՒԳՈՒՄ
  const handleSaveAnswer = () => {
    if (!selectedOption) {
      alert('Խնդրում ենք ընտրել տարբերակներից մեկը։')
      return
    }

    const questionId = currentItem.id || (currentIdx + 1)
    
    if (!checkedQuestions[questionId]) {
      // Փնտրում ենք answersList-ում
      const correctObj = answersList.find((ans: any) => ans.id === questionId)
      
      // Փորձում ենք գտնել տարբեր աղբյուրներից (q1, answer, correctAnswer կամ subQuestion-ի միջից)
      let correctAnswer = correctObj?.q1 || correctObj?.answer || currentItem.correctAnswer || currentItem.answer
      
      if (!correctAnswer && hasSubQuestions && subQuestions[0]) {
        correctAnswer = subQuestions[0].correctAnswer || subQuestions[0].answer || subQuestions[0].q1
      }

      if (correctAnswer && String(correctAnswer).toLowerCase() !== selectedOption.toLowerCase()) {
        setWrongCount(prev => prev + 1)
      }
      setCheckedQuestions({ ...checkedQuestions, [questionId]: true })
    }

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      alert('Դուք ավարտեցիք այս բաժինը։ 🎉')
    }
  }

  return (
    <div style={{ background: '#0a0c10', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#4a90e2' }}>@shtemaran</h2>
          <span style={{ color: '#888' }}>Շտեմարան {shtemId} • Բաժին {sectionNum}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ffcc' }}>{formatTime(seconds)}</div>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4a4a' }}>{wrongCount}</div>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Wrong</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', background: '#222', height: '6px', borderRadius: '3px', marginBottom: '25px', overflow: 'hidden' }}>
        <div style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%`, background: '#4a90e2', height: '100%', transition: 'width 0.3s' }} />
      </div>

      <div style={{ marginBottom: '15px', color: '#aaa', fontWeight: 'bold' }}>
        QUESTION {currentIdx + 1} OF {totalQuestions}
      </div>

      {/* Question Text */}
      <div style={{ background: '#14171f', padding: '25px', borderRadius: '12px', border: '1px solid #222', marginBottom: '25px', fontSize: '18px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
        {questionText}
        {/* Եթե կա ընդհանուր տեքստ և առանձին ենթահարց */}
        {hasSubQuestions && subQuestions[0] && (subQuestions[0].q || subQuestions[0].question) && (
          <div style={{ marginTop: '15px', color: '#00d2ff', borderTop: '1px solid #232836', paddingTop: '15px' }}>
            {subQuestions[0].q || subQuestions[0].question}
          </div>
        )}
      </div>

      {/* Options Rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {displayOptions.length > 0 ? (
          displayOptions.map((opt) => {
            const isSelected = selectedOption === opt.key
            return (
              <div
                key={opt.key}
                onClick={() => setSelectedOption(opt.key)}
                style={{
                  background: isSelected ? '#1c2333' : '#14171f',
                  border: isSelected ? '2px solid #4a90e2' : '1px solid #222',
                  padding: '16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isSelected ? '#4a90e2' : '#222',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {opt.key.toUpperCase()}
                </div>
                <div style={{ fontSize: '16px' }}>{opt.value}</div>
              </div>
            )
          })
        ) : (
          <div style={{ color: '#ff4a4a', fontSize: '14px', background: '#ff4a4a11', padding: '15px', borderRadius: '8px', border: '1px solid #ff4a4a33' }}>
            Տարբերակները չեն գտնվել։ Համոզվեք, որ JS ֆայլի օբյեկտներն ունեն options, opts կամ ուղղակի a, b, c, d դաշտերը։
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onQuit}
          style={{ background: 'transparent', color: '#ff4a4a', border: '1px solid #ff4a4a', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✕ QUIT
        </button>

        <button
          onClick={handleSaveAnswer}
          style={{ background: '#4a90e2', color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          SAVE
        </button>
      </div>
    </div>
  )
}