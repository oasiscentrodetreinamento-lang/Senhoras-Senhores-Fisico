import { GoogleGenAI } from "@google/genai";
import { Assessment } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeAssessment = async (data: Assessment): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Erro: Chave de API não configurada (API_KEY).";
  }

  const prompt = `
    Atue como um Fisioterapeuta Geriatra Especialista de nível sênior.
    Analise os seguintes dados de uma avaliação físico-funcional de um idoso e forneça um resumo clínico conciso, interpretação dos riscos (quedas, sarcopenia, dependência) e 3 recomendações principais.
    
    Dados do Paciente:
    - Nome: ${data.name}
    - Idade: ${data.calculatedAge} anos
    - Gênero: ${data.gender}
    
    Dados Clínicos:
    - IMC: ${data.bmi.toFixed(2)} (Peso: ${data.weight}kg, Altura: ${data.height}cm)
    - % Gordura: ${data.bodyFatPercentage}%
    - Força MMII (Levantar da cadeira): Melhor tempo ${Math.min(data.lowerLimbTest1 || 99, data.lowerLimbTest2 || 99)}s
    - Força Preensão Manual (Média): Direita ${(data.handgripRight1 + data.handgripRight2)/2}kg, Esquerda ${(data.handgripLeft1 + data.handgripLeft2)/2}kg
    - TUG (Timed Up and Go): ${data.tugTime}s
    - Caminhada 6 min: ${data.sixMinWalkSteps} passos
    - Escala Katz (AVD): ${data.katzScore}/6
    - Escala Lawton (AIVD): ${data.lawtonScore}/27
    
    Observações do avaliador: ${data.notes}

    Retorne a resposta em formato Markdown, com tópicos claros. Seja direto e profissional.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA para análise. Verifique sua conexão ou chave de API.";
  }
};