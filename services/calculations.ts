
export type StatusType = 'success' | 'warning' | 'error' | 'neutral';

export interface Classification {
  status: StatusType;
  label: string;
}

export const getBMIClassification = (bmi: number): Classification => {
  if (!bmi || bmi === 0) return { status: 'neutral', label: '' };
  // Padrão Lipschit (Idosos)
  if (bmi < 22) return { status: 'error', label: 'Baixo Peso (<22)' };
  if (bmi > 27) return { status: 'warning', label: 'Sobrepeso (>27)' };
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
      ? { status: 'error', label: 'Fraco (<27kg)' }
      : { status: 'success', label: 'Normal (≥27kg)' };
  } else if (gender === 'female') {
    return value < 16
      ? { status: 'error', label: 'Fraco (<16kg)' }
      : { status: 'success', label: 'Normal (≥16kg)' };
  }
  return { status: 'neutral', label: '' };
};

// Reference: Bohannon RW. Reference values for the five-repetition sit-to-stand test
export const getSitToStandClassification = (seconds: number): Classification => {
    if (!seconds || seconds === 0) return { status: 'neutral', label: '' };
    if (seconds > 15) return { status: 'error', label: 'Ruim (>15s)' };
    if (seconds > 12) return { status: 'warning', label: 'Atenção (>12s)' };
    return { status: 'success', label: 'Bom (≤12s)' };
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

// Reference: Rikli & Jones (Senior Fitness Test) - 2 Minute Step Test
export const getTwoMinStepClassification = (age: number, gender: string, steps: number): Classification => {
  if (!steps || !age || !gender) return { status: 'neutral', label: '' };

  let min = 0;
  let max = 0;

  // Logic based on the provided image table
  if (gender === 'male') {
    if (age >= 60 && age <= 64) { min = 87; max = 115; }
    else if (age >= 65 && age <= 69) { min = 86; max = 116; }
    else if (age >= 70 && age <= 74) { min = 80; max = 110; }
    else if (age >= 75 && age <= 79) { min = 73; max = 109; }
    else if (age >= 80 && age <= 84) { min = 71; max = 103; }
    else if (age >= 85 && age <= 89) { min = 59; max = 91; }
    else if (age >= 90) { min = 52; max = 86; } // Using 90-94 range for 90+
    else { min = 87; max = 115; } // Default fallback to youngest bracket if < 60
  } else {
    // Female
    if (age >= 60 && age <= 64) { min = 75; max = 107; }
    else if (age >= 65 && age <= 69) { min = 73; max = 107; }
    else if (age >= 70 && age <= 74) { min = 68; max = 101; }
    else if (age >= 75 && age <= 79) { min = 68; max = 100; }
    else if (age >= 80 && age <= 84) { min = 60; max = 90; }
    else if (age >= 85 && age <= 89) { min = 55; max = 85; }
    else if (age >= 90) { min = 44; max = 72; } // Using 90-94 range for 90+
    else { min = 75; max = 107; } // Default fallback
  }

  if (steps < min) return { status: 'error', label: `Abaixo do esperado (<${min})` };
  // If strictly inside range or above, we consider it good, but we can differentiate above average
  // The prompt asked for Green for Positive. Being within range is positive. Being above is also positive.
  return { status: 'success', label: `Dentro/Acima do esperado (${min}-${max})` };
};
