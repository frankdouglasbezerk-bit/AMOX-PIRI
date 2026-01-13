
import React, { useState } from 'react';
import { StockItem, ViewState, User, RequestItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Package, TrendingUp, History, PlusCircle, Truck, Settings, Calendar, ShieldCheck, ArrowRight, MessageSquare, Activity, Send } from 'lucide-react';

interface DashboardProps {
  inventory: StockItem[];
  setView: (view: ViewState) => void;
  user: User;
  setRequests?: React.Dispatch<React.SetStateAction<RequestItem[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, setView, user, setRequests }) => {
  const [quickRequest, setQuickRequest] = useState('');
  
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const lowStock = inventory.filter(item => item.quantity < 10).length;

  const chartData = [...inventory]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map(item => ({
      name: item.material.length > 12 ? item.material.substring(0, 10) + '..' : item.material,
      valor: item.quantity,
      originalName: item.material
    }));

  const COLORS = ['#ff9d00', '#ffb700', '#ffd000', '#ffe900', '#fff200', '#ffff00'];

  const handleSendQuickRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRequest.trim() || !setRequests) return;
    
    const newReq: RequestItem = {
      id: Math.random().toString(36).substr(2, 9),
      requesterName: user.username,
      itemDescription: quickRequest,
      date: new Date().toLocaleString('pt-BR'),
      status: 'Pendente'
    };
    
    setRequests(prev => [newReq, ...prev]);
    setQuickRequest('');
    alert("Solicitação registrada com sucesso!");
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-24">
      {/* Header e Barra de Solicitação Adm */}
      <div className="flex flex-col gap-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-amber-500 animate-pulse" size={20} />
              <span className="mono text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">System Status: Online</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CORE TERMINAL</h1>
            <p className="text-slate-500 font-medium mt-4">Bem-vindo ao centro de comando, <span className="text-white font-black">{user.username}</span>.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="glass px-8 py-5 rounded-[2rem] border border-white/10 flex items-center gap-4">
              <Calendar size={20} className="text-amber-500" />
              <div className="flex flex-col">
                <span className="mono text-[10px] font-black text-white uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                <span className="text-xs font-bold text-slate-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Solicitação vinculada ao ADM */}
        {user.role === 'admin' && (
          <div className="glass-card p-6 rounded-[2rem] border-amber-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <form onSubmit={handleSendQuickRequest} className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="bg-amber-600/10 p-4 rounded-2xl">
                <MessageSquare className="text-amber-500" size={24} />
              </div>
              <div className="flex-1 w-full">
                <p className="mono text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2">Internal Request Bar</p>
                <input 
                  type="text" 
                  value={quickRequest}
                  onChange={(e) => setQuickRequest(e.target.value)}
                  placeholder="DIGITE AQUI SUA SOLICITAÇÃO RÁPIDA DE MATERIAL..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-sm font-black text-white outline-none focus:border-amber-500/50 transition-all uppercase"
                />
              </div>
              <button 
                type="submit"
                className="neo-button bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap"
              >
                <Send size={16} /> REGISTRAR PEDIDO
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard label="Catalogados" value={totalItems} icon={<Package size={28} />} sub="Itens SAP" variant="blue" />
        <MetricCard label="Volume" value={totalQuantity} icon={<TrendingUp size={28} />} sub="Unidades Totais" variant="amber" />
        <MetricCard label="Alertas" value={lowStock} icon={<AlertCircle size={28} />} sub="Estoque Crítico" variant={lowStock > 0 ? "red" : "glass"} />
        <MetricCard label="Solicitações" value="Central" icon={<MessageSquare size={28} />} sub="Tickets Ativos" variant="glass" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 glass-card p-12 rounded-[4rem] relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Fluxo de Materiais</h4>
              <p className="mono text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Distribuição de Saldo Top 6</p>
            </div>
            <button onClick={() => setView(ViewState.INVENTORY)} className="mono text-[10px] font-black uppercase text-amber-500 hover:text-white flex items-center gap-3 bg-amber-500/10 px-6 py-3 rounded-full transition-all">
              FULL REPORT <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-96 w-full relative z-10">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10, fontWeight: 800}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,157,0,0.05)', radius: 16}}
                    contentStyle={{backgroundColor: '#0a0a0a', borderRadius: '24px', border: '1px solid rgba(255,157,0,0.2)', padding: '20px'}}
                    itemStyle={{color: '#ff9d00', fontWeight: 900, fontSize: '12px'}}
                    labelStyle={{fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', color: '#fff', fontSize: '10px', letterSpacing: '2px'}}
                  />
                  <Bar dataKey="valor" radius={[12, 12, 12, 12]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-800 font-black uppercase text-[12px] tracking-[0.5em]">Aguardando Dados...</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-[3rem]">
            <h4 className="mono text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Comandos Rápidos</h4>
            <div className="space-y-4">
              <QuickButton onClick={() => setView(ViewState.REQUESTS)} icon={<MessageSquare size={20} className="text-amber-500" />} label="Solicitações" desc="Novos Pedidos" />
              <QuickButton onClick={() => setView(ViewState.MOV_MATERIAL)} icon={<Truck size={20} className="text-amber-500" />} label="Movimentação" desc="Batch Transfer" />
              <QuickButton onClick={() => setView(ViewState.CALENDAR)} icon={<Calendar size={20} className="text-amber-500" />} label="Agenda" desc="Schedule" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-amber-900/40 relative overflow-hidden group">
            <div className="scanner !opacity-10"></div>
            <h4 className="mono text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Bulk Data Entry</h4>
            <p className="text-lg font-black mb-8 leading-tight tracking-tight">Importação direta de planilhas SAP e Excel.</p>
            <button 
              onClick={() => setView(ViewState.ADD_ITEMS)}
              className="neo-button w-full flex items-center justify-center gap-4 p-5 bg-white text-amber-800 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black hover:text-white transition-all"
            >
              <PlusCircle size={20} /> IMPORT LOTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, sub, variant }: any) => {
  const styles: Record<string, string> = {
    amber: "border-amber-500/20 text-white hover:border-amber-500/50 shadow-amber-900/10",
    blue: "border-blue-500/20 text-white hover:border-blue-500/50 shadow-blue-900/10",
    red: "bg-red-950/20 border-red-500/30 text-red-500 hover:border-red-500 shadow-red-900/10",
    glass: "glass-card text-white"
  };

  return (
    <div className={`glass-card p-10 rounded-[3rem] h-64 flex flex-col justify-between group ${styles[variant] || styles.glass}`}>
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${variant === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-400'}`}>
          {icon}
        </div>
        <div className="mono text-[9px] font-black uppercase tracking-widest opacity-40">{sub}</div>
      </div>
      <div>
        <h3 className="text-5xl font-black tracking-tighter mb-2 leading-none">{value}</h3>
        <p className="mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">{label}</p>
      </div>
    </div>
  );
};

const QuickButton = ({ onClick, icon, label, desc }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 glass hover:bg-amber-600/10 group rounded-2xl transition-all border border-white/5">
    <div className="flex items-center gap-5">
      <div className="bg-white/5 p-3 rounded-xl group-hover:bg-amber-600/20 transition-all">{icon}</div>
      <div className="text-left">
        <p className="font-black uppercase tracking-tight text-[12px] group-hover:text-amber-500 transition-colors">{label}</p>
        <p className="mono text-[8px] opacity-40 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </div>
    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
  </button>
);

export default Dashboard;
