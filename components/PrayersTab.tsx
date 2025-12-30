
import React, { useState, useEffect } from 'react';
import { PrayerRequest } from '../types';
import { suggestPrayer } from '../services/geminiService';

const PrayersTab: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestedText, setSuggestedText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'active' | 'answered'>('active');

  useEffect(() => {
    const saved = localStorage.getItem('prayers');
    if (saved) setPrayers(JSON.parse(saved));
  }, []);

  const savePrayers = (updated: PrayerRequest[]) => {
    setPrayers(updated);
    localStorage.setItem('prayers', JSON.stringify(updated));
  };

  const addPrayer = () => {
    if (!newTitle.trim()) return;
    const newItem: PrayerRequest = {
      id: Date.now().toString(),
      title: newTitle,
      description: suggestedText,
      date: new Date().toLocaleDateString('pt-BR'),
      isAnswered: false,
    };
    savePrayers([newItem, ...prayers]);
    setNewTitle('');
    setSuggestedText('');
    setShowForm(false);
    setActiveFilter('active');
  };

  const handleSuggest = async () => {
    if (!newTitle.trim()) return;
    setLoadingSuggestion(true);
    try {
      const text = await suggestPrayer(newTitle);
      setSuggestedText(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const toggleAnswered = (id: string) => {
    savePrayers(prayers.map(p => p.id === id ? { ...p, isAnswered: !p.isAnswered } : p));
  };

  const deletePrayer = (id: string) => {
    if (window.confirm('Deseja realmente remover este registro?')) {
      savePrayers(prayers.filter(p => p.id !== id));
    }
  };

  const filteredPrayers = prayers.filter(p => 
    activeFilter === 'active' ? !p.isAnswered : p.isAnswered
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <h1 className="serif text-3xl text-stone-800 font-bold">Meu Diário</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-700 text-white p-3 rounded-2xl shadow-lg hover:bg-amber-800 transition-all transform active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-stone-100 rounded-2xl">
        <button 
          onClick={() => setActiveFilter('active')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeFilter === 'active' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-400'
          }`}
        >
          Pedidos Ativos
        </button>
        <button 
          onClick={() => setActiveFilter('answered')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
            activeFilter === 'answered' ? 'bg-white text-green-700 shadow-sm' : 'text-stone-400'
          }`}
        >
          Testemunhos
        </button>
      </div>

      {showForm && (activeFilter === 'active') && (
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-stone-100 space-y-6 animate-slideDown overflow-hidden">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Seu Pedido</label>
            <input
              autoFocus
              type="text"
              placeholder="O que está no seu coração?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xl border-none focus:ring-0 placeholder-stone-300 serif bg-stone-50 p-4 rounded-2xl"
            />
          </div>

          {newTitle && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-1">Oração Sugerida</span>
                <button 
                  onClick={handleSuggest}
                  disabled={loadingSuggestion}
                  className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full flex items-center space-x-1 hover:bg-amber-100 disabled:opacity-50"
                >
                  {loadingSuggestion ? <div className="animate-spin h-3 w-3 border-b-2 border-amber-700 rounded-full"></div> : <span>✨ Inspirar</span>}
                </button>
              </div>
              <textarea
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                placeholder="Escreva sua oração aqui ou use a inspiração da IA..."
                className="w-full h-32 bg-stone-50 border-none focus:ring-0 rounded-2xl p-4 text-stone-600 italic leading-relaxed text-sm resize-none"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-5 py-3 text-stone-400 font-bold text-sm">Cancelar</button>
            <button onClick={addPrayer} className="px-8 py-3 bg-amber-700 text-white rounded-2xl font-bold shadow-md hover:bg-amber-800 transition-colors">Guardar Oração</button>
          </div>
        </div>
      )}

      {filteredPrayers.length === 0 ? (
        <div className="text-center py-20 px-8 space-y-4">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
            {activeFilter === 'active' ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            )}
          </div>
          <h3 className="serif text-xl text-stone-400">
            {activeFilter === 'active' ? 'Nenhum pedido ativo' : 'Sem testemunhos ainda'}
          </h3>
          <p className="text-stone-300 text-sm leading-relaxed italic">
            {activeFilter === 'active' 
              ? 'Abra o seu coração e registre sua primeira oração.' 
              : 'As respostas de Deus virão no tempo certo. Continue crendo!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrayers.map((prayer) => (
            <div 
              key={prayer.id} 
              className={`bg-white p-6 rounded-[28px] shadow-sm border transition-all duration-300 space-y-4 group overflow-hidden relative ${
                prayer.isAnswered ? 'border-green-100 bg-green-50/20' : 'border-stone-50 hover:shadow-md'
              }`}
            >
              {prayer.isAnswered && (
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <svg className="w-20 h-20 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => toggleAnswered(prayer.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      prayer.isAnswered ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' : 'border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {prayer.isAnswered ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-stone-200 group-hover:bg-amber-400"></div>
                    )}
                  </button>
                  <div>
                    <h3 className={`font-bold text-stone-800 text-lg leading-tight ${prayer.isAnswered ? 'text-stone-700' : ''}`}>
                      {prayer.title}
                    </h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1 font-bold">{prayer.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deletePrayer(prayer.id)}
                  className="text-stone-200 hover:text-red-400 transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
                </button>
              </div>
              
              {prayer.description && (
                <div className={`pl-4 py-2 border-l-2 transition-colors ${prayer.isAnswered ? 'border-green-200' : 'border-amber-100'}`}>
                  <p className={`text-sm leading-relaxed ${prayer.isAnswered ? 'text-stone-600 italic' : 'text-stone-500'}`}>
                    {prayer.description}
                  </p>
                </div>
              )}

              {prayer.isAnswered && (
                <div className="flex items-center space-x-2 text-green-600 text-[10px] font-bold uppercase tracking-[0.2em] bg-green-100/50 w-fit px-4 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span>Glória a Deus</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="h-24"></div>
    </div>
  );
};

export default PrayersTab;
