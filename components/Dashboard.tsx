
import React from 'react';
import { StockItem, ViewState, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Package, TrendingUp, History, PlusCircle, Truck, Settings, Calendar, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';

interface DashboardProps {
  inventory: StockItem[];
  setView: (view: ViewState) => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, setView, user }) => {
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

  const COLORS = ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'];

  return (
    <div className="space-y-12 animate-fadeIn pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Monitoramento</h1>
          <p className="text-slate-500 font-medium">Controle centralizado para <span className="text-amber-500 font-bold">{user.username}</span>.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#161a21] px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Calendar size={16} className="text-amber-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          {user.role === 'admin' && (
            <div className="bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Acesso Root</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Itens em SAP" value={totalItems} icon={<Package size={24} />} trend="Catalogados" color="bg-[#161a21] text-white border-white/5" />
        <MetricCard label="Volume Total" value={totalQuantity} icon={<TrendingUp size={24} />} trend="UND" color="bg-amber-600 text-white" />
        <MetricCard label="Nível Crítico" value={lowStock} icon={<AlertCircle size={24} />} trend="Reposição" color={lowStock > 0 ? "bg-red-600 text-white" : "bg-[#161a21] text-slate-500 border-white/5"} />
        <MetricCard label="Solicitações" value="Públicas" icon={<MessageSquare size={24} />} trend="Ativas" color="bg-slate-800 text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-[#161a21] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter">Materiais em Alta</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Saldo por Unidade</p>
            </div>
            <button onClick={() => setView(ViewState.INVENTORY)} className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-2">
              Inventário <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-80 w-full relative z-10">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 9, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 9, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)', radius: 12}}
                    contentStyle={{backgroundColor: '#1f2937', borderRadius: '16px', border: 'none', padding: '16px'}}
                    labelStyle={{fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', color: '#fff', fontSize: '10px'}}
                  />
                  <Bar dataKey="valor" radius={[8, 8, 8, 8]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 font-black uppercase text-[10px]">Sem dados</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#161a21] p-8 rounded-[2.5rem] border border-white/5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6">Operacional</h4>
            <div className="space-y-3">
              <QuickButton onClick={() => setView(ViewState.REQUESTS)} icon={<MessageSquare size={18} className="text-amber-500" />} label="Solicitações" desc="Ver novos pedidos" />
              <QuickButton onClick={() => setView(ViewState.MOV_MATERIAL)} icon={<Truck size={18} className="text-amber-500" />} label="Movimentação" desc="Entrada/Saída" />
              <QuickButton onClick={() => setView(ViewState.CALENDAR)} icon={<Calendar size={18} className="text-amber-500" />} label="Agenda" desc="Tarefas do Mês" />
            </div>
          </div>

          <div className="bg-amber-600 p-8 rounded-[2.5rem] text-white">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Ações Rápidas</h4>
            <p className="text-sm font-bold mb-6 leading-tight">Precisa importar uma lista de materiais vinda do SAP/Excel?</p>
            <button 
              onClick={() => setView(ViewState.ADD_ITEMS)}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white text-amber-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all shadow-lg shadow-amber-900/40"
            >
              <PlusCircle size={18} /> IMPORTAR LOTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, trend, color }: any) => (
  <div className={`p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between h-56 transition-transform hover:scale-105 duration-300 ${color}`}>
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">{trend}</div>
    </div>
    <div>
      <h3 className="text-5xl font-black tracking-tighter mb-1">{value}</h3>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{label}</p>
    </div>
  </div>
);

const QuickButton = ({ onClick, icon, label, desc }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-amber-600 hover:text-white group rounded-2xl transition-all border border-white/5">
    <div className="flex items-center gap-4">
      <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-white/20">{icon}</div>
      <div className="text-left">
        <p className="font-black uppercase tracking-tight text-[11px]">{label}</p>
        <p className="text-[8px] opacity-40 font-bold uppercase tracking-widest">{desc}</p>
      </div>
    </div>
    <ArrowRight size={14} className="opacity-20 group-hover:opacity-100" />
  </button>
);

export default Dashboard;
