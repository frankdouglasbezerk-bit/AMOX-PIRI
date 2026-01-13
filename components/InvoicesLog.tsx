
import React, { useState } from 'react';
import { FileText, Search, User as UserIcon, UserCheck, Package, Hash, ArrowUpRight, Clock, Trash2 } from 'lucide-react';
import { MovementRecord, User } from '../types';

interface InvoicesLogProps {
  history: MovementRecord[];
  setHistory: React.Dispatch<React.SetStateAction<MovementRecord[]>>;
  user: User;
}

const InvoicesLog: React.FC<InvoicesLogProps> = ({ history, setHistory, user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra apenas as Saídas
  const exits = history.filter(h => h.type === 'Saída');

  const filteredExits = exits.filter(h => 
    h.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.sap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.recipient && h.recipient.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteRecord = (id: string) => {
    if (user.role !== 'admin') {
      alert("ACESSO NEGADO.");
      return;
    }

    const password = prompt("AUTENTICAÇÃO DE SEGURANÇA:\nDigite a SENHA DO ADM (2000) para apagar esta saída do relatório:");
    
    if (password === '2000') {
      if (confirm('Deseja realmente apagar este registro de saída? Isso não reverte o saldo do estoque.')) {
        setHistory(prev => prev.filter(h => h.id !== id));
      }
    } else if (password !== null) {
      alert("SENHA INCORRETA! Operação bloqueada.");
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Notas Fiscais / Saídas</h1>
          <p className="text-slate-500 font-medium">Relatório detalhado de todos os materiais retirados do estoque.</p>
        </div>
        
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-amber-500" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por material ou destinatário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-[#161a21] border border-white/5 rounded-2xl text-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="bg-[#161a21] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data / Hora</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operador</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Destinatário</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Material / SAP</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Qtde</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExits.length > 0 ? (
                filteredExits.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">{record.date.split(' ')[0]}</span>
                        <span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono uppercase mt-0.5"><Clock size={10} /> {record.date.split(' ')[1]}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-tight">
                        <UserIcon size={14} className="text-slate-600" />
                        {record.userId}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <UserCheck size={14} className="text-amber-500" />
                        <span className="text-amber-500 font-black text-xs uppercase tracking-tight">{record.recipient || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col max-w-xs">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Package size={12} className="text-slate-500" />
                          <span className="text-white font-black text-[11px] uppercase tracking-tight leading-tight">{record.material}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-600 font-mono">SAP: {record.sap}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <ArrowUpRight size={14} />
                        <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-red-500/10 border border-red-500/20">
                          {record.quantity}
                        </span>
                      </div>
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
                      <div className="p-8 bg-white/5 rounded-full animate-pulse">
                        <FileText size={80} className="text-slate-800" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase tracking-[0.4em] text-sm">Sem Notas Fiscais</p>
                        <p className="text-slate-600 text-[10px] font-bold mt-2 uppercase tracking-widest">Aguardando a primeira saída de material.</p>
                      </div>
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

export default InvoicesLog;
