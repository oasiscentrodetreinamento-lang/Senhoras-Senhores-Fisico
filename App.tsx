
import React, { useState, useEffect } from 'react';
import { Activity, Save, FileText, User, Scale, Timer, Heart, Brain, Stethoscope, Plus, Download, Sparkles, ChevronRight, Thermometer } from 'lucide-react';
import { Assessment, INITIAL_ASSESSMENT } from './types';
import { Section } from './components/Section';
import { InputGroup } from './components/InputGroup';
import { generatePDF } from './services/pdfService';
import { analyzeAssessment } from './services/geminiService';
import { 
  getBMIClassification, 
  getHandgripClassification, 
  getTUGClassification, 
  getSitToStandClassification,
  getTwoMinStepClassification
} from './services/calculations';

const App: React.FC = () => {
  const [data, setData] = useState<Assessment>(INITIAL_ASSESSMENT);
  const [savedAssessments, setSavedAssessments] = useState<Assessment[]>([]);
  const [view, setView] = useState<'form' | 'list'>('form');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('oasis_assessments');
    if (saved) {
      setSavedAssessments(JSON.parse(saved));
    }
  }, []);

  // Calculate Age
  useEffect(() => {
    if (data.birthDate) {
      const today = new Date();
      const birthDate = new Date(data.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setData(prev => ({ ...prev, calculatedAge: age }));
    }
  }, [data.birthDate]);

  // Calculate BMI
  useEffect(() => {
    if (data.weight > 0 && data.height > 0) {
      const heightInMeters = data.height / 100;
      const bmi = data.weight / (heightInMeters * heightInMeters);
      setData(prev => ({ ...prev, bmi: parseFloat(bmi.toFixed(2)) }));
    }
  }, [data.weight, data.height]);

  const handleChange = (field: keyof Assessment, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!data.name) {
      alert("Por favor, insira o nome do paciente.");
      return;
    }
    const newAssessment = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updatedList = [newAssessment, ...savedAssessments];
    setSavedAssessments(updatedList);
    localStorage.setItem('oasis_assessments', JSON.stringify(updatedList));
    alert("Avaliação salva com sucesso!");
    setView('list');
  };

  const handleNew = () => {
    setData(INITIAL_ASSESSMENT);
    setAiAnalysis(null);
    setView('form');
  };

  const handleLoad = (assessment: Assessment) => {
    setData(assessment);
    setAiAnalysis(null);
    setView('form');
  };

  const handleAIAnalysis = async () => {
    if(!process.env.API_KEY) {
        alert("API Key do Gemini não encontrada. Adicione a variável de ambiente para usar este recurso.");
        return;
    }
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeAssessment(data);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             {/* Logo Image */}
             {!logoError && (
               <img 
                src="./logo.png" 
                alt="Logo Senhoras & Senhores" 
                className="h-16 w-auto object-contain"
                onError={() => setLogoError(true)}
               />
             )}
            <div>
              <h1 className="text-2xl font-display font-bold text-brand-blue leading-tight">
                SENHORAS <span className="text-brand-green">&</span> SENHORES
              </h1>
              <p className="text-xs font-semibold text-brand-green tracking-widest uppercase">
                Saúde e Bem Estar • Físico Funcional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleNew}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-secondary-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
            >
              <Plus size={18} /> Nova Avaliação
            </button>
            <button 
              onClick={() => setView('list')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand-blue rounded-lg font-medium transition-all text-sm"
            >
              <Save size={18} /> Salvas ({savedAssessments.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'list' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-blue flex items-center gap-2">
                    <FileText className="text-brand-green"/> Histórico de Avaliações
                </h2>
            </div>
            
            {savedAssessments.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma avaliação encontrada</h3>
                    <p className="text-gray-500 mt-1">Comece uma nova avaliação clicando no botão acima.</p>
                </div>
            )}
            <div className="grid gap-4">
              {savedAssessments.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center font-bold text-lg">
                        {item.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-brand-blue transition-colors">{item.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>{new Date(item.assessmentDate).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{item.calculatedAge} anos</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => handleLoad(item)} className="flex-1 md:flex-none px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
                        Abrir Ficha
                    </button>
                    <button onClick={() => generatePDF(item)} className="flex-1 md:flex-none px-4 py-2 text-sm bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <Download size={16}/> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* Introduction Banner */}
            <div className="bg-gradient-to-r from-brand-blue to-blue-800 rounded-xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 transform rotate-45"></div>
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-1">Nova Avaliação Físico-Funcional</h2>
                    <p className="text-blue-100 text-sm">Preencha os dados abaixo com atenção. A classificação dos riscos será calculada automaticamente.</p>
                </div>
            </div>

            {/* Section 1: Personal Data */}
            <Section title="Dados Pessoais e Sinais Vitais Iniciais" className="border-l-4 border-l-brand-blue">
                <InputGroup 
                    label="Nome Completo" 
                    placeholder="Ex: Maria da Silva" 
                    value={data.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="md:col-span-2"
                />
                <InputGroup 
                    label="Data de Nascimento" 
                    type="date" 
                    value={data.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                />
                <InputGroup 
                    label="Gênero" 
                    as="select" 
                    options={[
                        {value: '', label: 'Selecione...'},
                        {value: 'male', label: 'Masculino'},
                        {value: 'female', label: 'Feminino'}
                    ]}
                    value={data.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                />
                <InputGroup 
                    label="Idade Calculada" 
                    value={data.calculatedAge}
                    readOnly
                    className="bg-gray-50"
                    suffix="anos"
                />
                 <InputGroup 
                    label="Pressão Arterial (Início)" 
                    placeholder="Ex: 120/80" 
                    value={data.bloodPressureStart}
                    onChange={(e) => handleChange('bloodPressureStart', e.target.value)}
                    suffix="mmHg"
                    className="border-2 border-blue-100 rounded-lg p-1"
                />
            </Section>

            {/* Section 2: Anthropometry */}
            <Section title="Antropometria" className="border-l-4 border-l-brand-green">
                <InputGroup 
                    label="Estatura" 
                    type="number"
                    placeholder="Ex: 170"
                    value={data.height || ''}
                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                    suffix="cm"
                />
                <InputGroup 
                    label="Massa Corporal" 
                    type="number"
                    placeholder="Ex: 70"
                    value={data.weight || ''}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                    suffix="kg"
                />
                <InputGroup 
                    label="IMC" 
                    value={data.bmi || ''}
                    readOnly
                    className="bg-gray-50 font-bold text-brand-blue"
                    suffix="kg/m²"
                    feedback={getBMIClassification(data.bmi)}
                />
                <InputGroup 
                    label="Data da Avaliação" 
                    type="date"
                    value={data.assessmentDate}
                    onChange={(e) => handleChange('assessmentDate', e.target.value)}
                />
                <InputGroup 
                    label="% Gordura" 
                    type="number"
                    value={data.bodyFatPercentage || ''}
                    onChange={(e) => handleChange('bodyFatPercentage', parseFloat(e.target.value))}
                    suffix="%"
                />
                <InputGroup 
                    label="% Massa Magra" 
                    type="number"
                    value={data.leanMassPercentage || ''}
                    onChange={(e) => handleChange('leanMassPercentage', parseFloat(e.target.value))}
                    suffix="%"
                />
            </Section>

            {/* Section 3: Lower Limb Strength */}
            <Section title="Teste de Força de Membros Inferiores (MMI)" className="border-l-4 border-l-brand-blue">
               <div className="md:col-span-2 flex items-start gap-3 mb-2 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <Timer size={20} className="text-brand-blue mt-0.5 flex-shrink-0" />
                    <div>
                        <strong className="block text-brand-blue mb-1">Protocolo Sit-to-Stand (Sentar e Levantar)</strong>
                        Cronometre o tempo necessário para realizar 5 repetições completas.
                    </div>
               </div>
               <InputGroup 
                    label="1ª Tentativa (segundos)" 
                    type="number"
                    placeholder="Ex: 10.5"
                    value={data.lowerLimbTest1 || ''}
                    onChange={(e) => handleChange('lowerLimbTest1', parseFloat(e.target.value))}
                    suffix="s"
                    feedback={getSitToStandClassification(data.lowerLimbTest1)}
                />
                <InputGroup 
                    label="2ª Tentativa (segundos)" 
                    type="number"
                    placeholder="Ex: 11.2"
                    value={data.lowerLimbTest2 || ''}
                    onChange={(e) => handleChange('lowerLimbTest2', parseFloat(e.target.value))}
                    suffix="s"
                    feedback={getSitToStandClassification(data.lowerLimbTest2)}
                />
            </Section>

            {/* Section 4: Handgrip */}
            <Section title="Força Preensão Palmar (Handgrip)" className="border-l-4 border-l-brand-green">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">D</span> 
                            Mão Direita
                        </h4>
                        <InputGroup 
                            label="1ª Tentativa" 
                            type="number"
                            value={data.handgripRight1 || ''}
                            onChange={(e) => handleChange('handgripRight1', parseFloat(e.target.value))}
                            suffix="kg"
                            feedback={getHandgripClassification(data.gender, data.handgripRight1)}
                        />
                        <InputGroup 
                            label="2ª Tentativa" 
                            type="number"
                            value={data.handgripRight2 || ''}
                            onChange={(e) => handleChange('handgripRight2', parseFloat(e.target.value))}
                            suffix="kg"
                            feedback={getHandgripClassification(data.gender, data.handgripRight2)}
                        />
                    </div>
                    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                             <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">E</span> 
                            Mão Esquerda
                        </h4>
                        <InputGroup 
                            label="1ª Tentativa" 
                            type="number"
                            value={data.handgripLeft1 || ''}
                            onChange={(e) => handleChange('handgripLeft1', parseFloat(e.target.value))}
                            suffix="kg"
                            feedback={getHandgripClassification(data.gender, data.handgripLeft1)}
                        />
                        <InputGroup 
                            label="2ª Tentativa" 
                            type="number"
                            value={data.handgripLeft2 || ''}
                            onChange={(e) => handleChange('handgripLeft2', parseFloat(e.target.value))}
                            suffix="kg"
                            feedback={getHandgripClassification(data.gender, data.handgripLeft2)}
                        />
                    </div>
                </div>
            </Section>

            {/* Section 5: Aerobic (Updated to 2 Min Step Test) */}
            <Section title="Capacidade Aeróbia (2 Minutos)" className="border-l-4 border-l-brand-blue">
                <div className="md:col-span-2 flex items-start gap-3 mb-2 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <Heart size={20} className="text-brand-blue mt-0.5 flex-shrink-0" />
                    <div>
                        <strong className="block text-brand-blue mb-1">Teste de Marcha Estacionária (2 Minutos)</strong>
                        Conte o número de elevações do joelho direito completas em 2 minutos. O joelho deve atingir a altura média entre a patela e a crista ilíaca.
                    </div>
               </div>
                <div className="md:col-span-2">
                    <InputGroup 
                        label="Número de Repetições" 
                        type="number"
                        placeholder="Ex: 80"
                        value={data.twoMinStepScore || ''}
                        onChange={(e) => handleChange('twoMinStepScore', parseFloat(e.target.value))}
                        suffix="elevações"
                        feedback={getTwoMinStepClassification(data.calculatedAge, data.gender, data.twoMinStepScore)}
                    />
                </div>
            </Section>

            {/* Section 6 & 7: Scales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Escala KATZ (AVD)" className="mb-0 border-l-4 border-l-brand-green">
                     <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-3">Atividades Básicas da Vida Diária (Banho, Vestir, Higiene, Transferência, Continência, Alimentação).</p>
                        <InputGroup 
                            label="Pontuação (0-6)" 
                            type="number"
                            max={6}
                            min={0}
                            value={data.katzScore || ''}
                            onChange={(e) => handleChange('katzScore', parseFloat(e.target.value))}
                        />
                        <div className={`mt-3 p-3 text-sm rounded-lg flex items-center gap-2 ${data.katzScore <= 2 ? 'bg-red-50 text-red-700 border border-red-100' : data.katzScore <= 4 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            <Activity size={16} />
                            {data.katzScore <= 2 ? 'Dependência Importante' : data.katzScore <= 4 ? 'Dependência Parcial' : 'Independente'}
                        </div>
                     </div>
                </Section>
                <Section title="Escala Lawton (AIVD)" className="mb-0 border-l-4 border-l-brand-blue">
                    <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-3">Atividades Instrumentais da Vida Diária (Telefone, Compras, Comida, Casa, Roupa, Viagem, Remédios, Finanças).</p>
                        <InputGroup 
                            label="Pontuação (0-27)" 
                            type="number"
                            max={27}
                            min={0}
                            value={data.lawtonScore || ''}
                            onChange={(e) => handleChange('lawtonScore', parseFloat(e.target.value))}
                        />
                         <div className={`mt-3 p-3 text-sm rounded-lg flex items-center gap-2 ${data.lawtonScore < 9 ? 'bg-red-50 text-red-700 border border-red-100' : data.lawtonScore < 19 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                             <Activity size={16} />
                            {data.lawtonScore < 9 ? 'Dependência Total' : data.lawtonScore < 19 ? 'Dependência Parcial' : 'Independência'}
                        </div>
                    </div>
                </Section>
            </div>

            {/* Section 8: TUG */}
            <Section title="TUG (Timed Up and Go)" className="border-l-4 border-l-brand-green">
                <div className="md:col-span-2">
                     <p className="text-sm text-gray-500 mb-3">Avaliação de mobilidade e equilíbrio dinâmico.</p>
                     <InputGroup 
                        label="Tempo Total" 
                        type="number"
                        placeholder="Ex: 10.5"
                        value={data.tugTime || ''}
                        onChange={(e) => handleChange('tugTime', parseFloat(e.target.value))}
                        suffix="segundos"
                        feedback={getTUGClassification(data.tugTime)}
                    />
                </div>
            </Section>

             {/* Section 9: Final Vitals & Notes */}
             <Section title="Finalização da Avaliação" className="border-l-4 border-l-gray-400">
                <div className="md:col-span-2 grid grid-cols-1 gap-4">
                     <InputGroup 
                        label="Pressão Arterial (Final)" 
                        placeholder="Ex: 125/80" 
                        value={data.bloodPressureEnd}
                        onChange={(e) => handleChange('bloodPressureEnd', e.target.value)}
                        suffix="mmHg"
                        className="max-w-xs border-2 border-blue-100 rounded-lg p-1 bg-blue-50/30"
                    />
                    <InputGroup 
                        as="textarea"
                        label="Observações e Recomendações"
                        placeholder="Digite aqui as observações clínicas, particularidades do paciente e recomendações..."
                        value={data.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="min-h-[120px]"
                    />
                </div>
            </Section>

            {/* Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-2xl">
                 <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3 justify-end items-center">
                     <div className="hidden md:block mr-auto text-sm text-gray-500">
                        {data.name ? <span>Avaliando: <strong>{data.name}</strong></span> : <span>Nova Avaliação</span>}
                     </div>

                    {/* AI Button */}
                    <button 
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg shadow-md transition-all font-bold disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                    >
                        {isAnalyzing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {isAnalyzing ? 'Analisando...' : 'Análise IA'}
                    </button>

                     {/* PDF Button */}
                    <button 
                        onClick={() => generatePDF(data)}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-md transition-all font-bold text-sm"
                    >
                        <Download size={18} /> PDF
                    </button>

                     {/* Save Button */}
                     <button 
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-brand-green hover:bg-brand-green/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-bold text-sm"
                    >
                        <Save size={18} /> Salvar
                    </button>
                </div>
            </div>
            
            {/* AI Result Modal / Overlay */}
            {aiAnalysis && (
                <div className="fixed inset-0 bg-brand-blue/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-gray-100">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Análise Inteligente</h3>
                            </div>
                            <button 
                                onClick={() => setAiAnalysis(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="prose prose-indigo max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                {aiAnalysis}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 p-4 flex justify-end border-t border-gray-100 rounded-b-2xl">
                             <button 
                                onClick={() => setAiAnalysis(null)}
                                className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium shadow-sm"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
