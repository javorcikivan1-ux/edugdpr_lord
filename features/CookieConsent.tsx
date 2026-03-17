import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }

    // Listen for storage changes to sync consent across all instances
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        if (e.newValue === 'true') {
          setIsVisible(false);
        } else if (e.newValue === null) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#002b4e] text-white p-4 shadow-2xl z-50 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Cookie size={24} className="text-brand-orange" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-brand-orange mb-1">Táto webová stránka nepoužíva Cookies! 🍪</p>
              <p className="text-white/80 text-xs">
                Žiadne sledovanie, žiadne analytiky, žiadne personalizované reklamy. Vaše súkromie je našou prioritou. 
                Viac informácií nájdete <button onClick={openModal} className="text-brand-orange underline hover:text-orange-400 transition-colors font-semibold">TU</button>.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleAccept}
              className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-all transform hover:-translate-y-0.5 shadow-lg"
            >
              Rozumiem, pokračovať
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-orange/20 rounded-full flex items-center justify-center">
                <Cookie size={32} className="text-brand-orange" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#002b4e]">O cookies na našej stránke</h3>
                <p className="text-slate-600 text-sm">Vaše súkromie je chránené</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700">
              <p>
                Naša webová stránka <strong>nepoužíva žiadne cookies</strong>. To znamená:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Žiadne sledovanie</strong> vašich aktivít</li>
                <li><strong>Žiadne analytické nástroje</strong> tretích strán</li>
                <li><strong>Žiadne personalizované reklamy</strong></li>
                <li><strong>Žiadne ukladanie údajov</strong> o vašom správaní</li>
              </ul>
              <p>
                Vaše súkromie je pre nás absolútnou prioritou, preto neukladáme do zariadenia návštevníkov žiadne Cookies ani podobné technológie.
              </p>
            </div>
            
            <button
              onClick={closeModal}
              className="w-full mt-6 bg-brand-orange text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-600 transition-all"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
