
import React, { useState } from 'react';
import { Send, ArrowLeft, MessageSquare, CheckCircle, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { RequestItem } from '../types';

interface PublicPortalProps {
  onBack: () => void;
  onAddRequest: (req: RequestItem) => void;
}

const PublicPortal: React.FC<PublicPortalProps> = ({ onBack, onAddRequest }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !desc) return;

    const newReq: RequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      requesterName: name,
      itemDescription: desc,
      date: new Date().toLocaleString('pt-BR'),
      status: 'Pendente'
    };

    onAddRequest(newReq);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#12151c] p-12 rounded-[3rem] shadow-2xl border border-white/5 space-y-6">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle className="text-emerald-500" size={48} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pedido Enviado!</h2>
          <p className="text-slate-500 text-sm font-medium">Sua solicitação foi enviada para o Almoxarifado da Subestação Piripiri. O ITALO ou o MICHAEL irão analisar o pedido.</p>
          <button 
            onClick={onBack}
            className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-900/20"
          >
            VOLTAR AO PORTAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-600"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl"></div>

      <div className="max-w-xl w-full bg-[#12151c] rounded-[3rem] shadow-3xl overflow-hidden border border-white/5">
        <div className="bg-[#161a21] p-10 text-white border-b border-white/5">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 hover:text-white transition-all mb-8">
            <ArrowLeft size={16} /> Voltar para Login
          </button>
          
          <div className="flex items-center gap-5">
            <div className="bg-amber-600 p-4 rounded-2xl shadow-lg">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Portal do Colaborador</h1>
              <div className="flex items-center gap-3 mt-2 text-slate-500">
                <MapPin size={12} className="text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Almoxarifado Subestação Piripiri</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 mb-2">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed text-center">
              Use este canal para solicitar ferramentas, EPIs ou materiais de serviço diretamente ao estoque.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Quem está solicitando?</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              placeholder="SEU NOME OU NOME DA EQUIPE"
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500 outline-none font-black text-white text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Descrição do Material</label>
            <textarea 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Descreva detalhadamente o que você precisa e a quantidade..."
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-500 outline-none font-medium text-white text-sm h-44 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 text-slate-600 text-[9px] font-bold uppercase tracking-widest px-2">
            <Clock size={12} />
            <span>Seu pedido será registrado às {new Date().toLocaleTimeString()}</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
          >
            <Send size={20} /> Enviar Solicitação
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicPortal;
