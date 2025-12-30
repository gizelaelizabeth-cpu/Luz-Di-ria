
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import Navigation from './components/Navigation';
import HomeTab from './components/HomeTab';
import PrayersTab from './components/PrayersTab';
import PlanTab from './components/PlanTab';
import SettingsTab from './components/SettingsTab';
import { GoogleGenAI } from "@google/genai";
import { generateNotificationPhrase } from './services/geminiService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [promiseModal, setPromiseModal] = useState<{ open: boolean; verse: string; ref: string }>({ open: false, verse: '', ref: '' });
  const [loadingPromise, setLoadingPromise] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; text: string }>({ show: false, text: '' });

  useEffect(() => {
    // Disparar notificação aleatória após alguns segundos de uso
    const delay = 5000 + Math.random() * 5000;
    const timer = setTimeout(async () => {
      const isEnabled = localStorage.getItem('notifications_enabled') !== 'false';
      if (isEnabled) {
        try {
          const phrase = await generateNotificationPhrase();
          setNotification({ show: true, text: phrase });
          
          setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
          }, 8000);
        } catch (e) {
          console.error(e);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'prayers': return <PrayersTab />;
      case 'plan': return <PlanTab />;
      case 'settings': return <SettingsTab />;
      default: return <HomeTab />;
    }
  };

  const getNewPromise = async () => {
    if (loadingPromise) return;
    setLoadingPromise(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Forneça um versículo de promessa bíblica poderoso e uma breve frase de encorajamento em português.',
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              verse: { type: 'string' },
              ref: { type: 'string' }
            },
            required: ['verse', 'ref']
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      setPromiseModal({ open: true, verse: data.verse, ref: data.ref });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPromise(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fcfaf7] shadow-2xl relative flex flex-col font-sans text-stone-900 overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      
      {/* Dynamic Notification Toast */}
      <div 
        className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          notification.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-32 opacity-0 scale-95'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM16.464 16.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" /></svg>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">Luz Diária • Agora</span>
              <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="text-stone-300 p-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-[13px] font-medium text-stone-700 leading-tight">
              {notification.text}
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-[#fcfaf7]/80 backdrop-blur-xl z-40 flex justify-between items-center">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-11 h-11 bg-gradient-to-br from-amber-600 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-900/10 group-hover:rotate-12 transition-all duration-500">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" /></svg>
          </div>
          <div>
            <span className="serif text-2xl font-bold text-stone-800 block leading-none">Luz Diária</span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-600/70 block mt-1">Fé & Inspiração</span>
          </div>
        </div>
        <button className="relative p-2.5 text-stone-400 hover:text-amber-600 transition-all bg-white rounded-full shadow-sm border border-stone-100 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#fcfaf7] animate-pulse"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-2 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={getNewPromise}
        disabled={loadingPromise}
        className="fixed bottom-24 right-6 w-16 h-16 bg-stone-900 text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center z-50 hover:bg-stone-800 active:scale-90 transition-all border-4 border-white group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {loadingPromise ? (
          <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full"></div>
        ) : (
          <svg className="w-7 h-7 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
        )}
      </button>

      {/* Promise Modal */}
      {promiseModal.open && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gradient-to-br from-amber-50 to-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative animate-slideDown text-center space-y-6">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-[0.4em]">Promessa Divina</p>
            <h2 className="serif text-3xl font-bold text-stone-800 leading-snug">"{promiseModal.verse}"</h2>
            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">— {promiseModal.ref}</p>
            <button 
              onClick={() => setPromiseModal({ ...promiseModal, open: false })}
              className="w-full bg-stone-800 text-white py-5 rounded-[24px] font-bold shadow-xl active:scale-95 transition-transform"
            >
              Recebo esta Promessa
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Design System Extras */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
        
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-slideDown { animation: slideDown 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-slowSpin { animation: slowSpin 20s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        
        main::-webkit-scrollbar { display: none; }
        main { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default App;
