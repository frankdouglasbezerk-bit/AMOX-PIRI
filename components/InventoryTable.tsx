
import React, { useState } from 'react';
import { StockItem, User } from '../types';
import { Search, Trash2, Hash, Package, Layers, Edit3, Save, Filter } from 'lucide-react';

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
    if (user.role !== 'admin') return alert("Ação bloqueada.");
    const pass = prompt("SEGURANÇA:\nDigite a SENHA MASTER do ADM para excluir:");
    if (pass === '12345678910') {
      if (confirm(`Excluir material "${name}"?`)) setInventory(prev => prev.filter(i => i.id !== id));
    } else if (pass !== null) {
      alert("Senha incorreta!");
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
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white uppercase">Controle de Estoque</h1>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar material..." className="w-full pl-12 pr-4 py-3 bg-[#161a21] border border-white/5 rounded-xl text-white outline-none focus:border-amber-600" />
        </div>
      </div>

      <div className="bg-[#161a21] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black/20 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">SAP</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Saldo</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-5 font-mono text-xs text-amber-600">#{item.sap}</td>
                <td className="px-8 py-5 text-sm font-black text-white uppercase tracking-tight">{item.material}</td>
                <td className="px-8 py-5 text-center">
                  {editingId === item.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <input type="number" value={editValue} onChange={e => setEditValue(Number(e.target.value))} className="w-20 bg-black/40 border border-amber-600 rounded p-1 text-center text-white" />
                      <button onClick={() => saveEdit(item.id)} className="text-emerald-500"><Save size={16} /></button>
                    </div>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-black ${item.quantity < 10 ? 'bg-red-500/10 text-red-500' : 'bg-amber-600/10 text-amber-600'}`}>{item.quantity} {item.und}</span>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  {user.role === 'admin' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-slate-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(item.id, item.material)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
