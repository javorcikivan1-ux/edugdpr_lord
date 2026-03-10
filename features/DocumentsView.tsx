import React, { useState, useEffect } from 'react';
import { supabase, getMyDocuments, signDocument, markAsViewed } from '../lib/supabase';
import { 
  FileText, 
  CheckCircle2, 
  PenTool,
  ExternalLink,
  AlertOctagon,
  X
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("User not authenticated");
        return;
      }

      // Načítanie dokumentov na podpis
      const { data: docs } = await getMyDocuments();
      if (docs) {
        // Zoradenie dokumentov - nepodpísané hore, podpísané dole
        const sortedDocs = docs.map((d: any) => ({
          id: d.id,
          title: d.document?.title ?? 'Dokument bez názvu',
          url: d.document?.file_url ?? null,
          status: d.status,
          assignedDate: d.document?.created_at,
          signedDate: d.signed_at,
          rawDate: d.signed_at || d.document?.created_at || Date.now()
        })).sort((a: any, b: any) => {
          // Nepodpísané (PENDING) hore, podpísané (SIGNED) dole
          if (a.status === 'PENDING' && b.status === 'SIGNED') return -1;
          if (a.status === 'SIGNED' && b.status === 'PENDING') return 1;
          // V rovnakom stave zoradiť podľa dátumu (najnovšie hore)
          return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
        });
        
        setDocuments(sortedDocs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleView = async (id: string, url: string) => {
    if (!url || url === '#') {
      alert("Dokument nemá priradený súbor.");
      return;
    }
    try {
      await markAsViewed(id);
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(viewerUrl, '_blank');
      fetchData();
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleSign = async (id: string) => {
    setSelectedDocId(id);
    setAcknowledged(false);
    setShowSignModal(true);
  };

  const confirmSign = async () => {
    if (!selectedDocId || !acknowledged) return;
    try {
      const { error } = await signDocument(selectedDocId);
      if (error) throw error;
      setShowSignModal(false);
      fetchData();
    } catch (error) { 
      console.error(error); 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-blue rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium uppercase text-xs tracking-wider animate-pulse">Načítavam dokumenty...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left text-slate-900">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Dokumenty</h1>
            <div className="h-1 bg-brand-orange rounded-full mt-2 w-32"></div>
          </div>
        </div>
        <p className="text-slate-500 font-medium text-sm ml-18">Správa dokumentov na podpis.</p>
      </div>

      {/* ZOZNAM DOKUMENTOV */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {documents.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Žiadne dokumenty na podpis</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      doc.status === 'SIGNED' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                    }`}>
                      {doc.status === 'SIGNED' ? '✓' : '✍️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 leading-tight mb-2">{doc.title}</h4>
                      <div className="text-sm text-slate-500">
                        {doc.status === 'SIGNED' ? (
                          <>
                            Priradené: <strong>{new Date(doc.assignedDate).toLocaleDateString('sk-SK')}</strong><br />
                            <span className="text-green-600 font-semibold">Podpísané: {new Date(doc.signedDate).toLocaleDateString('sk-SK')}</span>
                          </>
                        ) : (
                          <>
                            Priradené: <strong>{new Date(doc.assignedDate).toLocaleDateString('sk-SK')}</strong><br />
                            <span className="text-red-500 font-semibold">NEPODPÍSANÉ</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {doc.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(doc.id, doc.url)}
                          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                          <ExternalLink size={16} />
                          Náhľad
                        </button>
                        <button 
                          onClick={() => handleSign(doc.id)}
                          className="flex items-center justify-center gap-2 bg-brand-orange text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-all"
                        >
                          <PenTool size={16} />
                          Podpísať
                        </button>
                      </div>
                    )}
                    
                    {doc.status === 'SIGNED' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(doc.id, doc.url)}
                          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                          <ExternalLink size={16} />
                          Náhľad
                        </button>
                        <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-2 px-4 rounded-lg text-sm font-medium border border-emerald-100">
                          <CheckCircle2 size={16} />
                          Podpísané
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Sign Confirmation Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Potvrdenie podpisu dokumentu</h3>
              <button 
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Pred podpísaním dokumentu prosím potvrďte, že ste si ho dôkladne preštudovali a rozumiete jeho obsahu.
              </p>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-brand-orange border-slate-300 rounded focus:ring-brand-orange focus:ring-2"
                />
                <span className="text-sm text-slate-700">
                  Oboznámil som sa s obsahom dokumentu a súhlasím s jeho podpísaním
                </span>
              </label>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmSign}
                disabled={!acknowledged}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  acknowledged 
                    ? 'bg-brand-orange text-white hover:bg-orange-600' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Podpísať dokument
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
