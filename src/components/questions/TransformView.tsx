import React, { useState, useEffect } from 'react';

interface SubQuestion {
  number?: number;
  options?: {
    a?: string;
    [key: string]: any;
  };
  q?: string;
  text?: string;
}

interface TransformViewProps {
  data: {
    id?: any;
    q?: string;
    passage?: string;
    subQuestions?: SubQuestion[];
    options?: any[];
    opts?: any[];
  };
  correctAnswers?: boolean[];
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

export default function TransformView({
  data,
  correctAnswers = [],
  onAnswer,
  onNext,
  isLast,
}: TransformViewProps) {
  // 🛠️ Անվտանգ կերպով հավաքում ենք ենթահարցերը (նախադասությունները)
  const rawItems = data?.subQuestions || data?.options || data?.opts || [];
  const itemsArray = Array.isArray(rawItems) ? rawItems : Object.values(rawItems);

  // Ստեղծում ենք ընտրված տարբերակների սթեյթ (True / False / null)
  const [selections, setSelections] = useState<Record<number, boolean>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState<boolean | null>(null);

  // Երբ հարցը փոխվում է, մաքրում ենք նախորդ ընտրությունները
  useEffect(() => {
    setSelections({});
    setIsChecked(false);
    setIsCorrectResult(null);
  }, [data?.id]);

  const handleSelect = (index: number, value: boolean) => {
    if (isChecked) return; // Ստուգելուց հետո թույլ չտալ փոխել
    setSelections((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleCheck = () => {
    if (itemsArray.length === 0) return;

    let allMatch = true;
    
    // Ստուգում ենք յուրաքանչյուր նախադասության պատասխանը
    itemsArray.forEach((_, index) => {
      const userChoice = selections[index] ?? false; // Եթե չի ընտրվել, համարում ենք false
      const targetAnswers = Array.isArray(correctAnswers) ? correctAnswers : [];
      const expectedChoice = targetAnswers[index] ?? false;

      if (userChoice !== expectedChoice) {
        allMatch = false;
      }
    });

    setIsCorrectResult(allMatch);
    setIsChecked(true);
    onAnswer(allMatch);
  };

  if (!data || itemsArray.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#c0392b', fontWeight: 'bold' }}>
        ⚠️ Տվյալների բեռնման սխալ. Այս հարցի նախադասությունները հասանելի չեն:
      </div>
    );
  }

  return (
    <div className="transform-view" style={{ padding: '10px 0' }}>
      {/* Գլխավոր հրահանգը */}
      <h3 className="question-title" style={{ marginBottom: '20px', fontSize: '18px', color: '#2c3e50' }}>
        {data.passage || data.q || "Choose the correctly transformed sentences."}
      </h3>

      {/* Նախադասությունների ցուցակը */}
      <div className="transform-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {itemsArray.map((item: any, index: number) => {
          
          // 🎯 ՈՒՂՂՈՒՄ՝ Կարդում ենք տեքստը ձեր նշած տվյալների կառուցվածքից (options.a)
          const sentenceText = typeof item === 'string' 
            ? item 
            : (item?.options?.a || item?.opts?.a || item?.q || item?.text || `Sentence ${index + 1}`);

          const targetAnswers = Array.isArray(correctAnswers) ? correctAnswers : [];
          const isExpectedTrue = targetAnswers[index] ?? false;
          const userSelection = selections[index];

          // Գույների որոշում ստուգումից հետո
          let rowBg = '#f8f9fa';
          if (isChecked) {
            if (isExpectedTrue) {
              rowBg = '#d4edda'; // Ճիշտ նախադասությունները կանաչում են
            } else if (userSelection === true && !isExpectedTrue) {
              rowBg = '#f8d7da'; // Սխալ ընտրվածները կարմրում են
            }
          }

          return (
            <div 
              key={index} 
              className="transform-item" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: rowBg,
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                transition: 'background-color 0.2s'
              }}
            >
              <span className="transform-text" style={{ fontSize: '15px', color: '#2d3748', flex: 1, marginRight: '15px' }}>
                <strong>{index + 1}.</strong> {sentenceText}
              </span>

              {/* Կոճակներ՝ True / False */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSelect(index, true)}
                  disabled={isChecked}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    cursor: isChecked ? 'not-allowed' : 'pointer',
                    backgroundColor: userSelection === true ? '#4c6ef5' : '#ffffff',
                    color: userSelection === true ? '#ffffff' : '#334155',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  True
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(index, false)}
                  disabled={isChecked}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    cursor: isChecked ? 'not-allowed' : 'pointer',
                    backgroundColor: userSelection === false ? '#fa5252' : '#ffffff',
                    color: userSelection === false ? '#ffffff' : '#334155',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  False
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Գործողությունների կոճակներ */}
      <div style={{ marginTop: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        {!isChecked ? (
          <button
            onClick={handleCheck}
            className="check-btn"
            style={{
              padding: '10px 20px',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Check Answers
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{
              fontWeight: 'bold',
              color: isCorrectResult ? '#27ae60' : '#c0392b',
              fontSize: '15px'
            }}>
              {isCorrectResult ? '✓ Բոլորը Ճիշտ են!' : '❌ Կան սխալներ'}
            </span>
            {!isLast && (
              <button
                onClick={onNext}
                className="next-btn"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Next Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}