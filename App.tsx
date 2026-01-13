
import React, { useState, useEffect } from 'react';
import { LogIn, LayoutDashboard, Package, PlusCircle, LogOut, Truck, Settings, Calendar as CalendarIcon, ShieldCheck, MessageSquare, ExternalLink, ClipboardList, FileText, ReceiptText, User as UserIcon, Users as UsersIcon } from 'lucide-react';
import { User, ViewState, StockItem, Machine, CalendarEvent, RequestItem, MovementRecord } from './types';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import StockEntry from './components/StockEntry';
import MovementView from './components/MovementView';
import CalendarView from './components/CalendarView';
import RequestsManager from './components/RequestsManager';
import PublicPortal from './components/PublicPortal';
import MovementLog from './components/MovementLog';
import InvoicesLog from './components/InvoicesLog';
import ReceiptsView from './components/ReceiptsView';
import AccessManager from './components/AccessManager';

const INITIAL_USERS: Record<string, {password: string, role: 'admin' | 'user'}> = {
  'ITALO': { password: '2026', role: 'user' },
  'MICHAEL': { password: '2026', role: 'user' },
  'ADM': { password: '12345678910', role: 'admin' }
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
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [loginError, setLoginError] = useState('');

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
    if (savedUsers) setUsersDatabase(JSON.parse(savedUsers));
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
    const username = (formData.get('username') as string).toUpperCase();
    const password = formData.get('password') as string;

    const dbUser = usersDatabase[username];

    if (dbUser && dbUser.password === password) {
      const newUser: User = { username, isAuthenticated: true, role: dbUser.role };
      setUser(newUser);
      setLoginError('');
      setShowGreeting(true);
      setTimeout(() => setShowGreeting(false), 2000);
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  if (isPublicMode) {
    return <PublicPortal onBack={() => setIsPublicMode(false)} onAddRequest={(req) => setRequests([...requests, req])} />;
  }

  if (showGreeting && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] text-white animate-fadeIn">
        <div className="bg-amber-600/10 p-8 rounded-[3rem] border border-amber-600/20 mb-8 animate-bounce">
            <UserIcon size={80} className="text-amber-600" />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Olá, {user.username}!</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Acessando sistema...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4 font-sans">
        <div className="max-w-md w-full bg-[#12151c] rounded-[2rem] shadow-2xl border border-white/5">
          <div className="p-10 text-white text-center border-b border-white/5">
            <div className="bg-amber-600/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-600/30">
              <ShieldCheck size={40} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">AMOX PIRI</h1>
            <p className="text-slate-500 mt-1 text-[10px] font-black tracking-widest uppercase">Gestão de Estoque</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-10 space-y-5">
            {loginError && <p className="text-red-500 text-xs text-center font-bold">{loginError}</p>}
            <input name="username" type="text" required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-amber-600 uppercase font-bold" placeholder="USUÁRIO" />
            <input name="password" type="password" required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-amber-600 font-bold" placeholder="SENHA" />
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all">ENTRAR</button>
          </form>

          <div className="p-6 text-center">
            <button onClick={() => setIsPublicMode(true)} className="text-[10px] font-black text-amber-600 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
              <ExternalLink size={14} /> Fazer Pedido Externo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col md:flex-row text-slate-300">
      <nav className="w-full md:w-72 bg-[#161a21] border-r border-white/5 flex flex-col shrink-0 sticky top-0 h-screen z-50">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="bg-amber-600 p-2.5 rounded-xl"><Package className="text-white" size={24} /></div>
          <div><span className="font-black text-white tracking-tighter text-xl block leading-none">AMOX PIRI</span><span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">SGE v2.0</span></div>
        </div>
        <div className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="Início" active={activeView === ViewState.DASHBOARD} onClick={() => setActiveView(ViewState.DASHBOARD)} />
          <NavItem icon={<Package size={20} />} label="Estoque" active={activeView === ViewState.INVENTORY} onClick={() => setActiveView(ViewState.INVENTORY)} />
          <NavItem icon={<MessageSquare size={20} />} label="Pedidos" active={activeView === ViewState.REQUESTS} onClick={() => setActiveView(ViewState.REQUESTS)} count={requests.filter(r => r.status === 'Pendente').length} />
          <NavItem icon={<ClipboardList size={20} />} label="Histórico" active={activeView === ViewState.MOVEMENT_LOG} onClick={() => setActiveView(ViewState.MOVEMENT_LOG)} />
          <NavItem icon={<FileText size={20} />} label="Notas" active={activeView === ViewState.INVOICES} onClick={() => setActiveView(ViewState.INVOICES)} />
          <NavItem icon={<ReceiptText size={20} />} label="Recibos" active={activeView === ViewState.RECEIPTS} onClick={() => setActiveView(ViewState.RECEIPTS)} />
          {user.role === 'admin' && (
            <>
              <div className="h-px bg-white/5 my-4"></div>
              <NavItem icon={<UsersIcon size={20} />} label="Gerenciar Acesso" active={activeView === ViewState.MANAGE_ACCESS} onClick={() => setActiveView(ViewState.MANAGE_ACCESS)} />
              <NavItem icon={<PlusCircle size={20} />} label="Carga em Lote" active={activeView === ViewState.ADD_ITEMS} onClick={() => setActiveView(ViewState.ADD_ITEMS)} />
            </>
          )}
          <div className="h-px bg-white/5 my-4"></div>
          <NavItem icon={<Truck size={20} />} label="Retirada/Entrada" active={activeView === ViewState.MOV_MATERIAL} onClick={() => setActiveView(ViewState.MOV_MATERIAL)} />
        </div>
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-black text-white text-xs">{user.username.charAt(0)}</div>
             <span className="text-xs font-black text-white">{user.username}</span>
          </div>
          <button onClick={() => setUser(null)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"><LogOut size={18} /></button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto bg-[#0a0c10] p-6 md:p-10">
          {activeView === ViewState.DASHBOARD && <Dashboard inventory={inventory} setView={setActiveView} user={user} />}
          {activeView === ViewState.INVENTORY && <InventoryTable inventory={inventory} setInventory={setInventory} user={user} />}
          {activeView === ViewState.REQUESTS && <RequestsManager requests={requests} setRequests={setRequests} user={user} />}
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
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wider ${active ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
    <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
    {count !== undefined && count > 0 && <span className="bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
  </button>
);

export default App;
