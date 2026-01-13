
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { CalendarEvent, User } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  user: User;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, setEvents, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const formatDay = (day: number) => {
    const d = day.toString().padStart(2, '0');
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${currentDate.getFullYear()}-${m}-${d}`;
  };

  const handleAddEvent = () => {
    if (user.role !== 'admin' || !newTitle || selectedDay === null) return;
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      date: formatDay(selectedDay),
      title: newTitle,
      description: newDesc
    };
    setEvents([...events, newEvent]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const removeEvent = (id: string) => {
    if (user.role !== 'admin') return;
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
            <CalendarIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Planejamento Mensal</h1>
            <p className="text-slate-500 font-medium">Agenda de atividades e obras.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-black text-sm uppercase tracking-widest text-slate-700 min-w-[150px] text-center">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {weekDays.map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dateStr = day ? formatDay(day) : '';
              const hasEvents = events.some(e => e.date === dateStr);
              return (
                <button
                  key={idx}
                  disabled={!day || (user.role !== 'admin' && !hasEvents)}
                  onClick={() => {
                    if (user.role === 'admin') {
                      setSelectedDay(day);
                      setShowAddModal(true);
                    }
                  }}
                  className={`h-24 border-r border-b border-slate-50 p-3 text-left transition-all relative ${!day ? 'bg-slate-50/30' : 'hover:bg-slate-50'} ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'ring-2 ring-inset ring-slate-900' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-black ${hasEvents ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                      {hasEvents && (
                        <div className="absolute bottom-3 right-3 flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                          {events.filter(e => e.date === dateStr).length > 1 && <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 space-y-6">
          <h2 className="font-black text-sm uppercase tracking-widest text-slate-900">Tarefas do Dia</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {events.filter(e => e.date === formatDay(selectedDay || new Date().getDate())).length > 0 ? (
              events
                .filter(e => e.date === formatDay(selectedDay || new Date().getDate()))
                .map(event => (
                  <div key={event.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight uppercase tracking-tight">{event.title}</h4>
                      {user.role === 'admin' && (
                        <button onClick={() => removeEvent(event.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{event.description}</p>
                  </div>
                ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Nada planejado</p>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => {
                      setSelectedDay(selectedDay || new Date().getDate());
                      setShowAddModal(true);
                    }}
                    className="mt-4 text-xs font-black text-slate-900 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={14} /> ADICIONAR NOTA
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && user.role === 'admin' && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-[200] px-4">
          <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-slideUp">
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter">Novo Registro</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Selecionada</p>
                <p className="font-bold text-slate-900 text-sm">{selectedDay} de {months[currentDate.getMonth()]} de {currentDate.getFullYear()}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título da Tarefa</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-5 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:border-slate-900 outline-none font-bold text-sm"
                    placeholder="Ex: Entrega de Cimento"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição (Opcional)</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-5 py-3 border border-slate-100 bg-slate-50 rounded-xl focus:border-slate-900 outline-none font-medium text-sm h-24 resize-none"
                    placeholder="Mais detalhes sobre a atividade..."
                  />
                </div>
              </div>

              <button
                onClick={handleAddEvent}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
              >
                SALVAR NO CALENDÁRIO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
