
import React, { useState } from 'react';
import { ClipboardList, Search, ArrowUpRight, ArrowDownLeft, User as UserIcon, Calendar, Clock, Filter, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { MovementRecord, User } from '../types';

interface MovementLogProps {
  history: MovementRecord[];
  setHistory: React.Dispatch<React.SetStateAction<MovementRecord[]>>;
  user: User;
}

const MovementLog: React.FC<MovementLogProps> = ({ history, setHistory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(h => 
    h.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.sap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRecord = (id: string) => {
    if (user.role !== 'admin') {
      alert("ACESSO NEGADO.");
      return;
    }

    const password = prompt("AUTENTICAÇÃO DE SEGURANÇA:\nDigite a SENHA DO ADM para apagar este registro do histórico:");
    
    if (password === '12345678910') {
      if (confirm('Deseja realmente apagar este registro de movimentação? Isso não reverte o saldo do estoque, apenas remove do histórico.')) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } else if (password !== null) {
      alert("SENHA INCORRETA! Registro preservado.");
    }
  };

  // Resumo por acesso (Italo, Michael, ADM)
  const users = ['ITALO', 'MICHAEL', 'ADM'];
  const summary = users.map(u => {
    const userMoves = history.filter(h => h.userId.toUpperCase() === u);
    const totalIn = userMoves.filter(h => h.type === 'Entrada').reduce((acc, h) => acc + h.quantity, 0);
    const totalOut = userMoves.filter(h => h.type === 'Saída').reduce((acc, h) => acc + h.quantity, 0);
    return { user: u, totalIn, totalOut };
  });

  return (
    <div className="space-y-10 animate-fadeIn font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Painel de Controle</h1>
          <p className="text-slate-500 font-medium">Monitoramento de Entradas e Saídas por Operador.</p>
        </div>
        
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-amber-500" size={20} />
          <input
            type="text"
            placeholder="Filtrar histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-[#161a21] border border-white/5 rounded-2xl text-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-sm"
          />
        </div>
      </div>

      {/* QUADRO DE ACESSO - RESUMO DOS 3 USUÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summary.map(item => (
          <div key={item.user} className="bg-[#161a21] p-6 rounded-[2rem] border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${item.user === 'ADM' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                {item.user.charAt(0)}
              </div>
              <div>
                <p className="font-black text-white text-sm">{item.user}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Resumo Operacional</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center gap-2 text-emerald-500 mb-1">
                  <TrendingUp size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Chegou</span>
                </div>
                <p className="text-xl font-black text-white">{item.totalIn}</p>
              </div>
              <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-2 text-red-500 mb-1">
                  <TrendingDown size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Foi</span>
                </div>
                <p className="text-xl font-black text-white">{item.totalOut}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#161a21] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data/Hora</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operador</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Material</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Quantidade</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">{record.date}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-white font-black text-xs uppercase tracking-tight">{record.userId}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                        record.type === 'Entrada' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {record.type === 'Entrada' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {record.type}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col max-w-xs">
                        <span className="text-white font-black text-xs uppercase tracking-tight leading-tight">{record.material}</span>
                        <span className="text-[10px] text-slate-600 font-mono mt-1">SAP: {record.sap}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`inline-block min-w-[60px] px-4 py-2 rounded-xl text-xs font-black ${
                        record.type === 'Entrada' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'
                      }`}>
                        {record.type === 'Entrada' ? '+' : '-'}{record.quantity}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       {user.role === 'admin' && (
                         <button 
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                         >
                          <Trash2 size={16} />
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <ClipboardList size={80} className="text-slate-800 opacity-20" />
                      <p className="font-black text-white uppercase tracking-[0.4em] text-sm opacity-20">Nenhum registro</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovementLog;
