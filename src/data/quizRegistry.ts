// Դատարկ fallback տվյալներ, որպեսզի էջերը չկոտրվեն
const emptyFallback = {
  questions: [
    { id: 1, q: "Sample Question (Այս սեկցիայի տվյալները չեն բեռնվել)", opts: ["A", "B", "C", "D"] }
  ],
  answers: []
};

// 🎯 ՃՇԳՐՏՎԱԾ ՀԱՍՑԵ: Քանի որ quizRegistry-ն հենց data-ի մեջ է, կարդում ենք ուղիղ իր կողքի թղթապանակները
const modules = import.meta.glob('./shtem*/*.{js,ts}', { eager: true }) as Record<string, any>;

const getShtemData = (shtemNum: number, secNum: number) => {
  // Ստեղծում ենք հարաբերական հասցեները ճիշտ այնպես, ինչպես Vite-ն է տեսնում իր կողքին
  const filePathJs = `./shtem${shtemNum}/questions${secNum}.js`;
  const filePathTs = `./shtem${shtemNum}/questions${secNum}.ts`;
  const dragDropJs = `./shtem${shtemNum}/dragdrop_data.js`;
  const dragDropTs = `./shtem${shtemNum}/dragdrop_data.ts`;
  
  let filePath = (secNum === 7 || secNum === 9) ? dragDropJs : filePathJs;
  let backupPath = (secNum === 7 || secNum === 9) ? dragDropTs : filePathTs;

  // Փորձում ենք վերցնել մոդուլը
  const moduleData = modules[filePath] || modules[backupPath];

  if (!moduleData) {
    console.warn(`⚠️ Ֆայլը բացակայում է: Shtem ${shtemNum}, Section ${secNum}. Օգտագործվում է դատարկ fallback:`);
    return emptyFallback;
  }

  // Փնտրվող բանալիները (Keys)
  const exactKey = `SHTEM${shtemNum}_SECTION_${secNum}_DATA`;
  const dragDropKey = `DRAGDROP_SECTION_${secNum}`;
  const shtem3Key = `SHTEM3_SECTION_${secNum}_DATA`;
  const shtem2Key = `SHTEM2_SECTION_${secNum}_DATA`;
  const shtem1Key = `SHTEM1_SECTION_${secNum}_DATA`;
  
  // Վերցնում ենք տվյալները մոդուլից
  const rawData = 
    moduleData[exactKey] || 
    moduleData[dragDropKey] || 
    moduleData[shtem3Key] || 
    moduleData[shtem2Key] || 
    moduleData[shtem1Key] || 
    moduleData.default || 
    moduleData;

  if (!rawData) {
    console.error(`❌ ՏՎՅԱԼՆԵՐԸ ԴԱՏԱՐԿ ԵՆ: Ֆայլը կա, բայց ${exactKey} չի գտնվել:`, moduleData);
    return emptyFallback;
  }

  // 🎯 ԲԱՑԱՌՈՒԹՅՈՒՆ: Եթե Section 9 է և ունի սխալ կառուցվածք, ձևափոխում ենք WordBankView-ի համար
  if (secNum === 9 && rawData.questions && !rawData.texts) {
    const transformedTexts = rawData.questions.map((q: any, index: number) => {
      const ansObj = rawData.answers ? (rawData.answers.find((a: any) => a.id === q.id) || rawData.answers[index]) : {};
      
      const words = q.subQuestions && q.subQuestions[0]?.options 
        ? Object.values(q.subQuestions[0].options) 
        : [];
      
      const answers: Record<string, string> = {};
      if (q.subQuestions) {
        q.subQuestions.forEach((subQ: any, subIndex: number) => {
          const slotNum = subIndex + 1;
          const ansKey = `q${slotNum}`;
          const choiceLetter = ansObj[ansKey];
          if (choiceLetter && subQ.options && subQ.options[choiceLetter]) {
            answers[slotNum.toString()] = subQ.options[choiceLetter];
          }
        });
      }
      
      // Մաքրում ենք (1)______ տիպի նշումները տեքստից, որպեսզի կրկնակի չերևան
      const cleanPassage = q.passage 
        ? q.passage.replace(/\(\d+\)_+/g, '______') 
        : '';
      
      return {
        id: q.id,
        title: q.title || `Text ${q.id}`,
        passage: cleanPassage,
        words: words,
        answers: answers
      };
    });

    rawData.texts = transformedTexts;
    rawData.answers = transformedTexts.map((t: any) => t.answers);
  }

  // 🎯 Section 7 & 9 (Word Bank / Drag and Drop)
  if (rawData.texts && Array.isArray(rawData.texts)) {
    return {
      title: rawData.title || `Section ${secNum}`,
      instruction: rawData.instruction || '',
      questions: rawData.texts,
      answers: rawData.answers || rawData.texts.map((t: any) => t.answers || {})
    };
  }

  // 🎯 Սովորական սեկցիաներ (questions զանգվածով)
  if (rawData.questions && Array.isArray(rawData.questions)) {
    return {
      title: rawData.title || `Section ${secNum}`,
      instruction: rawData.instruction || '',
      questions: rawData.questions,
      answers: rawData.answers || rawData.questions.map((q: any) => q.answers || {})
    };
  }

  // 🎯 Եթե տվյալները հենց իրենք զանգված են
  if (Array.isArray(rawData)) {
    return {
      title: `Section ${secNum}`,
      instruction: '',
      questions: rawData,
      answers: rawData.map((q: any) => q.answers || {})
    };
  }

  return emptyFallback;
};

// 🧭 Միասնական քարտեզ (Հեռացվել են '1_1', '2_1', '3_1' հարցումները, որոնք չկան քո ֆայլերում)
export const quizRegistry: { [key: string]: any } = {
  // Շտեմարան 1
  '1_2': getShtemData(1, 2), '1_3': getShtemData(1, 3),
  '1_4': getShtemData(1, 4), '1_5': getShtemData(1, 5), '1_6': getShtemData(1, 6),
  '1_7': getShtemData(1, 7), '1_8': getShtemData(1, 8), '1_9': getShtemData(1, 9),
  '1_10': getShtemData(1, 10), '1_11': getShtemData(1, 11), '1_12': getShtemData(1, 12), '1_13': getShtemData(1, 13),

  // Շտեմարան 2
  '2_2': getShtemData(2, 2), '2_3': getShtemData(2, 3),
  '2_4': getShtemData(2, 4), '2_5': getShtemData(2, 5), '2_6': getShtemData(2, 6),
  '2_7': getShtemData(2, 7), '2_8': getShtemData(2, 8), '2_9': getShtemData(2, 9),
  '2_10': getShtemData(2, 10), '2_11': getShtemData(2, 11), '2_12': getShtemData(2, 12), '2_13': getShtemData(2, 13),

  // Շտեմարան 3
  '3_2': getShtemData(3, 2), '3_3': getShtemData(3, 3),
  '3_4': getShtemData(3, 4), '3_5': getShtemData(3, 5), '3_6': getShtemData(3, 6),
  '3_7': getShtemData(3, 7), '3_8': getShtemData(3, 8), '3_9': getShtemData(3, 9),
  '3_10': getShtemData(3, 10), '3_11': getShtemData(3, 11), '3_12': getShtemData(3, 12), '3_13': getShtemData(3, 13),
};