
import jsPDF from 'jspdf';
import { Assessment } from '../types';
import { 
  getBMIClassification, 
  getHandgripClassification, 
  getTUGClassification, 
  getSitToStandClassification,
  getKatzClassification,
  getLawtonClassification
} from './calculations';

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

export const generatePDF = async (data: Assessment) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [30, 64, 175]; // Brand Blue
  const secondaryColor = [101, 163, 13]; // Brand Green
  const lightGray = [248, 250, 252];

  // --- Header ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F'); // Increased height for logo
  
  // Try to add logo
  try {
      const img = await loadImage('./logo.png');
      // White circle background for logo
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 17, 12, 'F');
      doc.addImage(img, 'PNG', 15, 7, 20, 20); // Adjust positioning
  } catch (e) {
      console.warn("Logo load failed", e);
  }

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("SENHORAS & SENHORES", 105, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("AVALIAÇÃO FÍSICO-FUNCIONAL E GERIÁTRICA", 105, 26, { align: 'center' });

  let y = 50;
  const leftMargin = 14;
  const rightMargin = 196;
  
  // Helper functions
  const resetText = () => {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  };

  const checkPageBreak = (spaceNeeded: number = 15) => {
    if (y + spaceNeeded > 280) {
        doc.addPage();
        y = 20;
        return true;
    }
    return false;
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(20);
    y += 5;
    // Background strip
    doc.setFillColor(240, 245, 255);
    doc.rect(leftMargin, y - 4, 182, 8, 'F');
    // Accent line
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(1);
    doc.line(leftMargin, y + 4, leftMargin + 182, y + 4);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, leftMargin + 2, y + 1);
    
    y += 12;
    resetText();
  };

  const addRow = (label: string, value: string, info: string = "") => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`${label}:`, leftMargin + 2, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, 90, y);

    if(info) {
        doc.setFontSize(9);
        const isSuccess = info.toLowerCase().includes('eutrófico') || info.toLowerCase().includes('bom') || info.toLowerCase().includes('preservada') || info.toLowerCase().includes('independen');
        const isError = info.toLowerCase().includes('risco') || info.toLowerCase().includes('dependência') || info.toLowerCase().includes('fraco') || info.toLowerCase().includes('ruim');
        
        if (isSuccess) doc.setTextColor(22, 163, 74); // Green
        else if (isError) doc.setTextColor(220, 38, 38); // Red
        else doc.setTextColor(100, 100, 100); // Gray

        doc.text(`(${info})`, 140, y);
        resetText();
    }

    // Light grid line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(leftMargin, y + 2, rightMargin, y + 2);
    
    y += 8;
  };

  // --- Content ---

  // 1. Dados Pessoais
  addSectionTitle("DADOS PESSOAIS");
  addRow("Nome", data.name);
  addRow("Data de Nascimento", `${data.birthDate.split('-').reverse().join('/')} (${data.calculatedAge} anos)`);
  addRow("Gênero", data.gender === 'male' ? 'Masculino' : 'Feminino');
  addRow("Data da Avaliação", data.assessmentDate.split('-').reverse().join('/'));

  // 2. Antropometria
  addSectionTitle("ANTROPOMETRIA");
  addRow("Estatura", `${data.height} cm`);
  addRow("Massa Corporal", `${data.weight} kg`);
  addRow("IMC", `${data.bmi.toFixed(2)} kg/m²`, getBMIClassification(data.bmi).label);
  addRow("% Gordura", `${data.bodyFatPercentage} %`);
  addRow("% Massa Magra", `${data.leanMassPercentage} %`);

  // 3. Força e Funcionalidade
  addSectionTitle("TESTES DE FORÇA E FUNCIONALIDADE");
  
  const bestSitToStand = Math.min(data.lowerLimbTest1 || 99, data.lowerLimbTest2 || 99);
  const sitStatus = bestSitToStand !== 99 ? getSitToStandClassification(bestSitToStand).label : "";
  addRow("Sit-to-Stand (Melhor Tempo)", bestSitToStand !== 99 ? `${bestSitToStand} s` : "-", sitStatus);
  
  const maxHandgripRight = Math.max(data.handgripRight1, data.handgripRight2);
  const maxHandgripLeft = Math.max(data.handgripLeft1, data.handgripLeft2);
  const handStatusR = getHandgripClassification(data.gender, maxHandgripRight).label;
  const handStatusL = getHandgripClassification(data.gender, maxHandgripLeft).label;

  addRow("Preensão Palmar (Direita)", `${maxHandgripRight} kg`, handStatusR);
  addRow("Preensão Palmar (Esquerda)", `${maxHandgripLeft} kg`, handStatusL);
  
  const tugStatus = getTUGClassification(data.tugTime).label;
  addRow("TUG (Timed Up and Go)", `${data.tugTime} s`, tugStatus);
  addRow("Teste de Marcha (6 min)", `${data.sixMinWalkSteps} passos`);

  // 4. Escalas
  addSectionTitle("ESCALAS DE INDEPENDÊNCIA");
  addRow("Escala KATZ (AVD)", `${data.katzScore} / 6`, getKatzClassification(data.katzScore).label);
  addRow("Escala Lawton (AIVD)", `${data.lawtonScore} / 27`, getLawtonClassification(data.lawtonScore).label);

  // 5. Observações
  if (data.notes) {
    addSectionTitle("PARECER PROFISSIONAL");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const splitNotes = doc.splitTextToSize(data.notes, 180);
    doc.text(splitNotes, leftMargin + 2, y);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Senhoras & Senhores - Gerado em ${new Date().toLocaleDateString()}`, 105, pageHeight - 10, { align: 'center' });

  doc.save(`Relatorio_${data.name.replace(/\s+/g, '_')}_${data.assessmentDate}.pdf`);
};
