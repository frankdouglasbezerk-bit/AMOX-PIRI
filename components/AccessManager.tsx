
import React, { useState } from 'react';
import { Users, UserPlus, Key, Trash2, Shield, CheckCircle2, Lock } from 'lucide-react';
import { User as UserType } from '../types';

interface AccessManagerProps {
  usersDatabase: Record<string, {password: string, role: 'admin' | 'user'}>;
  setUsersDatabase: React.Dispatch<React.SetStateAction<Record<string, {password: string, role: 'admin' | 'user'}>>>;
  currentUser: UserType;
}

const AccessManager: React.FC<AccessManagerProps> = ({ usersDatabase, setUsersDatabase, currentUser }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Senha Master agora é 2000 conforme solicitado para o ADM
  const MASTER_PASSWORD = '2000';

  const validateMaster = () => {
    const pass = prompt("SEGURANÇA ADM:\nDigite a SENHA DO ADM (2000) para autorizar esta alteração:");
    return pass === MASTER_PASSWORD;
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    if (!validateMaster()) return alert("Senha incorreta!");

    const upper = newUsername.toUpperCase();
    setUsersDatabase(prev => ({ ...prev, [upper]: { password: newPassword, role: newRole } }));
    setNewUsername(''); setNewPassword(''); setShowAddForm(false);
  };

  const handleChangePass = (name: string) => {
    const next = prompt(`Nova senha para ${name}:`);
    if (next && validateMaster()) {
      setUsersDatabase(prev => ({ ...prev, [name]: { ...prev[name], password: next } }));
      alert("Senha alterada.");
    }
  };

  const handleDelete = (name: string) => {
    if (name === 'ADM') return alert("O ADM raiz não pode ser excluído.");
    if (validateMaster() && confirm(`Remover acesso de ${name}?`)) {
      setUsersDatabase(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Gerenciar Acessos</h1>
          <p className="text-slate-500 text-sm">Controle de operadores e permissões do sistema.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all">
          <UserPlus size={18} /> Novo Acesso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(usersDatabase) as [string, {password: string, role: 'admin' | 'user'}][]).map(([name, data]) => (
          <div key={name} className="bg-[#161a21] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white ${data.role === 'admin' ? 'bg-amber-600' : 'bg-slate-800'}`}>{name.charAt(0)}</div>
               <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${data.role === 'admin' ? 'bg-amber-600/10 text-amber-500 border-amber-600/20' : 'bg-white/5 text-slate-500'}`}>{data.role}</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-4">{name}</h3>
            <div className="flex gap-2">
              <button onClick={() => handleChangePass(name)} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2"><Key size={14} /> Senha</button>
              {name !== 'ADM' && <button onClick={() => handleDelete(name)} className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>}
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#12151c] w-full max-w-sm rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="p-8 bg-amber-600 text-white"><h2 className="text-xl font-black uppercase">Novo Operador</h2></div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="NOME" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white uppercase font-bold outline-none focus:border-amber-600" required />
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="SENHA INICIAL" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-600" required />
              <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none">
                <option value="user" className="bg-[#12151c]">OPERADOR</option>
                <option value="admin" className="bg-[#12151c]">ADMINISTRADOR</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 text-slate-500 font-black text-xs">CANCELAR</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessManager;
