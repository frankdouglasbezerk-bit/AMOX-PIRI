
import React, { useState } from 'react';
import { Truck, ArrowUpRight, ArrowDownLeft, Search, Settings, CheckCircle2, Package, UserPlus, Trash2, Plus, Minus, ListPlus, Filter, HardHat, Construction, Wrench } from 'lucide-react';
import { StockItem, Machine, User, MovementRecord } from '../types';

interface MovementViewProps {
  type: 'material' | 'machine';
  items: any[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: User;
  setHistory: React.Dispatch<React.SetStateAction<MovementRecord[]>>;
}

interface BasketItem {
  id: string;
  material: string;
  sap: string;
  quantity: number;
}

const MovementView: React.FC<MovementViewProps> = ({ type, items, setItems, currentUser, setHistory }) => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [recipient, setRecipient] = useState('');
  const [operation, setOperation] = useState<'entry' | 'exit'>('entry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.material || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.sap || item.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TODOS' || (item.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const addToBasket = (item: any) => {
    const exists = basket.find(b => b.id === item.id);
    if (exists) return;

    setBasket([...basket, {
      id: item.id,
      material: item.material || item.name,
      sap: item.sap || item.code,
      quantity: 1
    }]);
  };

  const removeFromBasket = (id: string) => {
    setBasket(basket.filter(b => b.id !== id));
  };

  const updateBasketQuantity = (id: string, delta: number) => {
    setBasket(basket.map(b => 
      b.id === id ? { ...b, quantity: Math.max(1, b.quantity + delta) } : b
    ));
  };

  const handleApply = () => {
    if (basket.length === 0) return;
    if (operation === 'exit' && !recipient.trim()) {
      alert('Por favor, informe quem está retirando os materiais.');
      return;
    }

    const batchId = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Processar todos os itens do cesto
    setItems(prev => prev.map(item => {
      const basketItem = basket.find(b => b.id === item.id);
      if (basketItem) {
        if (type === 'material') {
          const newQty = operation === 'entry' 
            ? item.quantity + basketItem.quantity 
            : Math.max(0, item.quantity - basketItem.quantity);
          return { ...item, quantity: newQty, lastUpdated: new Date().toLocaleString('pt-BR') };
        } else {
          const newStatus = operation === 'entry' ? 'Disponível' : 'Em Uso';
          return { ...item, status: newStatus, lastUpdated: new Date().toLocaleString('pt-BR') };
        }
      }
      return item;
    }));

    // Registrar no Histórico para cada item com o mesmo batchId
    const newRecords: MovementRecord[] = basket.map(b => ({
      id: Math.random().toString(36).substr(2, 9),
      batchId: batchId,
      userId: currentUser.username,
      type: operation === 'entry' ? 'Entrada' : 'Saída',
      material: b.material,
      sap: b.sap,
      quantity: b.quantity,
      date: new Date().toLocaleString('pt-BR'),
      recipient: operation === 'exit' ? recipient : undefined
    }));

    setHistory(prev => [...newRecords, ...prev]);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setBasket([]);
    setRecipient('');
  };

  return (
    <div className="max-w-full mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${type === 'material' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
          {type === 'material' ? <Truck size={28} /> : <Settings size={28} />}
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Movimentação em Lote
          </h1>
          <p className="text-slate-500 font-medium">Selecione múltiplos itens para realizar a {operation === 'entry' ? 'entrada' : 'saída'} simultânea.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Selector Section */}
        <div className="lg:col-span-7 bg-[#161a21] p-8 rounded-[2rem] border border-white/5 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Search size={12} /> 1. Clique nos materiais
              </label>
              
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {['TODOS', 'EPI', 'Material de Serviço', 'Máquinas'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                      selectedCategory === cat ? 'bg-amber-600 text-white border-amber-500' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por nome ou SAP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-amber-500 outline-none text-sm font-bold text-white transition-all"
              />
            </div>
            
            <div className="max-h-[500px] overflow-y-auto border border-white/5 rounded-2xl mt-4 divide-y divide-white/5 custom-scrollbar bg-black/10">
              {filteredItems.map(item => {
                const isInBasket = basket.some(b => b.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToBasket(item)}
                    disabled={isInBasket}
                    className={`w-full text-left p-6 transition-all hover:bg-white/5 flex justify-between items-center gap-6 ${isInBasket ? 'opacity-40 grayscale cursor-not-allowed' : 'text-slate-300'}`}
                  >
                    <div className="flex items-center gap-5 min-w-0 flex-1">
                      <div className="shrink-0 p-3 rounded-xl bg-white/5">
                        {item.category === 'EPI' ? <HardHat size={20} /> : item.category === 'Máquinas' ? <Wrench size={20} /> : <Package size={20} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black uppercase tracking-tight leading-normal break-words">
                          {item.material || item.name}
                        </span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] font-mono text-slate-500">SAP: {item.sap || item.code}</span>
                          <span className="text-[8px] font-black uppercase text-amber-500/50">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end min-w-[80px]">
                      <span className="text-sm font-black px-4 py-2 rounded-xl bg-white/5">
                        {item.quantity ?? item.status}
                      </span>
                      <span className="text-[9px] font-black uppercase opacity-40 mt-1">{item.und || 'UN'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action / Basket Section */}
        <div className="lg:col-span-5 bg-[#161a21] p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6 relative overflow-hidden flex flex-col max-h-[750px]">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Configuração do Lote</label>
            <div className="flex gap-3">
              <button
                onClick={() => setOperation('entry')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${operation === 'entry' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-white/5 text-slate-600'}`}
              >
                <ArrowDownLeft size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Entrada</span>
              </button>
              <button
                onClick={() => setOperation('exit')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${operation === 'exit' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-white/5 text-slate-600'}`}
              >
                <ArrowUpRight size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Saída</span>
              </button>
            </div>
          </div>

          {operation === 'exit' && (
            <div className="space-y-4 animate-slideDown">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <UserPlus size={12} /> Destinatário
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nome de quem está retirando..."
                className="w-full p-5 bg-black/40 border border-white/10 rounded-2xl focus:border-amber-500 outline-none font-bold text-white text-sm"
              />
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ListPlus size={12} /> Itens Selecionados ({basket.length})
            </label>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {basket.map(item => (
                <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-white uppercase truncate">{item.material}</p>
                    <p className="text-[8px] font-mono text-slate-500">SAP: {item.sap}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button onClick={() => updateBasketQuantity(item.id, -1)} className="p-1 hover:text-white transition-colors text-slate-600">
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-black text-white min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateBasketQuantity(item.id, 1)} className="p-1 hover:text-white transition-colors text-slate-600">
                      <Plus size={14} />
                    </button>
                  </div>

                  <button onClick={() => removeFromBasket(item.id)} className="text-slate-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {basket.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-20 py-20">
                  <Package size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Cesto Vazio</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <button
              onClick={handleApply}
              disabled={basket.length === 0}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl text-xs ${
                basket.length === 0 
                ? 'bg-white/5 text-slate-700 cursor-not-allowed border border-white/5' 
                : operation === 'entry' ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-red-600 text-white shadow-red-900/20'
              }`}
            >
              {basket.length > 1 ? `CONFIRMAR ${basket.length} ITENS` : 'CONFIRMAR MOVIMENTAÇÃO'}
            </button>
          </div>

          {showSuccess && (
            <div className="absolute inset-0 bg-[#161a21]/95 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn z-20">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40">
                <CheckCircle2 size={32} className="text-white animate-pulse" />
              </div>
              <p className="font-black text-white uppercase tracking-widest text-[10px]">LOTE PROCESSADO!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementView;
