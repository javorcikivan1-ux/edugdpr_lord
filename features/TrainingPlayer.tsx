
import React, { useState, useEffect } from 'react';
import { supabase, getTrainingContent, updateTrainingProgress } from '../lib/supabase';
import { Training, TrainingModule, EmployeeTraining } from '../types';

interface TrainingPlayerProps {
  trainingId: string;
  assignmentId?: string; // ID záznamu v employee_trainings
  companyId?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const TrainingPlayer: React.FC<TrainingPlayerProps> = ({ 
  trainingId, 
  assignmentId, 
  companyId, 
  onClose,
  onComplete 
}) => {
  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadContent();
  }, [trainingId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { training, modules, isDemo } = await getTrainingContent(trainingId, companyId);
      setTraining(training);
      setModules(modules);
      setIsDemo(isDemo);
    } catch (error) {
      console.error("Chyba pri načítaní obsahu:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentModule = modules[currentModuleIndex];
  const progress = Math.round(((currentModuleIndex + 1) / modules.length) * 100);

  const handleNext = async () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextIndex = currentModuleIndex + 1;
      setCurrentModuleIndex(nextIndex);
      
      // Ak máme assignmentId, updatujeme progres v DB
      if (assignmentId) {
        const currentProgress = Math.round(((nextIndex + 1) / modules.length) * 100);
        await updateTrainingProgress(assignmentId, currentProgress, false);
      }
    } else {
      // Sme na konci
      if (assignmentId && !isDemo) {
        await updateTrainingProgress(assignmentId, 100, true);
      }
      setShowResults(true);
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Pripravujeme obsah školenia...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🏆
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gratulujeme!</h2>
          <p className="text-gray-600 mb-8">
            Úspešne ste absolvovali školenie: <br/>
            <span className="font-semibold text-gray-900">{training?.title}</span>
          </p>
          
          {isDemo ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
              <p className="font-bold mb-1">Pozor: Toto bola Demo verzia</p>
              <p>Pre získanie plnej verzie a certifikátu musí vaša firma zakúpiť licencie.</p>
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium mb-8">Váš certifikát bol vygenerovaný a je pripravený na stiahnutie.</p>
          )}

          <div className="space-y-3">
            {!isDemo && (
              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Stiahnuť certifikát (PDF)
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Zavrieť prehrávač
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
      {/* Header & Progress Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            ✕
          </button>
          <h1 className="font-bold text-gray-900 hidden md:block">{training?.title}</h1>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">
            <span>Progres školenia</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="text-sm font-bold text-gray-500">
          Modul {currentModuleIndex + 1} / {modules.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex items-start justify-center p-4 md:p-12">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 leading-tight">
              {currentModule?.title}
            </h2>

            {currentModule?.module_type === 'quiz' ? (
              <div className="space-y-8">
                {currentModule.quiz_questions?.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="font-bold text-gray-900 mb-4 text-lg">{q.question}</p>
                    <div className="grid gap-3">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                            quizAnswers[qIdx] === optIdx
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-white bg-white hover:border-gray-200 text-gray-600'
                          }`}
                        >
                          <span className="inline-block w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: currentModule?.content || '' }}
              />
            )}
            
            {isDemo && currentModuleIndex === modules.length - 1 && (
              <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-blue-900 font-bold text-sm">Dosiahli ste koniec Demo verzie</p>
                  <p className="text-blue-700 text-sm">Pre pokračovanie v školení a získanie certifikátu požiadajte svojho administrátora o zakúpenie licencie.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentModuleIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all"
        >
          ← Späť
        </button>

        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          {currentModuleIndex === modules.length - 1 ? 'Dokončiť školenie' : 'Pokračovať →'}
        </button>
      </div>
    </div>
  );
};
