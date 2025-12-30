
import React, { useState, useEffect } from 'react';
import { ReadingPlanItem } from '../types';
import { getBiblePassage } from '../services/geminiService';

const INITIAL_PLAN: ReadingPlanItem[] = [
  { id: 1, book: 'Gênesis', chapters: '1-3', completed: false },
  { id: 2, book: 'João', chapters: '1', completed: false },
  { id: 3, book: 'Salmos', chapters: '1-5', completed: false },
  { id: 4, book: 'Gênesis', chapters: '4-6', completed: false },
  { id: 5, book: 'João', chapters: '2', completed: false },
  { id: 6, book: 'Salmos', chapters: '6-10', completed: false },
  { id: 7, book: 'Mateus', chapters: '1-2', completed: false },
];

const PlanTab: React.FC = () => {
  const [plan, setPlan] = useState<ReadingPlanItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReadingPlanItem | null>(null);
  const [passage, setPassage] = useState<{ text: string, context: string } | null>(null);
  const [loadingPassage, setLoadingPassage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reading_plan');
    if (saved) {
      setPlan(JSON.parse(saved));
    } else {
      setPlan(INITIAL_PLAN);
    }
  }, []);

  const toggleItem = (id: number) => {
    const updated = plan.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setPlan(updated);
    localStorage.setItem('reading_plan', JSON.stringify(updated));
  };

  const openPassage = async (item: ReadingPlanItem) => {
    setSelectedItem(item);
    setLoadingPassage(true);
    try {
      const data = await getBiblePassage(item.book, item.chapters);
      setPassage(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPassage(false);
    }
  };

  const progress = Math.round((plan.filter(i => i.completed).length / plan.length) * 100) || 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="space-y-2">
        <h1 className="serif text-3xl text-stone-800 font-bold">Plano de Leitura</h1>
        <p className="text-stone-500 text-sm">Alimente sua alma com a Palavra.</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-6 rounded-3xl shadow-sm border border-amber-100/50 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Meta Semanal</span>
          <span className="text-2xl font-bold text-amber-700 serif">{progress}%</span>
        </div>
        <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-rose-400 h-full transition-all duration-1000 ease-out shadow-inner" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        {plan.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => openPassage(item)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all text-left ${
                item.completed 
                  ? 'bg-stone-50 border border-stone-100 opacity-60' 
                  : 'bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-200'
              }`}
            >
              <div 
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all transform active:scale-90 ${
                  item.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.completed ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="text-sm font-bold">{item.id}</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${item.completed ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                  {item.book}
                </h4>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-tighter">Cap. {item.chapters}</p>
              </div>
              <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Passage Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-slideDown">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="serif text-2xl text-stone-800 font-bold">{selectedItem.book} {selectedItem.chapters}</h2>
                <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mt-1">Leitura de Hoje</p>
              </div>
              <button onClick={() => { setSelectedItem(null); setPassage(null); }} className="p-2 bg-stone-100 rounded-full text-stone-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {loadingPassage ? (
              <div className="py-20 flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <p className="text-stone-400 italic">Buscando as Escrituras...</p>
              </div>
            ) : passage && (
              <div className="space-y-6">
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 italic text-stone-700 leading-relaxed font-serif text-lg">
                  "{passage.text}"
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400">Reflexão Profunda</h3>
                  <div className="prose prose-stone text-stone-600 leading-relaxed">
                    {passage.context}
                  </div>
                </div>
                <button 
                  onClick={() => { toggleItem(selectedItem.id); setSelectedItem(null); setPassage(null); }}
                  className="w-full bg-amber-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-900/20 active:scale-95 transition-transform"
                >
                  Concluir Leitura
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="h-20"></div>
    </div>
  );
};

export default PlanTab;
