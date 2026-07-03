import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import QuizView from '../components/QuizView'
import { quizRegistry } from '../data/quizRegistry'

export default function QuizViewPage() {
  const { shtemId, sectionNum } = useParams<{ shtemId: string; sectionNum: string }>()
  const [quizData, setQuizData] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!shtemId || !sectionNum) return

    // Կառուցում ենք բանալին (օրինակ՝ '3_2' կամ '3_3')
    const registryKey = `${shtemId}_${sectionNum}`
    const data = quizRegistry[registryKey]

    if (data) {
      setQuizData(data)
      setErrorMsg(null)
    } else {
      setErrorMsg(
        `Տվյալները չեն գտնվել quizRegistry-ում: Ստուգիր՝ արդյոք ավելացրե՞լ ես 'src/data/quizRegistry.ts' ֆայլի մեջ '${registryKey}' բանալին:`
      )
    }
  }, [shtemId, sectionNum])

  if (errorMsg) {
    return (
      <div style={{ color: '#ff4a4a', padding: '25px', fontFamily: 'sans-serif', fontWeight: 'bold', background: '#14171f', margin: '20px', borderRadius: '12px', border: '1px solid #ff4a4a33' }}>
        {errorMsg}
      </div>
    )
  }

  if (!quizData) {
    return <div style={{ color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>Բեռնվում է...</div>
  }

  return (
    <QuizView 
      data={quizData} 
      shtemId={shtemId || '3'} 
      sectionNum={sectionNum || '2'} 
      onQuit={() => window.close()} 
    />
  )
}