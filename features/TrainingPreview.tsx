import React, { useState, useEffect } from 'react';
import { supabase, getTrainingContent } from '../lib/supabase';
import { Training, TrainingModule } from '../types';
import { useToast } from '../lib/ToastContext';
import { 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Monitor, 
  Users, 
  Clock,
  CheckCircle,
  BarChart3,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';

interface TrainingPreviewProps {
  trainingId: string;
  onClose: () => void;
}

export const TrainingPreview: React.FC<TrainingPreviewProps> = ({ 
  trainingId, 
  onClose 
}) => {
  const { showToast } = useToast();
  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmployeeView, setShowEmployeeView] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadContent();
  }, [trainingId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Načítame reálny obsah z databázy - bez companyId pre demo mód
      const { training, modules } = await getTrainingContent(trainingId);
      setTraining(training);
      setModules(modules);
      console.log('Načítané moduly:', modules); // Debug log
    } catch (error) {
      console.error("Chyba pri načítaní obsahu:", error);
      showToast('Chyba pri načítaní školenia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentModule = modules[currentModuleIndex];
  const progress = Math.round(((currentModuleIndex + 1) / modules.length) * 100);

  const handleNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const resetPreview = () => {
    setCurrentModuleIndex(0);
    setShowResults(false);
    setQuizAnswers({});
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-white flex items-center justify-center z-50 ${isFullscreen ? '' : 'inset-4 rounded-3xl border border-slate-200'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Načítavam obsah školenia...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`fixed bg-gray-50 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'inset-0' : 'inset-4 rounded-3xl border border-slate-200'}`}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🏆
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview ukončený</h2>
          <p className="text-gray-600 mb-8">
            Prehliadli ste si školenie: <br/>
            <span className="font-semibold text-gray-900">{training?.title}</span>
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={resetPreview}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Prehrať znova
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              Zavrieť preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin control panel
  const AdminControls = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Eye size={20} />
          <span className="font-semibold">PREVIEW MÓD</span>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Monitor size={16} />
          <span>Zamestnanecký pohľad</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="opacity-75">Modul:</span> {currentModuleIndex + 1}/{modules.length}
        </div>
        <div className="text-sm">
          <span className="opacity-75">Progress:</span> {progress}%
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/20 rounded-lg transition-all"
          title={isFullscreen ? "Zmenšiť" : "Zväčšiť"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-all"
          title="Zavrieť preview"
        >
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`fixed bg-white shadow-2xl z-50 flex flex-col ${isFullscreen ? 'inset-0' : 'inset-4 rounded-3xl border border-slate-200 overflow-hidden'}`}>
      {/* Admin control panel */}
      <AdminControls />

      {/* Training content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{training?.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentModule?.title} • {currentModule?.duration_minutes || 15} minút
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">{progress}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>{currentModule?.duration_minutes || 15} min</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">
            {currentModule?.module_type === 'text' && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentModule.title}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  Typ obsahu: Text | Dĺžka: {currentModule.duration_minutes || 15} minút
                </div>
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: currentModule.content || currentModule.description || '<p>Obsah modulu nie je k dispozícii</p>' }}
                />
              </div>
            )}

            {currentModule?.module_type === 'video' && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentModule.title}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  Typ obsahu: Video | Dĺžka: {currentModule.duration_minutes || 15} minút
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Video obsah (v preview móde)</p>
                    <p className="text-sm opacity-75 mt-2">V reálnom zobrazení by sa tu prehrávalo video</p>
                  </div>
                </div>
                {currentModule.content && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Popis videa:</strong> {currentModule.content}
                    </p>
                  </div>
                )}
                {currentModule.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Popis modulu:</strong> {currentModule.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentModule?.module_type === 'quiz' && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentModule.title}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  Typ obsahu: Test | Dĺžka: {currentModule.duration_minutes || 10} minút
                </div>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Test (Preview mód):</strong> V reálnom zobrazení by tu bol interaktívny test.
                    </p>
                    {currentModule.content && (
                      <p className="text-sm text-yellow-700 mt-2">{currentModule.content}</p>
                    )}
                  </div>
                  
                  {currentModule.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Popis testu:</strong> {currentModule.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-center text-gray-500 py-8">
                    <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Výsledky testu by sa zobrazili po dokončení</p>
                  </div>
                </div>
              </div>
            )}

            {!currentModule && (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <p className="text-gray-500">Obsah modulu nie je k dispozícii</p>
              </div>
            )}

            {/* Debug informácie pre admina */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2">Debug informácie:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>ID modulu:</strong> {currentModule?.id}</p>
                  <p><strong>Typ:</strong> {currentModule?.module_type}</p>
                  <p><strong>Order:</strong> {currentModule?.order_index}</p>
                  <p><strong>Content dĺžka:</strong> {currentModule?.content?.length || 0} znakov</p>
                  <p><strong>Popis dĺžka:</strong> {currentModule?.description?.length || 0} znakov</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentModuleIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={18} />
              Späť
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Modul {currentModuleIndex + 1} z {modules.length}</span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              {currentModuleIndex === modules.length - 1 ? 'Dokončiť' : 'Ďalej'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPreview;
