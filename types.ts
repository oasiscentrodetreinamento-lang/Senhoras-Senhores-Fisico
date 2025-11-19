
export interface Assessment {
  id: string;
  createdAt: string;
  
  // Dados Pessoais
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | '';
  calculatedAge: number;

  // Sinais Vitais
  bloodPressureStart: string; // ex: 120/80
  bloodPressureEnd: string;

  // Antropometria
  height: number; // cm
  weight: number; // kg
  bmi: number;
  bodyFatPercentage: number;
  leanMassPercentage: number;
  assessmentDate: string;

  // Teste de Força de Membros Inferiores (Sit-to-Stand)
  lowerLimbTest1: number; // seconds
  lowerLimbTest2: number; // seconds

  // Força Preensão Palmar
  handgripRight1: number;
  handgripRight2: number;
  handgripLeft1: number;
  handgripLeft2: number;

  // Capacidade Aeróbia (2 min step test)
  twoMinStepScore: number; // number of steps

  // Escalas
  katzScore: number; // 0-6
  lawtonScore: number; // 0-27

  // TUG
  tugTime: number; // seconds

  // Observações
  notes: string;
}

export const INITIAL_ASSESSMENT: Assessment = {
  id: '',
  createdAt: '',
  name: '',
  birthDate: '',
  gender: '',
  calculatedAge: 0,
  bloodPressureStart: '',
  bloodPressureEnd: '',
  height: 0,
  weight: 0,
  bmi: 0,
  bodyFatPercentage: 0,
  leanMassPercentage: 0,
  assessmentDate: new Date().toISOString().split('T')[0],
  lowerLimbTest1: 0,
  lowerLimbTest2: 0,
  handgripRight1: 0,
  handgripRight2: 0,
  handgripLeft1: 0,
  handgripLeft2: 0,
  twoMinStepScore: 0,
  katzScore: 0,
  lawtonScore: 0,
  tugTime: 0,
  notes: ''
};
