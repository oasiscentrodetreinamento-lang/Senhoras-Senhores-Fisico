
export type StatusType = 'success' | 'warning' | 'error' | 'neutral';

export interface Classification {
  status: StatusType;
  label: string;
}

export const getBMIClassification = (bmi: number): Classification => {
  if (!bmi || bmi === 0) return { status: 'neutral', label: '' };
  // Padrão Lipschit (Idosos)
  if (bmi < 22) return { status: 'warning', label: 'Baixo Peso (<22)' };
  if (bmi > 27) return { status: 'error', label: 'Sobrepeso (>27)' };
  return { status: 'success', label: 'Eutrófico (22-27)' };
};

export const getTUGClassification = (seconds: number): Classification => {
  if (!seconds || seconds === 0) return { status: 'neutral', label: '' };
  if (seconds < 10) return { status: 'success', label: 'Independente (<10s)' };
  if (seconds <= 20) return { status: 'warning', label: 'Risco de Queda Leve (10-20s)' };
  return { status: 'error', label: 'Alto Risco de Queda (>20s)' };
};

export const getHandgripClassification = (gender: string, value: number): Classification => {
  if (!value || !gender) return { status: 'neutral', label: '' };
  
  // EWGSOP2 Cut-off points for weak strength
  // Men < 27kg, Women < 16kg
  if (gender === 'male') {
    return value < 27 
      ? { status: 'error', label: 'Dinapenia/Fraqueza (<27kg)' }
      : { status: 'success', label: 'Força Preservada (≥27kg)' };
  } else if (gender === 'female') {
    return value < 16
      ? { status: 'error', label: 'Dinapenia/Fraqueza (<16kg)' }
      : { status: 'success', label: 'Força Preservada (≥16kg)' };
  }
  return { status: 'neutral', label: '' };
};

// Reference: Bohannon RW. Reference values for the five-repetition sit-to-stand test
// Simplified logic for general elderly screening
export const getSitToStandClassification = (seconds: number): Classification => {
    if (!seconds || seconds === 0) return { status: 'neutral', label: '' };
    // Generic cutoff often used is > 12s or > 15s depending on age. 
    // Using a conservative cutoff for screening:
    if (seconds > 15) return { status: 'error', label: 'Desempenho Ruim (>15s)' };
    if (seconds > 12) return { status: 'warning', label: 'Atenção (>12s)' };
    return { status: 'success', label: 'Desempenho Bom (≤12s)' };
};

export const getKatzClassification = (score: number): Classification => {
    if (score <= 2) return { status: 'error', label: 'Dependência Importante' };
    if (score <= 4) return { status: 'warning', label: 'Dependência Parcial' };
    return { status: 'success', label: 'Independente' };
};

export const getLawtonClassification = (score: number): Classification => {
    if (score < 9) return { status: 'error', label: 'Dependência Total' };
    if (score < 19) return { status: 'warning', label: 'Dependência Parcial' };
    return { status: 'success', label: 'Independência' };
};
