import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#002b4e] text-white p-4 shadow-2xl z-50 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Cookie size={24} className="text-brand-orange" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-brand-orange mb-1">Táto webstránka je bez Cookies! 🍪</p>
            <p className="text-white/80 text-xs">
              Na našej stránke nespracúvame žiadne cookies. Žiadne sledovanie, žiadne analytiky, 
              žiadne personalizované reklamy. Vaše súkromie je našou prioritou.
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
  );
};

export default CookieConsent;
