// Դատարկ fallback տվյալներ, որպեսզի էջերը չկոտրվեն
const emptyFallback = {
  questions: [
    { id: 1, q: "Sample Question (Այս սեկցիայի տվյալները չեն բեռնվել)", opts: ["A", "B", "C", "D"] }
  ],
  answers: []
};

// Ավտոմատ կարդում ենք src/data թղթապանակի բոլոր JS ֆայլերը
const modules = import.meta.glob('./**/*.js', { eager: true }) as Record<string, any>;

const getShtemData = (shtemNum: number, secNum: number) => {
  let filePath = `./shtem${shtemNum}/questions${secNum}.js`;
  
  // 🎯 ԲԱՑԱՌՈՒԹՅՈՒՆ: Section 7 & 9-ի համար կարդում ենք dragdrop_data.js
  if (secNum === 7 || secNum === 9) {
    filePath = `./shtem${shtemNum}/dragdrop_data.js`;
  }

  const moduleData = modules[filePath];
  if (!moduleData) return emptyFallback;

  const exactKey = `SHTEM${shtemNum}_SECTION_${secNum}_DATA`;
  const dragDropKey = `DRAGDROP_SECTION_${secNum}`;
  
  const rawData = moduleData[exactKey] || moduleData[dragDropKey] || moduleData.default;

  if (!rawData) return emptyFallback;

  // 🎯 Section 7 & 9 (Word Bank / Drag and Drop)
  if (rawData.texts && Array.isArray(rawData.texts)) {
    return {
      title: rawData.title || `Section ${secNum}`,
      instruction: rawData.instruction || '',
      questions: rawData.texts,
      answers: rawData.answers || rawData.texts.map((t: any) => t.answers || {})
    };
  }

  // 🎯 Section 12, 13 և մնացած բոլոր սեկցիաները, որոնք ունեն 'questions' զանգված
  if (rawData.questions && Array.isArray(rawData.questions)) {
    return {
      title: rawData.title || `Section ${secNum}`,
      instruction: rawData.instruction || '',
      questions: rawData.questions,
      // Ճիշտ կցում ենք արմատային մակարդակում գտնվող answers զանգվածը
      answers: rawData.answers || rawData.questions.map((q: any) => q.answers || {})
    };
  }

  return emptyFallback;
};

// 🧭 Միասնական քարտեզ բոլոր 3 շտեմարանների 12 սեկցիաների համար
export const quizRegistry: { [key: string]: any } = {
  // Շտեմարան 1
  '1_1': getShtemData(1, 1), '1_2': getShtemData(1, 2), '1_3': getShtemData(1, 3),
  '1_4': getShtemData(1, 4), '1_5': getShtemData(1, 5), '1_6': getShtemData(1, 6),
  '1_7': getShtemData(1, 7), '1_8': getShtemData(1, 8), '1_9': getShtemData(1, 9),
  '1_10': getShtemData(1, 10), '1_11': getShtemData(1, 11), '1_12': getShtemData(1, 12),

  // Շտեմարան 2
  '2_1': getShtemData(2, 1), '2_2': getShtemData(2, 2), '2_3': getShtemData(2, 3),
  '2_4': getShtemData(2, 4), '2_5': getShtemData(2, 5), '2_6': getShtemData(2, 6),
  '2_7': getShtemData(2, 7), '2_8': getShtemData(2, 8), '2_9': getShtemData(2, 9),
  '2_10': getShtemData(2, 10), '2_11': getShtemData(2, 11), '2_12': getShtemData(2, 12),

  // Շտեմարան 3
  '3_1': getShtemData(3, 1), '3_2': getShtemData(3, 2), '3_3': getShtemData(3, 3),
  '3_4': getShtemData(3, 4), '3_5': getShtemData(3, 5), '3_6': getShtemData(3, 6),
  '3_7': getShtemData(3, 7), '3_8': getShtemData(3, 8), '3_9': getShtemData(3, 9),
  '3_10': getShtemData(3, 10), '3_11': getShtemData(3, 11), '3_12': getShtemData(3, 12),'3_13': getShtemData(3, 13),
};