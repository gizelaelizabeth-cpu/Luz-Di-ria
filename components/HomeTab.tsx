
import React, { useEffect, useState, useRef } from 'react';
import { Devotional, QuickInspiration, WordStudy } from '../types';
import { 
  generateDailyDevotional, 
  generateQuickInspiration, 
  generateWordStudy,
  generateAudioFromText, 
  decodePCM, 
  decodeAudioData 
} from '../services/geminiService';

const HomeTab: React.FC = () => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [inspiration, setInspiration] = useState<QuickInspiration | null>(null);
  const [wordStudy, setWordStudy] = useState<WordStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showWordStudy, setShowWordStudy] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devData, inspData, wordData] = await Promise.all([
          generateDailyDevotional(),
          generateQuickInspiration(),
          generateWordStudy()
        ]);
        setDevotional(devData);
        setInspiration(inspData);
        setWordStudy(wordData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleShare = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    }
  };

  const handlePlayAudio = async () => {
    if (playing) {
      sourceRef.current?.stop();
      setPlaying(false);
      return;
    }

    if (!devotional) return;

    try {
      setPlaying(true);
      const base64 = await generateAudioFromText(`${devotional.title}. ${devotional.verse}. ${devotional.content}`);
      if (!base64) {
        setPlaying(false);
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const pcmData = decodePCM(base64);
      const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlaying(false);
      source.start();
      sourceRef.current = source;
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
      setPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-200 blur-2xl opacity-20 animate-pulse rounded-full"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-amber-700 relative z-10"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-stone-800 font-serif text-xl italic">"Buscai primeiro o Reino..."</p>
          <p className="text-stone-400 text-sm animate-pulse uppercase tracking-[0.3em]">Preparando sua porção diária</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header & Dynamic Greeting */}
      <div className="space-y-1">
        <p className="text-amber-600 text-[10px] uppercase tracking-[0.4em] font-bold">
          {getGreeting()}, filho(a) de Deus
        </p>
        <h1 className="serif text-3xl text-stone-800 font-bold tracking-tight">O que temos para hoje?</h1>
      </div>

      {/* Quick Inspirations Carousel */}
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {/* Verse Card */}
        <div 
          onClick={() => handleShare(`"${inspiration?.verse}" - ${inspiration?.ref}`, "Versículo do Dia")}
          className="min-w-[280px] bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-900/10 flex flex-col justify-between h-48 cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Versículo do Momento</div>
            <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          </div>
          <p className="serif text-lg leading-snug italic font-medium">"{inspiration?.verse}"</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100">{inspiration?.ref}</p>
        </div>

        {/* Phrase Card */}
        <div className="min-w-[280px] bg-white border border-stone-100 rounded-3xl p-6 text-stone-800 shadow-sm flex flex-col justify-between h-48">
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Afirmação de Fé</div>
          <p className="serif text-lg leading-snug italic text-stone-700 font-medium">"{inspiration?.phrase}"</p>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center">
              <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            </div>
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Medite nisto</span>
          </div>
        </div>

        {/* Word Study Quick Link */}
        <button 
          onClick={() => setShowWordStudy(true)}
          className="min-w-[180px] bg-stone-800 rounded-3xl p-6 text-white flex flex-col items-center justify-center space-y-3 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Estudo da Palavra</p>
            <p className="serif text-xl font-bold">{wordStudy?.word}</p>
          </div>
        </button>
      </div>

      {/* Main Devotional Card */}
      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden group">
        {playing && (
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-amber-100 via-rose-50 to-amber-100 animate-slowSpin rounded-full blur-3xl scale-150"></div>
          </div>
        )}
        
        <div className="relative space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Leitura Principal</p>
              <h2 className="serif text-3xl text-stone-800 font-bold leading-[1.1]">
                {devotional?.title}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleShare(`${devotional?.title}\n\n${devotional?.content}`, "Devocional")}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <button 
                onClick={handlePlayAudio}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                  playing ? 'bg-amber-600 text-white shadow-amber-200' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {playing ? (
                  <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="pl-6 space-y-2 border-l-2 border-amber-200">
              <p className="text-xl serif italic text-stone-700 leading-snug">
                {devotional?.verse}
              </p>
              <p className="text-[10px] font-bold text-amber-700 tracking-[0.2em] uppercase">
                {devotional?.reference}
              </p>
            </div>
          </div>

          <div className="prose prose-stone text-stone-600 leading-relaxed text-[17px]">
            {devotional?.content}
          </div>
        </div>
      </div>

      {/* Daily Prayer */}
      <div className="bg-amber-700 p-8 rounded-[32px] text-white shadow-xl shadow-amber-900/20 relative overflow-hidden">
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
        </div>
        <h3 className="font-bold uppercase text-[10px] tracking-[0.3em] opacity-60 mb-4">Oração de Hoje</h3>
        <p className="serif text-xl leading-relaxed italic opacity-95">"{devotional?.prayer}"</p>
      </div>

      {/* Word Study Modal */}
      {showWordStudy && wordStudy && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-slideDown max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowWordStudy(false)}
              className="absolute top-6 right-6 p-2 bg-stone-50 rounded-full text-stone-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center space-y-4 pt-4">
              <div className="inline-block px-4 py-1 bg-amber-50 rounded-full text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                Estudo Exegético
              </div>
              <h2 className="serif text-4xl font-bold text-stone-800">{wordStudy.word}</h2>
              <p className="text-xl italic text-amber-600 font-serif">"{wordStudy.original}"</p>
              
              <div className="bg-stone-50 p-6 rounded-3xl text-left space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Significado</h4>
                  <p className="text-stone-700 leading-relaxed text-sm">{wordStudy.meaning}</p>
                </div>
                <div className="border-t border-stone-200 pt-4">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Aplicação Prática</h4>
                  <p className="text-stone-700 leading-relaxed italic text-sm">{wordStudy.application}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowWordStudy(false)}
              className="w-full mt-8 bg-stone-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-stone-900/20 active:scale-95 transition-transform"
            >
              Concluir Estudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
