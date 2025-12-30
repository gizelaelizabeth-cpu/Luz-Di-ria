
import React, { useState, useEffect } from 'react';

const SettingsTab: React.FC = () => {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  useEffect(() => {
    const saved = localStorage.getItem('notifications_enabled');
    if (saved !== null) {
      setNotifEnabled(saved === 'true');
    }
  }, []);

  const toggleNotif = () => {
    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    localStorage.setItem('notifications_enabled', String(newVal));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Luz Diária',
          text: 'Conheça o Luz Diária, meu app de devocionais e oração!',
          url: currentUrl,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const menuItems = [
    { label: 'Preferências de Áudio', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z', color: 'bg-purple-50 text-purple-600', action: () => {} },
    { label: 'Versão da Bíblia (NVI)', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-amber-50 text-amber-600', action: () => {} },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <h1 className="serif text-3xl text-stone-800 font-bold">Configurações</h1>

      {/* Card de Compartilhamento via QR Code */}
      <div className="bg-gradient-to-br from-white to-stone-50 rounded-[32px] p-8 shadow-xl border border-stone-100 text-center space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.3em]">Compartilhar Luz</p>
          <h2 className="serif text-2xl font-bold text-stone-800">Convidar Amigos</h2>
        </div>
        
        <div className="bg-white p-4 rounded-3xl inline-block shadow-inner border border-stone-100 mx-auto">
          {/* Usando API pública de QR Code para gerar baseado na URL atual */}
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`} 
            alt="QR Code do App"
            className="w-32 h-32"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs text-stone-500 max-w-[200px] mx-auto leading-relaxed">
            Mostre este código para alguém escanear ou copie o link abaixo.
          </p>
          
          <div className="flex flex-col space-y-2">
            <button 
              onClick={handleCopyLink}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  <span>Copiar Link do App</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleShareApp}
              className="w-full py-4 bg-amber-700 text-white rounded-2xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-transform flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              <span>Enviar para Alguém</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden">
        {/* Notificações Toggle */}
        <div className="w-full flex items-center p-6 text-left border-b border-stone-50">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-blue-50 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <div className="flex-1">
            <span className="font-bold text-stone-800 block text-lg">Alertas Diários</span>
            <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Frases e Inspirações</span>
          </div>
          <button 
            onClick={toggleNotif}
            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${notifEnabled ? 'bg-amber-600 shadow-inner' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${notifEnabled ? 'left-8' : 'left-1'}`}></div>
          </button>
        </div>

        {menuItems.map((item, idx) => (
          <button 
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center p-6 text-left hover:bg-stone-50 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-stone-50' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${item.color}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
            </div>
            <span className="flex-1 font-bold text-stone-800 text-lg">{item.label}</span>
            <svg className="w-5 h-5 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        ))}
      </div>

      <div className="text-center space-y-3 py-10 relative">
        <div className="w-16 h-px bg-stone-200 mx-auto mb-6"></div>
        <p className="text-stone-300 text-[10px] uppercase tracking-[0.5em] font-black">Aplicativo Oficial</p>
        <div className="flex flex-col items-center">
          <p className="text-stone-400 text-xs font-medium italic opacity-60">Criado com carinho por</p>
          <p className="serif text-stone-900 font-bold text-2xl mt-1 tracking-tight">
            Gizela Imperial
          </p>
        </div>
        <p className="text-stone-300 text-[10px] uppercase tracking-[0.3em] font-bold mt-4">© 2024 • Luz Diária v1.2</p>
      </div>
      
      <div className="h-20"></div>
    </div>
  );
};

export default SettingsTab;
