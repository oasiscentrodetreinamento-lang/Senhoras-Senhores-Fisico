import jsPDF from 'jspdf';
import { Assessment } from '../types';

export const generatePDF = (data: Assessment) => {
  const doc = new jsPDF();
  
  // Colors
  // Brand Blue: #1e40af -> [30, 64, 175]
  // Brand Green: #65a30d -> [101, 163, 13]
  const primaryColor = [30, 64, 175]; 
  const secondaryColor = [101, 163, 13];
  
  // Header Background (Blue)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("SENHORAS & SENHORES", 105, 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("AVALIAÇÃO FÍSICO-FUNCIONAL", 105, 19, { align: 'center' });

  let y = 40;
  const lineHeight = 8;

  // Helper to reset text
  const resetText = () => {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  };

  const addSectionTitle = (title: string) => {
    y += 5;
    // Draw accents
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, y + 2, 196, y + 2);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Blue Text
    doc.text(title, 14, y);
    
    y += 10;
    resetText();
  };

  const addField = (label: string, value: string | number, unit: string = '') => {
    // Check page break
    if (y > 270) {
        doc.addPage();
        y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${value} ${unit}`, 80, y);
    y += lineHeight;
  };

  resetText();

  // Section: Personal Data
  addSectionTitle("DADOS PESSOAIS");
  addField("Nome", data.name);
  addField("Data de Nascimento", data.birthDate.split('-').reverse().join('/'));
  addField("Idade Calculada", data.calculatedAge, "anos");
  addField("Gênero", data.gender === 'male' ? 'Masculino' : data.gender === 'female' ? 'Feminino' : 'Não informado');

  // Section: Antropometria
  addSectionTitle("ANTROPOMETRIA");
  addField("Data da Avaliação", data.assessmentDate.split('-').reverse().join('/'));
  addField("Estatura", data.height, "cm");
  addField("Massa Corporal", data.weight, "kg");
  addField("IMC", data.bmi.toFixed(2), "kg/m²");
  addField("% Gordura", data.bodyFatPercentage, "%");
  addField("% Massa Magra", data.leanMassPercentage, "%");

  // Section: Functional Tests
  addSectionTitle("TESTES FÍSICOS E FUNCIONAIS");
  doc.setFont('helvetica', 'bold');
  doc.text("Membros Inferiores (Sit-to-Stand):", 14, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text(`1ª Tentativa: ${data.lowerLimbTest1}s`, 20, y);
  doc.text(`2ª Tentativa: ${data.lowerLimbTest2}s`, 80, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text("Preensão Palmar (Handgrip):", 14, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.text(`Dir 1: ${data.handgripRight1}kg`, 20, y);
  doc.text(`Dir 2: ${data.handgripRight2}kg`, 60, y);
  doc.text(`Esq 1: ${data.handgripLeft1}kg`, 100, y);
  doc.text(`Esq 2: ${data.handgripLeft2}kg`, 140, y);
  y += lineHeight;

  addField("Teste de Marcha (6 min)", data.sixMinWalkSteps, "passos");
  addField("TUG (Timed Up and Go)", data.tugTime, "segundos");

  // Section: Scales
  addSectionTitle("ESCALAS DE INDEPENDÊNCIA");
  addField("Escala KATZ (AVD)", `${data.katzScore} / 6`);
  addField("Escala Lawton (AIVD)", `${data.lawtonScore} / 27`);

  // Section: Notes
  if (data.notes) {
    addSectionTitle("OBSERVAÇÕES DO PROFISSIONAL");
    const splitNotes = doc.splitTextToSize(data.notes, 180);
    doc.text(splitNotes, 14, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Gerado em ${new Date().toLocaleDateString()} via Senhoras & Senhores`, 105, 290, { align: 'center' });

  doc.save(`Relatorio_${data.name.replace(/\s+/g, '_')}_${data.assessmentDate}.pdf`);
};