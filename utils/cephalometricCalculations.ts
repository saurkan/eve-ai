import { CephalometricLandmark, CephalometricPoint, CephalometricAnalysis } from '../types';

// --- Geometric Helper Functions ---

const getPoint = (name: string, landmarks: CephalometricLandmark[]): CephalometricPoint | undefined => {
  return landmarks.find(lm => lm.name === name)?.point;
};

const calculateDistance = (p1: CephalometricPoint, p2: CephalometricPoint): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const calculateAngle = (p1: CephalometricPoint, p2: CephalometricPoint, p3: CephalometricPoint): number => {
  const p12 = calculateDistance(p1, p2);
  const p13 = calculateDistance(p1, p3);
  const p23 = calculateDistance(p2, p3);
  // Law of cosines
  const angleRad = Math.acos((p12 * p12 + p13 * p13 - p23 * p23) / (2 * p12 * p13));
  return angleRad * (180 / Math.PI); // Convert radians to degrees
};


// --- Main Analysis Function ---

export const analyzeCephalometricData = (landmarks: CephalometricLandmark[]): CephalometricAnalysis => {
  const analysis: CephalometricAnalysis = {};

  const S = getPoint('Sella (S)', landmarks);
  const N = getPoint('Nasion (N)', landmarks);
  const A = getPoint('A-point (A)', landmarks);
  const B = getPoint('B-point (B)', landmarks);

  // --- Steiner Analysis (Angular) ---
  if (S && N && A && B) {
    const sna = calculateAngle(N, S, A);
    const snb = calculateAngle(N, S, B);
    const anb = sna - snb;
    
    analysis['Steiner Analysis'] = [
      { name: 'SNA', value: sna, unit: 'degrees', normalRange: '82° ± 2°', interpretation: sna > 84 ? 'Protrusive' : (sna < 80 ? 'Retrusive' : 'Normal') },
      { name: 'SNB', value: snb, unit: 'degrees', normalRange: '80° ± 2°', interpretation: snb > 82 ? 'Protrusive' : (snb < 78 ? 'Retrusive' : 'Normal') },
      { name: 'ANB', value: anb, unit: 'degrees', normalRange: '2° ± 2°', interpretation: anb > 4 ? 'Skeletal Class II' : (anb < 0 ? 'Skeletal Class III' : 'Normal') },
    ];
  }

  return analysis;
};