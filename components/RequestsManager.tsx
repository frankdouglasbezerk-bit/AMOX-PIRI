
import React from 'react';
import { MessageSquare, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { RequestItem, User } from '../types';

interface RequestsManagerProps {
  requests: RequestItem[];
  setRequests: React.Dispatch<React.SetStateAction<RequestItem[]>>;
  user: User;
}

const RequestsManager: React.FC<RequestsManagerProps> = ({ requests, setRequests, user }) => {
  
  const updateStatus = (id: string, status: 'Atendido' | 'Recusado') => {
    // Agora permitido para todos os acessos
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const removeRequest = (id: string) => {
    // Agora permitido para todos os acessos
    if(confirm('Remover solicitação da lista permanentemente?')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Solicitações Recebidas</h1>
        <p className="text-slate-500 font-medium">Gerenciamento de pedidos externos - Acesso Liberado para Todos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.length > 0 ? (
          requests.sort((a,b) => a.status === 'Pendente' ? -1 : 1).map((req) => (
            <div key={req.id} className={`bg-[#161a21] p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col justify-between transition-all hover:border-amber-500/30 ${req.status !== 'Pendente' ? 'opacity-60' : ''}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    req.status === 'Pendente' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                    req.status === 'Atendido' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{req.date}</span>
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase mb-1">{req.requesterName}</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">{req.itemDescription}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                {req.status === 'Pendente' && (
                  <>
                    <button 
                      onClick={() => updateStatus(req.id, 'Atendido')}
                      className="flex-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase border border-emerald-500/20"
                    >
                      <CheckCircle size={14} /> Atender
                    </button>
                    <button 
                      onClick={() => updateStatus(req.id, 'Recusado')}
                      className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase border border-red-500/20"
                    >
                      <XCircle size={14} /> Recusar
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => removeRequest(req.id)}
                  className="p-3 bg-white/5 hover:bg-red-600/20 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                  title="Apagar solicitação"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center opacity-20">
            <MessageSquare size={80} className="mx-auto mb-4" />
            <p className="text-white font-black uppercase tracking-[0.2em]">Nenhuma solicitação no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsManager;
