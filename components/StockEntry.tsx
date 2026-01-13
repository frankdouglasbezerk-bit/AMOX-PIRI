
import React, { useState } from 'react';
import { Package, HelpCircle, Save, CheckCircle2, FileSpreadsheet, HardHat, Construction, Wrench } from 'lucide-react';
import { StockItem, User, MovementRecord } from '../types';

interface StockEntryProps {
  onSuccess: () => void;
  setInventory: React.Dispatch<React.SetStateAction<StockItem[]>>;
  inventory: StockItem[];
  currentUser: User;
  setHistory: React.Dispatch<React.SetStateAction<MovementRecord[]>>;
}

const StockEntry: React.FC<StockEntryProps> = ({ onSuccess, setInventory, inventory, currentUser, setHistory }) => {
  const [bulkText, setBulkText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'EPI' | 'Material de Serviço' | 'Máquinas' | 'Outros'>('Outros');

  const handleProcess = () => {
    if (!bulkText.trim()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const lines = bulkText.split('\n').filter(line => line.trim() !== '');
      const newInventory = [...inventory];
      const newHistoryRecords: MovementRecord[] = [];
      
      lines.forEach(line => {
        const parts = line.split(/[;\t,]/).map(p => p.trim());
        
        let sap = '';
        let material = '';
        let quantity = 0;
        let und = 'UN';

        if (parts.length >= 4) {
          [sap, material, quantity, und] = [parts[0], parts[1], parseInt(parts[2]) || 0, parts[3]];
        } else if (parts.length === 3) {
          [sap, material, quantity] = [parts[0], parts[1], parseInt(parts[2]) || 0];
        } else {
          const match = line.match(/(.*?)[-:\s]+(\d+)$/);
          if (match) {
            material = match[1].trim();
            quantity = parseInt(match[2], 10);
            sap = 'S/N';
          } else {
            material = line.trim();
            sap = 'S/N';
            quantity = 1;
          }
        }

        if (material) {
          const existingIdx = newInventory.findIndex(item => 
            item.sap === sap && sap !== 'S/N' || 
            item.material.toUpperCase() === material.toUpperCase()
          );

          if (existingIdx > -1) {
            newInventory[existingIdx].quantity += quantity;
            newInventory[existingIdx].lastUpdated = new Date().toLocaleString('pt-BR');
          } else {
            newInventory.push({
              id: Math.random().toString(36).substr(2, 9),
              sap: sap || 'S/N',
              material: material.toUpperCase(),
              quantity: quantity,
              und: und.toUpperCase(),
              category: selectedCategory,
              lastUpdated: new Date().toLocaleString('pt-BR')
            });
          }

          // Track Movement
          newHistoryRecords.push({
            id: Math.random().toString(36).substr(2, 9),
            userId: currentUser.username,
            type: 'Entrada',
            material: material.toUpperCase(),
            sap: sap || 'S/N',
            quantity: quantity,
            date: new Date().toLocaleString('pt-BR')
          });
        }
      });

      setInventory(newInventory);
      setHistory(prev => [...newHistoryRecords, ...prev]);
      setIsProcessing(false);
      setShowSuccess(true);
      setBulkText('');

      setTimeout(() => setShowSuccess(false), 2000);
      setTimeout(() => onSuccess(), 2200);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
          <FileSpreadsheet size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Abastecimento Lote</h1>
          <p className="text-slate-500 font-medium">Importação rápida de materiais via Texto/Planilha.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <HelpCircle size={20} className="text-slate-400" />
                <h2 className="font-black text-sm uppercase tracking-widest">Definir Categoria</h2>
              </div>
              <p className="text-xs text-slate-500 italic">Todos os itens importados agora pertencerão à categoria selecionada.</p>
              <div className="grid grid-cols-2 gap-2">
                <CategoryBtn label="EPI" icon={<HardHat size={16} />} active={selectedCategory === 'EPI'} onClick={() => setSelectedCategory('EPI')} />
                <CategoryBtn label="M. Serviço" icon={<Construction size={16} />} active={selectedCategory === 'Material de Serviço'} onClick={() => setSelectedCategory('Material de Serviço')} />
                <CategoryBtn label="Máquinas" icon={<Wrench size={16} />} active={selectedCategory === 'Máquinas'} onClick={() => setSelectedCategory('Máquinas')} />
                <CategoryBtn label="Outros" icon={<Package size={16} />} active={selectedCategory === 'Outros'} onClick={() => setSelectedCategory('Outros')} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <FileSpreadsheet size={20} className="text-slate-400" />
                <h2 className="font-black text-sm uppercase tracking-widest">Dica de Formato</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-mono text-[10px] text-slate-500">
                  SAP;DESCRIÇÃO;QUANTIDADE;UND
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Itens repetidos terão seu saldo atualizado automaticamente.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Editor de Importação</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Ex: 102934;CIMENTO CP-II;50;SACO"
            className="flex-1 min-h-[300px] p-8 focus:outline-none resize-none text-slate-700 font-mono text-sm leading-relaxed"
          />
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 italic">
              {bulkText.split('\n').filter(l => l.trim()).length} Linhas
            </span>
            <button
              onClick={handleProcess}
              disabled={!bulkText.trim() || isProcessing}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                isProcessing || !bulkText.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-black text-white shadow-slate-200'
              }`}
            >
              {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              IMPORTAR AGORA
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xl z-[150] animate-fadeIn">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6 max-w-md w-full mx-4 transform scale-110">
            <div className="bg-emerald-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Processado!</h2>
              <p className="text-slate-500 font-medium mt-2">Os itens foram integrados ao estoque na categoria <span className="text-emerald-600 font-black">{selectedCategory}</span>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryBtn = ({ label, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
      active 
        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default StockEntry;
