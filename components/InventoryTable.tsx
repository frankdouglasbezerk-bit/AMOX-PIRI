
import React, { useState } from 'react';
import { StockItem, User } from '../types';
import { Search, Trash2, Hash, Package, Layers, Edit3, Save, Filter, ScanLine } from 'lucide-react';

interface InventoryTableProps {
  inventory: StockItem[];
  setInventory: React.Dispatch<React.SetStateAction<StockItem[]>>;
  user: User;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, setInventory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const filtered = inventory.filter(i => i.material.toLowerCase().includes(searchTerm.toLowerCase()) || i.sap.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id: string, name: string) => {
    if (user.role !== 'admin') return alert("ACESSO RESTRITO");
    const pass = prompt("SISTEMA DE SEGURANÇA:\nDigite a SENHA DO ADM (2000) para confirmar deleção:");
    if (pass === '2000') {
      if (confirm(`Confirmar exclusão permanente de: ${name}?`)) setInventory(prev => prev.filter(i => i.id !== id));
    } else if (pass !== null) {
      alert("SENHA INCORRETA");
    }
  };

  const handleEdit = (item: StockItem) => {
    if (user.role !== 'admin') return;
    setEditingId(item.id);
    setEditValue(item.quantity);
  };

  const saveEdit = (id: string) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: editValue, lastUpdated: new Date().toLocaleString() } : i));
    setEditingId(null);
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h1 className="text-5xl font-black text-white uppercase tracking-tighter">DATA INVENTORY</h1>
           <p className="mono text-[10px] text-amber-500 uppercase tracking-[0.5em] mt-3">Registros Ativos em Tempo Real</p>
        </div>
        <div className="relative group max-w-lg w-full">
          <div className="absolute inset-0 bg-amber-600/5 blur-xl group-focus-within:bg-amber-600/10 transition-all"></div>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search Database..." 
            className="relative w-full pl-16 pr-8 py-5 glass border border-white/10 rounded-[2rem] text-white outline-none focus:border-amber-600/40 mono text-xs font-bold transition-all" 
          />
        </div>
      </div>

      <div className="glass rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black/40 border-b border-white/10">
            <tr>
              <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono">SAP_ID</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono">Material_Label</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono text-center">Current_Balance</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mono text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-amber-500/5 transition-all group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                    <ScanLine size={14} className="text-amber-500/40 group-hover:text-amber-500" />
                    <span className="mono text-xs font-black text-amber-500">#{item.sap}</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase tracking-tight leading-tight">{item.material}</span>
                    <span className="mono text-[8px] text-slate-600 uppercase mt-1">Category: {item.category || 'Standard'}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  {editingId === item.id ? (
                    <div className="flex items-center justify-center gap-3 animate-slideIn">
                      <input type="number" value={editValue} onChange={e => setEditValue(Number(e.target.value))} className="w-24 bg-black/60 border border-amber-600/50 rounded-xl p-3 text-center text-white mono font-bold outline-none shadow-inner" />
                      <button onClick={() => saveEdit(item.id)} className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-900/40"><Save size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                       <span className={`px-6 py-2 rounded-xl text-xs font-black mono border transition-all ${item.quantity < 10 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-white/5 text-white border-white/10'}`}>
                         {item.quantity} {item.und}
                       </span>
                       {item.quantity < 10 && <span className="text-[8px] font-black text-red-500 uppercase mt-2 animate-pulse tracking-widest">Low Level</span>}
                    </div>
                  )}
                </td>
                <td className="px-10 py-6 text-right">
                  {user.role === 'admin' && (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(item)} className="p-3 glass hover:bg-white/10 text-slate-500 hover:text-white rounded-xl transition-all border border-white/5"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(item.id, item.material)} className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/10"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-40 text-center">
            <Package size={80} className="mx-auto text-white/5 mb-8" />
            <p className="mono text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">No Data Matching Query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
