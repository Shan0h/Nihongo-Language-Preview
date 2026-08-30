export interface SRSData {
  correctCount: number;
  incorrectCount: number;
  lastSeen: number; // timestamp
}

export interface SRSStorage {
  [questionId: string]: SRSData;
}

const SRS_KEY = 'nihongo_srs_data';

export const getSRSData = (): SRSStorage => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(SRS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse SRS data', e);
    return {};
  }
};

export const updateSRSData = (questionId: string, isCorrect: boolean) => {
  if (typeof window === 'undefined') return;
  const data = getSRSData();
  const current = data[questionId] || { correctCount: 0, incorrectCount: 0, lastSeen: 0 };
  
  data[questionId] = {
    correctCount: current.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: current.incorrectCount + (isCorrect ? 0 : 1),
    lastSeen: Date.now(),
  };

  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save SRS data', e);
  }
};

export const calculateWeight = (srs?: SRSData) => {
  if (!srs) return 100; // High weight if never seen
  
  // Base weight formula: (incorrect + 1) / (correct + 1)
  let weight = (srs.incorrectCount + 1) / (srs.correctCount + 1);
  
  // Add time factor: if it was seen a long time ago, increase weight slightly
  const daysSinceSeen = (Date.now() - srs.lastSeen) / (1000 * 60 * 60 * 24);
  weight += (daysSinceSeen * 0.1); 

  return weight;
};
