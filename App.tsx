
import React, { useState, useEffect } from 'react';
import { LogIn, LayoutDashboard, Package, PlusCircle, LogOut, Truck, Settings, Calendar as CalendarIcon, ShieldCheck, MessageSquare, ClipboardList, FileText, ReceiptText, User as UserIcon, Users as UsersIcon, Cpu, Zap, Send, Lock, UserCircle, HardHat } from 'lucide-react';
import { User, ViewState, StockItem, Machine, CalendarEvent, RequestItem, MovementRecord } from './types';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import StockEntry from './components/StockEntry';
import MovementView from './components/MovementView';
import CalendarView from './components/CalendarView';
import RequestsManager from './components/RequestsManager';
import MovementLog from './components/MovementLog';
import InvoicesLog from './components/InvoicesLog';
import ReceiptsView from './components/ReceiptsView';
import AccessManager from './components/AccessManager';

const INITIAL_USERS: Record<string, {password: string, role: 'admin' | 'user'}> = {
  'ADM': { password: '2000', role: 'admin' },
  'ITALO': { password: '2026', role: 'admin' },
  'MICHAEL': { password: '2026', role: 'admin' }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [movementHistory, setMovementHistory] = useState<MovementRecord[]>([]);
  const [usersDatabase, setUsersDatabase] = useState<Record<string, {password: string, role: 'admin' | 'user'}>>(INITIAL_USERS);
  const [loginError, setLoginError] = useState('');
  
  // States para a nova Barra de Solicitação de Campo
  const [fieldReqName, setFieldReqName] = useState('');
  const [fieldReqMaterial, setFieldReqMaterial] = useState('');

  useEffect(() => {
    const savedInv = localStorage.getItem('amox_inventory');
    const savedMac = localStorage.getItem('amox_machines');
    const savedEve = localStorage.getItem('amox_events');
    const savedReq = localStorage.getItem('amox_requests');
    const savedHistory = localStorage.getItem('amox_history');
    const savedUsers = localStorage.getItem('amox_users');
    
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedMac) setMachines(JSON.parse(savedMac));
    if (savedEve) setEvents(JSON.parse(savedEve));
    if (savedReq) setRequests(JSON.parse(savedReq));
    if (savedHistory) setMovementHistory(JSON.parse(savedHistory));
    
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      setUsersDatabase({ ...parsed, ...INITIAL_USERS });
    } else {
      setUsersDatabase(INITIAL_USERS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('amox_inventory', JSON.stringify(inventory));
    localStorage.setItem('amox_machines', JSON.stringify(machines));
    localStorage.setItem('amox_events', JSON.stringify(events));
    localStorage.setItem('amox_requests', JSON.stringify(requests));
    localStorage.setItem('amox_history', JSON.stringify(movementHistory));
    localStorage.setItem('amox_users', JSON.stringify(usersDatabase));
  }, [inventory, machines, events, requests, movementHistory, usersDatabase]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string).toUpperCase().trim();
    const password = (formData.get('password') as string).trim();

    const dbUser = usersDatabase[username];

    if (dbUser && dbUser.password === password) {
      const newUser: User = { username, isAuthenticated: true, role: dbUser.role };
      setUser(newUser);
      setLoginError('');
      setShowGreeting(true);
      setTimeout(() => setShowGreeting(false), 2000);
    } else {
      setLoginError('ACESSO NEGADO: VERIFIQUE SUAS CREDENCIAIS');
    }
  };

  const handleFieldRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldReqName.trim() || !fieldReqMaterial.trim()) return;

    const newRequest: RequestItem = {
      id: `REQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      requesterName: fieldReqName.toUpperCase(),
      itemDescription: fieldReqMaterial.toUpperCase(),
      date: new Date().toLocaleString('pt-BR'),
      status: 'Pendente'
    };

    setRequests(prev => [newRequest, ...prev]);
    setFieldReqName('');
    setFieldReqMaterial('');
    alert("SOLICITAÇÃO ENVIADA COM SUCESSO AO ADM.");
  };

  if (showGreeting && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white animate-pulse overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 blur-[120px] bg-amber-600/20 rounded-full"></div>
          <div className="relative glass p-20 rounded-full border border-amber-600/30 mb-10">
            <Cpu size={120} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-5xl font-black uppercase tracking-[0.4em] mb-4">AUTENTICADO</h1>
        <p className="mono text-amber-500/60 font-bold uppercase tracking-[0.5em] text-xs">OPERADOR: {user.username}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-start p-6 selection:bg-amber-500 selection:text-black font-sans relative overflow-y-auto">
        {/* Camada Decorativa de Background */}
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 py-12 md:py-24">
          
          {/* LADO ESQUERDO: TERMINAL DE LOGIN ADM */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 bg-amber-600/10 px-4 py-2 rounded-full border border-amber-500/20">
                  <ShieldCheck size={16} className="text-amber-500" />
                  <span className="mono text-[10px] font-black text-amber-500 uppercase tracking-widest">Acesso Administrativo</span>
               </div>
               <h1 className="text-7xl font-black text-white tracking-tighter uppercase leading-[0.85]">AMOX<br/><span className="text-amber-600">PIRI</span></h1>
               <p className="text-slate-500 font-bold text-sm max-w-sm uppercase tracking-tight">Sistema de Gerenciamento de Estoque e Logística de Obras v4.0</p>
            </div>

            <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
              <div className="scanner !opacity-5"></div>
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                    <p className="text-red-500 text-[10px] font-black mono text-center uppercase">{loginError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="relative group/input">
                    <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-amber-500 transition-colors" size={20} />
                    <input name="username" type="text" required className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white outline-none focus:border-amber-500/50 uppercase font-black mono text-xs transition-all" placeholder="USUÁRIO" />
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-amber-500 transition-colors" size={20} />
                    <input name="password" type="password" required className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white outline-none focus:border-amber-500/50 font-black mono text-xs transition-all" placeholder="SENHA" />
                  </div>
                </div>
                <button type="submit" className="neo-button w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-6 rounded-2xl uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-amber-900/40">
                  ENTRAR NO SISTEMA
                </button>
              </form>
            </div>
          </div>

          {/* LADO DIREITO: SOLICITAÇÃO DE MATERIAL VINCULADA */}
          <div className="flex flex-col justify-center">
             <div className="bg-[#101216] p-12 rounded-[4rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/5 blur-3xl rounded-full"></div>
                
                <div className="space-y-2">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/5 p-4 rounded-2xl">
                         <MessageSquare size={28} className="text-amber-500" />
                      </div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Central de Pedidos</h2>
                   </div>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Equipes de campo: Solicite materiais aqui sem precisar de login.</p>
                </div>

                <form onSubmit={handleFieldRequest} className="space-y-6">
                   <div className="space-y-4">
                      <div className="relative">
                         <UserIcon className="absolute left-6 top-5 text-slate-700" size={18} />
                         <input 
                           value={fieldReqName}
                           onChange={e => setFieldReqName(e.target.value)}
                           className="w-full pl-16 pr-8 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 uppercase font-bold text-xs" 
                           placeholder="NOME DO COLABORADOR OU EQUIPE"
                           required
                         />
                      </div>
                      <div className="relative">
                         <HardHat className="absolute left-6 top-5 text-slate-700" size={18} />
                         <textarea 
                           value={fieldReqMaterial}
                           onChange={e => setFieldReqMaterial(e.target.value)}
                           className="w-full pl-16 pr-8 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500/50 uppercase font-bold text-xs h-32 resize-none" 
                           placeholder="DESCREVA O MATERIAL E QUANTIDADE..."
                           required
                         />
                      </div>
                   </div>

                   <button type="submit" className="group w-full flex items-center justify-center gap-4 bg-white/[0.02] hover:bg-amber-600 border border-white/10 hover:border-amber-500 py-6 rounded-3xl transition-all text-white">
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Enviar Solicitação ao ADM</span>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </button>
                   
                   <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">O pedido será enviado para Italo ou Michael.</p>
                </form>
             </div>
          </div>
        </div>

        {/* CRÉDITOS DOUG */}
        <div className="relative pb-12 w-full flex justify-center">
           <div className="glass px-8 py-2 rounded-full border border-white/5">
              <span className="mono text-[10px] font-black text-white/20 uppercase tracking-[1em] ml-[1em]">BY: DOUG</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row text-slate-300">
      <nav className="w-full md:w-80 glass border-r border-white/5 flex flex-col shrink-0 sticky top-0 h-screen z-50 overflow-hidden">
        <div className="p-10 border-b border-white/5 flex items-center gap-5">
          <div className="bg-amber-600 p-3 rounded-2xl shadow-lg shadow-amber-900/40"><Package className="text-white" size={26} /></div>
          <div>
            <span className="font-black text-white tracking-tighter text-2xl block leading-none">AMOX PIRI</span>
            <span className="mono text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1 block">Industrial SGE</span>
          </div>
        </div>
        
        <div className="flex-1 p-8 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 ml-4">Monitoramento</p>
          <NavItem icon={<LayoutDashboard size={20} />} label="Terminal" active={activeView === ViewState.DASHBOARD} onClick={() => setActiveView(ViewState.DASHBOARD)} />
          <NavItem icon={<Package size={20} />} label="Inventário" active={activeView === ViewState.INVENTORY} onClick={() => setActiveView(ViewState.INVENTORY)} />
          <NavItem icon={<MessageSquare size={20} />} label="Solicitações" active={activeView === ViewState.REQUESTS} onClick={() => setActiveView(ViewState.REQUESTS)} count={requests.filter(r => r.status === 'Pendente').length} />
          
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-8 mb-4 ml-4">Logística</p>
          <NavItem icon={<CalendarIcon size={20} />} label="Agenda de Obras" active={activeView === ViewState.CALENDAR} onClick={() => setActiveView(ViewState.CALENDAR)} />
          <NavItem icon={<ClipboardList size={20} />} label="Data Logs" active={activeView === ViewState.MOVEMENT_LOG} onClick={() => setActiveView(ViewState.MOVEMENT_LOG)} />
          <NavItem icon={<FileText size={20} />} label="Relatórios" active={activeView === ViewState.INVOICES} onClick={() => setActiveView(ViewState.INVOICES)} />
          <NavItem icon={<ReceiptText size={20} />} label="Protocolos" active={activeView === ViewState.RECEIPTS} onClick={() => setActiveView(ViewState.RECEIPTS)} />
          
          {user.role === 'admin' && (
            <>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-8 mb-4 ml-4">Root Access</p>
              <NavItem icon={<UsersIcon size={20} />} label="Acessos" active={activeView === ViewState.MANAGE_ACCESS} onClick={() => setActiveView(ViewState.MANAGE_ACCESS)} />
              <NavItem icon={<PlusCircle size={20} />} label="Carga em Lote" active={activeView === ViewState.ADD_ITEMS} onClick={() => setActiveView(ViewState.ADD_ITEMS)} />
            </>
          )}
          
          <div className="pt-8 pb-12">
            <button 
              onClick={() => setActiveView(ViewState.MOV_MATERIAL)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.15em] border ${activeView === ViewState.MOV_MATERIAL ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/30 border-amber-500' : 'bg-white/5 text-amber-500 border-amber-600/20 hover:bg-amber-600/10'}`}
            >
              <Truck size={20} /> Movimentar
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col gap-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-white shadow-lg">{user.username.charAt(0)}</div>
               <div className="flex flex-col">
                 <span className="text-xs font-black text-white tracking-tight uppercase">{user.username}</span>
                 <span className="mono text-[8px] text-slate-500 uppercase">{user.role} active</span>
               </div>
            </div>
            <button onClick={() => setUser(null)} className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
          <div className="text-center">
            <p className="mono text-[9px] font-black text-white/10 uppercase tracking-[0.6em]">BY: DOUG</p>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
          {activeView === ViewState.DASHBOARD && <Dashboard inventory={inventory} setView={setActiveView} user={user} setRequests={setRequests} />}
          {activeView === ViewState.INVENTORY && <InventoryTable inventory={inventory} setInventory={setInventory} user={user} />}
          {activeView === ViewState.REQUESTS && <RequestsManager requests={requests} setRequests={setRequests} user={user} />}
          {activeView === ViewState.CALENDAR && <CalendarView events={events} setEvents={setEvents} user={user} />}
          {activeView === ViewState.MOVEMENT_LOG && <MovementLog history={movementHistory} setHistory={setMovementHistory} user={user} />}
          {activeView === ViewState.INVOICES && <InvoicesLog history={movementHistory} setHistory={setMovementHistory} user={user} />}
          {activeView === ViewState.RECEIPTS && <ReceiptsView history={movementHistory} setHistory={setMovementHistory} user={user} />}
          {activeView === ViewState.ADD_ITEMS && <StockEntry onSuccess={() => setActiveView(ViewState.INVENTORY)} setInventory={setInventory} inventory={inventory} currentUser={user} setHistory={setMovementHistory} />}
          {activeView === ViewState.MOV_MATERIAL && <MovementView type="material" items={inventory} setItems={setInventory} currentUser={user} setHistory={setMovementHistory} />}
          {activeView === ViewState.MANAGE_ACCESS && <AccessManager usersDatabase={usersDatabase} setUsersDatabase={setUsersDatabase} currentUser={user} />}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full group flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-4">
      <div className={`transition-colors ${active ? 'text-amber-500' : 'group-hover:text-amber-500'}`}>{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </div>
    {count !== undefined && count > 0 && <span className="bg-amber-600 text-white text-[9px] w-5 h-5 rounded-lg flex items-center justify-center font-black animate-pulse">{count}</span>}
  </button>
);

export default App;
